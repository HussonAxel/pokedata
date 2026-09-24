import {
  generation,
  ability,
  abilityName,
  eggGroup,
  eggGroupName,
  encounter,
  evolutionTriggerName,
  location,
  locationArea,
  locationName,
  move,
  moveName,
  pokemonAbility,
  pokemonEggGroup,
  pokemonEvolution,
  pokemonMove,
  pokemon,
  pokemonForm,
  pokemonStat,
  pokemonType,
  species,
  speciesName,
  speciesFlavorText,
  stat,
  type,
  typeName,
  typeEfficacy,
  versionGroup,
  version,
} from "@pokedata/db/schema/catalog";
import { and, asc, eq, isNull, lte, or, sql } from "drizzle-orm";
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
        baseHappiness: species.baseHappiness,
        hatchCounter: species.hatchCounter,
        isBaby: species.isBaby,
        hasGenderDifferences: species.hasGenderDifferences,
        evolutionChainId: species.evolutionChainId,
        isLegendary: species.isLegendary,
        isMythical: species.isMythical,
        speciesId: species.id,
        introducedIn: species.generationId,
        isAvailableInGeneration: sql<boolean>`exists (
          select 1
            from staging.pokemon_game_indices game_index
            join version game_version on game_version.id = game_index.version_id::int
            join version_group game_group on game_group.id = game_version.version_group_id
           where game_index.pokemon_id::int = ${pokemon.id}
             and game_group.generation_id = ${input.generationId}
        )`,
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

    const [
      types,
      stats,
      forms,
      varieties,
      evolutionFamily,
      efficacy,
      availableGenerations,
      names,
      descriptions,
      abilities,
      moves,
      eggGroups,
      evolutionConditions,
      encounters,
    ] = await Promise.all([
      context.db
        .select({
          id: type.id,
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
          isBattleOnly: pokemonForm.isBattleOnly,
          introducedIn: versionGroup.generationId,
        })
        .from(pokemonForm)
        .leftJoin(versionGroup, eq(versionGroup.id, pokemonForm.introducedInVersionGroupId))
        .where(
          and(
            eq(pokemonForm.pokemonId, entry.id),
            or(
              isNull(versionGroup.generationId),
              lte(versionGroup.generationId, input.generationId),
            ),
          ),
        )
        .orderBy(asc(pokemonForm.formOrder)),
      context.db
        .select({ id: pokemon.id, identifier: pokemon.identifier, isDefault: pokemon.isDefault })
        .from(pokemon)
        .innerJoin(
          pokemonType,
          and(
            eq(pokemonType.pokemonId, pokemon.id),
            eq(pokemonType.generationId, input.generationId),
            eq(pokemonType.slot, 1),
          ),
        )
        .where(eq(pokemon.speciesId, entry.speciesId))
        .orderBy(asc(pokemon.order), asc(pokemon.id)),
      context.db
        .select({
          speciesId: species.id,
          identifier: pokemon.identifier,
          name: speciesName.name,
          evolvesFromSpeciesId: species.evolvesFromSpeciesId,
          introducedIn: species.generationId,
        })
        .from(species)
        .innerJoin(
          speciesName,
          and(eq(speciesName.speciesId, species.id), eq(speciesName.language, input.locale)),
        )
        .innerJoin(pokemon, and(eq(pokemon.speciesId, species.id), eq(pokemon.isDefault, true)))
        .innerJoin(
          pokemonType,
          and(
            eq(pokemonType.pokemonId, pokemon.id),
            eq(pokemonType.generationId, input.generationId),
            eq(pokemonType.slot, 1),
          ),
        )
        .where(
          entry.evolutionChainId === null
            ? eq(species.id, entry.speciesId)
            : eq(species.evolutionChainId, entry.evolutionChainId),
        )
        .orderBy(asc(species.order), asc(species.id)),
      context.db
        .select({
          identifier: type.identifier,
          name: typeName.name,
          targetTypeId: typeEfficacy.targetTypeId,
          factor: typeEfficacy.factor,
        })
        .from(typeEfficacy)
        .innerJoin(type, eq(type.id, typeEfficacy.damageTypeId))
        .innerJoin(typeName, and(eq(typeName.typeId, type.id), eq(typeName.language, input.locale)))
        .innerJoin(
          pokemonType,
          and(
            eq(pokemonType.typeId, typeEfficacy.targetTypeId),
            eq(pokemonType.pokemonId, entry.id),
            eq(pokemonType.generationId, input.generationId),
          ),
        )
        .where(eq(typeEfficacy.generationId, input.generationId))
        .orderBy(asc(type.id)),
      context.db
        .select({ id: pokemonType.generationId })
        .from(pokemonType)
        .where(and(eq(pokemonType.pokemonId, entry.id), eq(pokemonType.slot, 1)))
        .orderBy(asc(pokemonType.generationId)),
      context.db
        .select({
          language: speciesName.language,
          name: speciesName.name,
          genus: speciesName.genus,
        })
        .from(speciesName)
        .where(eq(speciesName.speciesId, entry.speciesId))
        .orderBy(asc(speciesName.language)),
      context.db
        .select({
          versionId: speciesFlavorText.versionId,
          flavorText: speciesFlavorText.flavorText,
        })
        .from(speciesFlavorText)
        .where(
          and(
            eq(speciesFlavorText.speciesId, entry.speciesId),
            eq(speciesFlavorText.language, input.locale),
          ),
        )
        .orderBy(asc(speciesFlavorText.versionId)),
      context.db
        .select({
          id: ability.id,
          identifier: ability.identifier,
          name: abilityName.name,
          slot: pokemonAbility.slot,
          isHidden: pokemonAbility.isHidden,
        })
        .from(pokemonAbility)
        .innerJoin(ability, eq(ability.id, pokemonAbility.abilityId))
        .innerJoin(
          abilityName,
          and(eq(abilityName.abilityId, ability.id), eq(abilityName.language, input.locale)),
        )
        .where(eq(pokemonAbility.pokemonId, entry.id))
        .orderBy(asc(pokemonAbility.slot)),
      context.db
        .select({
          id: move.id,
          identifier: move.identifier,
          name: moveName.name,
          typeId: move.typeId,
          power: move.power,
          pp: move.pp,
          accuracy: move.accuracy,
          priority: move.priority,
          methodId: pokemonMove.methodId,
          level: pokemonMove.level,
          versionGroupId: pokemonMove.versionGroupId,
        })
        .from(pokemonMove)
        .innerJoin(move, eq(move.id, pokemonMove.moveId))
        .innerJoin(moveName, and(eq(moveName.moveId, move.id), eq(moveName.language, input.locale)))
        .innerJoin(
          versionGroup,
          and(
            eq(versionGroup.id, pokemonMove.versionGroupId),
            eq(versionGroup.generationId, input.generationId),
          ),
        )
        .where(eq(pokemonMove.pokemonId, entry.id))
        .orderBy(asc(pokemonMove.methodId), asc(pokemonMove.level), asc(pokemonMove.order)),
      context.db
        .select({ id: eggGroup.id, identifier: eggGroup.identifier, name: eggGroupName.name })
        .from(pokemonEggGroup)
        .innerJoin(eggGroup, eq(eggGroup.id, pokemonEggGroup.eggGroupId))
        .innerJoin(
          eggGroupName,
          and(eq(eggGroupName.eggGroupId, eggGroup.id), eq(eggGroupName.language, input.locale)),
        )
        .where(eq(pokemonEggGroup.speciesId, entry.speciesId))
        .orderBy(asc(eggGroup.id)),
      context.db
        .select({
          evolvedSpeciesId: pokemonEvolution.evolvedSpeciesId,
          triggerId: pokemonEvolution.triggerId,
          triggerName: evolutionTriggerName.name,
          minimumLevel: pokemonEvolution.minimumLevel,
          minimumHappiness: pokemonEvolution.minimumHappiness,
          minimumBeauty: pokemonEvolution.minimumBeauty,
          minimumAffection: pokemonEvolution.minimumAffection,
          timeOfDay: pokemonEvolution.timeOfDay,
          needsOverworldRain: pokemonEvolution.needsOverworldRain,
          turnUpsideDown: pokemonEvolution.turnUpsideDown,
        })
        .from(pokemonEvolution)
        .leftJoin(
          evolutionTriggerName,
          and(
            eq(evolutionTriggerName.triggerId, pokemonEvolution.triggerId),
            eq(evolutionTriggerName.language, input.locale),
          ),
        )
        .where(eq(pokemonEvolution.evolvedSpeciesId, entry.speciesId)),
      context.db
        .select({
          locationId: location.id,
          location: locationName.name,
          area: locationArea.identifier,
          versionId: encounter.versionId,
          minLevel: encounter.minLevel,
          maxLevel: encounter.maxLevel,
          rarity: encounter.rarity,
        })
        .from(encounter)
        .innerJoin(locationArea, eq(locationArea.id, encounter.locationAreaId))
        .innerJoin(location, eq(location.id, locationArea.locationId))
        .leftJoin(
          locationName,
          and(eq(locationName.locationId, location.id), eq(locationName.language, input.locale)),
        )
        .innerJoin(version, eq(version.id, encounter.versionId))
        .innerJoin(
          versionGroup,
          and(
            eq(versionGroup.id, version.versionGroupId),
            eq(versionGroup.generationId, input.generationId),
          ),
        )
        .where(eq(encounter.pokemonId, entry.id))
        .orderBy(asc(location.id), asc(encounter.minLevel)),
    ]);

    // Une variété sans typage à cette génération n'y existait pas encore.
    if (types.length === 0) {
      return null;
    }

    const matchups = new Map<string, { identifier: string; name: string; multiplier: number }>();
    for (const row of efficacy) {
      const current = matchups.get(row.identifier);
      matchups.set(row.identifier, {
        identifier: row.identifier,
        name: row.name,
        multiplier: ((current?.multiplier ?? 1) * row.factor) / 100,
      });
    }

    return {
      ...entry,
      varieties,
      evolutionFamily,
      matchups: [...matchups.values()],
      availableGenerations,
      names,
      descriptions,
      abilities,
      moves,
      eggGroups,
      evolutionConditions,
      encounters,
      generationId: input.generationId,
      types,
      stats,
      statTotal: stats.reduce((total, line) => total + line.baseStat, 0),
      forms,
    };
  });

/**
 * Table des types d'une génération : une ligne par type attaquant, une colonne
 * par type défenseur. La matrice est renvoyée pleine (100 = neutre par défaut)
 * pour que l'affichage n'ait aucune jointure à refaire dans le navigateur.
 */
const typeChart = publicProcedure
  .input(z.object({ locale, generationId }))
  .handler(async ({ context, input }) => {
    const [types, efficacy] = await Promise.all([
      context.db
        .select({ id: type.id, identifier: type.identifier, name: typeName.name })
        .from(type)
        .innerJoin(typeName, and(eq(typeName.typeId, type.id), eq(typeName.language, input.locale)))
        .where(
          and(
            lte(type.generationId, input.generationId),
            // Un type sans aucune ligne d'efficacité (Stellaire) n'a pas de
            // place dans la table : il ferait une ligne et une colonne vides.
            sql`exists (select 1 from ${typeEfficacy}
                         where ${typeEfficacy.generationId} = ${input.generationId}
                           and ${typeEfficacy.damageTypeId} = ${type.id})`,
          ),
        )
        .orderBy(asc(type.id)),
      context.db
        .select({
          damageTypeId: typeEfficacy.damageTypeId,
          targetTypeId: typeEfficacy.targetTypeId,
          factor: typeEfficacy.factor,
        })
        .from(typeEfficacy)
        .where(eq(typeEfficacy.generationId, input.generationId)),
    ]);

    const row = new Map(types.map((entry, index) => [entry.id, index]));
    // Un couple sans ligne d'efficacité (type sans matchup connu) reste neutre.
    const factors = types.map(() => types.map(() => 100));

    for (const line of efficacy) {
      const y = row.get(line.damageTypeId);
      const x = row.get(line.targetTypeId);
      if (y === undefined || x === undefined) continue;
      factors[y][x] = line.factor;
    }

    return { generationId: input.generationId, types, factors };
  });

export const pokedexRouter = { index, reference, detail, typeChart };
