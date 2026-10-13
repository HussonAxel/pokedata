import {
  ability,
  abilityName,
  pokemon,
  pokemonAbility,
  pokemonType,
  species,
  speciesName,
} from "@pokedata/db/schema/catalog";
import { and, asc, eq, lte } from "drizzle-orm";
import { z } from "zod";

import { abilityDescription } from "../ability-description";
import { formSuffix } from "../evolution-family";
import { publicProcedure } from "../index";
import { LATEST_GENERATION } from "./pokedex";

/** Les talents cachés apparaissent en génération 5 (Noir et Blanc). */
const HIDDEN_ABILITY_GENERATION = 5;

const detail = publicProcedure
  .input(
    z.object({
      identifier: z.string().min(1).max(80),
      locale: z.enum(["fr", "en"]).default("fr"),
      generationId: z.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION),
    }),
  )
  .handler(async ({ context, input }) => {
    const [entry] = await context.db
      .select({
        id: ability.id,
        identifier: ability.identifier,
        name: abilityName.name,
        introducedIn: ability.generationId,
        description: abilityDescription(input.locale, input.generationId),
      })
      .from(ability)
      .innerJoin(
        abilityName,
        and(eq(abilityName.abilityId, ability.id), eq(abilityName.language, input.locale)),
      )
      .where(
        and(
          eq(ability.identifier, input.identifier),
          lte(ability.generationId, input.generationId),
        ),
      )
      .limit(1);

    if (!entry) return null;

    const holders = await context.db
      .select({
        id: pokemon.id,
        identifier: pokemon.identifier,
        isDefault: pokemon.isDefault,
        speciesIdentifier: species.identifier,
        dexNumber: species.id,
        name: speciesName.name,
        slot: pokemonAbility.slot,
        isHidden: pokemonAbility.isHidden,
      })
      .from(pokemonAbility)
      .innerJoin(pokemon, eq(pokemon.id, pokemonAbility.pokemonId))
      .innerJoin(species, eq(species.id, pokemon.speciesId))
      .innerJoin(
        speciesName,
        and(eq(speciesName.speciesId, species.id), eq(speciesName.language, input.locale)),
      )
      .innerJoin(
        pokemonType,
        // Comme dans l'index du Pokédex : une variété absente à cette génération
        // n'a aucune ligne de typage et disparaît de la liste.
        and(
          eq(pokemonType.pokemonId, pokemon.id),
          eq(pokemonType.generationId, input.generationId),
          eq(pokemonType.slot, 1),
        ),
      )
      .where(
        and(
          eq(pokemonAbility.abilityId, entry.id),
          input.generationId < HIDDEN_ABILITY_GENERATION
            ? eq(pokemonAbility.isHidden, false)
            : undefined,
        ),
      )
      .orderBy(asc(species.id), asc(pokemon.id));

    return {
      ...entry,
      pokemon: holders.map(({ isDefault, speciesIdentifier, ...holder }) => ({
        ...holder,
        formSuffix: formSuffix({ identifier: holder.identifier, isDefault, speciesIdentifier }),
      })),
    };
  });

export const talentsRouter = { detail };
