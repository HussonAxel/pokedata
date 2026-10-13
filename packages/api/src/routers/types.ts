import {
  move,
  moveName,
  pokemon,
  pokemonType,
  species,
  speciesName,
  type,
  typeEfficacy,
  typeName,
} from "@pokedata/db/schema/catalog";
import { and, asc, eq, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { detailInput, pokemonEntryColumns, withFormSuffix } from "../catalog-input";
import { publicProcedure } from "../index";

const otherType = alias(type, "other_type");
const otherTypeName = alias(typeName, "other_type_name");

const detail = publicProcedure.input(detailInput).handler(async ({ context, input }) => {
  const [entry] = await context.db
    .select({
      id: type.id,
      identifier: type.identifier,
      name: typeName.name,
      introducedIn: type.generationId,
    })
    .from(type)
    .innerJoin(typeName, and(eq(typeName.typeId, type.id), eq(typeName.language, input.locale)))
    .where(and(eq(type.identifier, input.identifier), lte(type.generationId, input.generationId)))
    .limit(1);

  if (!entry) return null;

  // Efficacité d'un type unique : la même table lue dans les deux sens.
  const efficacy = (direction: "defense" | "offense") =>
    context.db
      .select({
        identifier: otherType.identifier,
        name: otherTypeName.name,
        factor: typeEfficacy.factor,
      })
      .from(typeEfficacy)
      .innerJoin(
        otherType,
        eq(
          otherType.id,
          direction === "defense" ? typeEfficacy.damageTypeId : typeEfficacy.targetTypeId,
        ),
      )
      .innerJoin(
        otherTypeName,
        and(eq(otherTypeName.typeId, otherType.id), eq(otherTypeName.language, input.locale)),
      )
      .where(
        and(
          eq(typeEfficacy.generationId, input.generationId),
          eq(
            direction === "defense" ? typeEfficacy.targetTypeId : typeEfficacy.damageTypeId,
            entry.id,
          ),
        ),
      )
      .orderBy(asc(otherType.id));

  const [defense, offense, holders, moves] = await Promise.all([
    efficacy("defense"),
    efficacy("offense"),
    context.db
      .select({ ...pokemonEntryColumns, slot: pokemonType.slot })
      .from(pokemonType)
      .innerJoin(pokemon, eq(pokemon.id, pokemonType.pokemonId))
      .innerJoin(species, eq(species.id, pokemon.speciesId))
      .innerJoin(
        speciesName,
        and(eq(speciesName.speciesId, species.id), eq(speciesName.language, input.locale)),
      )
      .where(
        and(eq(pokemonType.typeId, entry.id), eq(pokemonType.generationId, input.generationId)),
      )
      .orderBy(asc(species.id), asc(pokemon.id)),
    context.db
      .select({
        id: move.id,
        identifier: move.identifier,
        name: moveName.name,
        damageClass: move.damageClass,
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp,
      })
      .from(move)
      .innerJoin(moveName, and(eq(moveName.moveId, move.id), eq(moveName.language, input.locale)))
      .where(and(eq(move.typeId, entry.id), lte(move.generationId, input.generationId)))
      .orderBy(asc(moveName.name)),
  ]);

  const toMatchup = ({ factor, ...row }: (typeof defense)[number]) => ({
    ...row,
    multiplier: factor / 100,
  });

  return {
    ...entry,
    defense: defense.map(toMatchup),
    offense: offense.map(toMatchup),
    pokemon: withFormSuffix(holders),
    moves,
  };
});

export const typesRouter = { detail };
