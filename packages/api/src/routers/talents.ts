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

import { abilityDescription } from "../ability-description";
import {
  HIDDEN_ABILITY_GENERATION,
  detailInput,
  pokemonEntryColumns,
  scopeInput,
  withFormSuffix,
} from "../catalog-input";
import { publicProcedure } from "../index";

/** Talents connus à la génération consultée, par ordre alphabétique. */
const list = publicProcedure.input(scopeInput).handler(async ({ context, input }) => {
  const entries = await context.db
    .select({
      id: ability.id,
      identifier: ability.identifier,
      name: abilityName.name,
      introducedIn: ability.generationId,
    })
    .from(ability)
    .innerJoin(
      abilityName,
      and(eq(abilityName.abilityId, ability.id), eq(abilityName.language, input.locale)),
    )
    .where(lte(ability.generationId, input.generationId))
    .orderBy(asc(abilityName.name));

  return { generationId: input.generationId, entries };
});

const detail = publicProcedure.input(detailInput).handler(async ({ context, input }) => {
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
      and(eq(ability.identifier, input.identifier), lte(ability.generationId, input.generationId)),
    )
    .limit(1);

  if (!entry) return null;

  const holders = await context.db
    .select({
      ...pokemonEntryColumns,
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

  return { ...entry, pokemon: withFormSuffix(holders) };
});

export const talentsRouter = { list, detail };
