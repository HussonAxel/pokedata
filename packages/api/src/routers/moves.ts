import {
  move,
  moveName,
  pokemon,
  pokemonMove,
  pokemonType,
  species,
  speciesName,
  type,
  typeName,
  versionGroup,
} from "@pokedata/db/schema/catalog";
import { and, asc, eq, lte, sql } from "drizzle-orm";

import { detailInput, pokemonEntryColumns, scopeInput, withFormSuffix } from "../catalog-input";
import { moveDescription } from "../flavor-text";
import { publicProcedure } from "../index";

/** Montée de niveau, dans `pokemon_move.method_id`. */
const LEVEL_UP_METHOD = 1;

/** Attaques connues à la génération consultée, par ordre alphabétique. */
const list = publicProcedure.input(scopeInput).handler(async ({ context, input }) => {
  const entries = await context.db
    .select({
      id: move.id,
      identifier: move.identifier,
      name: moveName.name,
      type: type.identifier,
      damageClass: move.damageClass,
      power: move.power,
    })
    .from(move)
    .innerJoin(moveName, and(eq(moveName.moveId, move.id), eq(moveName.language, input.locale)))
    .innerJoin(type, eq(type.id, move.typeId))
    .where(lte(move.generationId, input.generationId))
    .orderBy(asc(moveName.name));

  return { generationId: input.generationId, entries };
});

const detail = publicProcedure.input(detailInput).handler(async ({ context, input }) => {
  const [entry] = await context.db
    .select({
      id: move.id,
      identifier: move.identifier,
      name: moveName.name,
      introducedIn: move.generationId,
      type: { identifier: type.identifier, name: typeName.name },
      damageClass: move.damageClass,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      priority: move.priority,
      effectChance: move.effectChance,
      description: moveDescription(move.id, input.locale, input.generationId),
    })
    .from(move)
    .innerJoin(moveName, and(eq(moveName.moveId, move.id), eq(moveName.language, input.locale)))
    .innerJoin(type, eq(type.id, move.typeId))
    .innerJoin(typeName, and(eq(typeName.typeId, type.id), eq(typeName.language, input.locale)))
    .where(and(eq(move.identifier, input.identifier), lte(move.generationId, input.generationId)))
    .limit(1);

  if (!entry) return null;

  // Une ligne par variété : toutes les méthodes d'apprentissage des jeux de la
  // génération, et le plus bas niveau d'apprentissage par montée de niveau.
  const learners = await context.db
    .select({
      ...pokemonEntryColumns,
      methods: sql<
        number[]
      >`array_agg(distinct ${pokemonMove.methodId} order by ${pokemonMove.methodId})`,
      level: sql<
        number | null
      >`min(${pokemonMove.level}) filter (where ${pokemonMove.methodId} = ${LEVEL_UP_METHOD})`,
    })
    .from(pokemonMove)
    .innerJoin(
      versionGroup,
      and(
        eq(versionGroup.id, pokemonMove.versionGroupId),
        eq(versionGroup.generationId, input.generationId),
      ),
    )
    .innerJoin(pokemon, eq(pokemon.id, pokemonMove.pokemonId))
    .innerJoin(species, eq(species.id, pokemon.speciesId))
    .innerJoin(
      speciesName,
      and(eq(speciesName.speciesId, species.id), eq(speciesName.language, input.locale)),
    )
    .innerJoin(
      pokemonType,
      and(
        eq(pokemonType.pokemonId, pokemon.id),
        eq(pokemonType.generationId, input.generationId),
        eq(pokemonType.slot, 1),
      ),
    )
    .where(eq(pokemonMove.moveId, entry.id))
    .groupBy(pokemon.id, species.id, speciesName.name)
    .orderBy(asc(species.id), asc(pokemon.id));

  return { ...entry, learners: withFormSuffix(learners) };
});

export const movesRouter = { list, detail };
