import {
  generation,
  pokemon,
  pokemonForm,
  pokemonStat,
  pokemonType,
  species,
  speciesName,
  stat,
  type,
  typeName,
} from "@pokedata/db/schema/catalog";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

/**
 * Génération par défaut du catalogue. À dériver de `select max(id) from generation`
 * le jour où le sélecteur de version sera exposé dans l'interface.
 */
export const LATEST_GENERATION = 9;

const locale = z.enum(["fr", "en"]).default("fr");
const generationId = z.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION);

/**
 * Index compact du Pokédex : une ligne par variété par défaut, sans description
 * ni statistique. L'intégralité tient en une réponse (~1 025 lignes), ce qui
 * permet de faire la recherche et les filtres dans le navigateur, sans requête
 * réseau à chaque frappe. Les données ne changent qu'à l'import : le client peut
 * la garder en cache indéfiniment.
 */
const index = publicProcedure
  .input(z.object({ locale, generationId }))
  .handler(async ({ context, input }) => {
    const entries = await context.db
      .select({
        id: pokemon.id,
        identifier: pokemon.identifier,
        dexNumber: species.id,
        name: speciesName.name,
        types: sql<string[]>`array_agg(${type.identifier} order by ${pokemonType.slot})`,
      })
      .from(pokemon)
      .innerJoin(species, eq(species.id, pokemon.speciesId))
      .innerJoin(
        speciesName,
        and(eq(speciesName.speciesId, species.id), eq(speciesName.language, input.locale)),
      )
      .innerJoin(
        pokemonType,
        // La jointure sur la génération filtre aussi l'existence : une variété
        // absente à cette époque n'a aucune ligne de typage.
        and(
          eq(pokemonType.pokemonId, pokemon.id),
          eq(pokemonType.generationId, input.generationId),
        ),
      )
      .innerJoin(type, eq(type.id, pokemonType.typeId))
      .where(eq(pokemon.isDefault, true))
      .groupBy(pokemon.id, species.id, speciesName.name)
      .orderBy(asc(pokemon.id));

    return { generationId: input.generationId, entries };
  });

/** Référentiel des filtres : types et générations disponibles, libellés traduits. */
const reference = publicProcedure
  .input(z.object({ locale, generationId }))
  .handler(async ({ context, input }) => {
    const [types, generations] = await Promise.all([
      context.db
        .select({ id: type.id, identifier: type.identifier, name: typeName.name })
        .from(type)
        .innerJoin(typeName, and(eq(typeName.typeId, type.id), eq(typeName.language, input.locale)))
        .where(sql`${type.generationId} <= ${input.generationId}`)
        .orderBy(asc(type.id)),
      context.db
        .select({ id: generation.id, identifier: generation.identifier })
        .from(generation)
        .orderBy(asc(generation.id)),
    ]);

    return { types, generations };
  });

/** Fiche d'une variété, pour une génération donnée. */
const detail = publicProcedure
  .input(z.object({ identifier: z.string().min(1).max(80), locale, generationId }))
  .handler(async ({ context, input }) => {
    const [entry] = await context.db
      .select({
        id: pokemon.id,
        identifier: pokemon.identifier,
        dexNumber: species.id,
        name: speciesName.name,
        genus: speciesName.genus,
        height: pokemon.height,
        weight: pokemon.weight,
        baseExperience: pokemon.baseExperience,
        captureRate: species.captureRate,
        genderRate: species.genderRate,
        isLegendary: species.isLegendary,
        isMythical: species.isMythical,
        speciesId: species.id,
        introducedIn: species.generationId,
      })
      .from(pokemon)
      .innerJoin(species, eq(species.id, pokemon.speciesId))
      .innerJoin(
        speciesName,
        and(eq(speciesName.speciesId, species.id), eq(speciesName.language, input.locale)),
      )
      .where(eq(pokemon.identifier, input.identifier))
      .limit(1);

    if (!entry) {
      return null;
    }

    const [types, stats, forms] = await Promise.all([
      context.db
        .select({
          slot: pokemonType.slot,
          identifier: type.identifier,
          name: typeName.name,
        })
        .from(pokemonType)
        .innerJoin(type, eq(type.id, pokemonType.typeId))
        .innerJoin(typeName, and(eq(typeName.typeId, type.id), eq(typeName.language, input.locale)))
        .where(
          and(
            eq(pokemonType.pokemonId, entry.id),
            eq(pokemonType.generationId, input.generationId),
          ),
        )
        .orderBy(asc(pokemonType.slot)),
      context.db
        .select({
          identifier: stat.identifier,
          baseStat: pokemonStat.baseStat,
          effort: pokemonStat.effort,
        })
        .from(pokemonStat)
        .innerJoin(stat, eq(stat.id, pokemonStat.statId))
        .where(
          and(
            eq(pokemonStat.pokemonId, entry.id),
            eq(pokemonStat.generationId, input.generationId),
          ),
        )
        .orderBy(asc(pokemonStat.statId)),
      context.db
        .select({
          id: pokemonForm.id,
          identifier: pokemonForm.identifier,
          formIdentifier: pokemonForm.formIdentifier,
          isDefault: pokemonForm.isDefault,
          isMega: pokemonForm.isMega,
        })
        .from(pokemonForm)
        .where(eq(pokemonForm.pokemonId, entry.id))
        .orderBy(asc(pokemonForm.formOrder)),
    ]);

    // Une variété sans typage à cette génération n'y existait pas encore.
    if (types.length === 0) {
      return null;
    }

    return {
      ...entry,
      generationId: input.generationId,
      types,
      stats,
      statTotal: stats.reduce((total, line) => total + line.baseStat, 0),
      forms,
    };
  });

export const pokedexRouter = { index, reference, detail };
