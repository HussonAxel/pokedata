import { pokemon, pokemonType, species, speciesName, type } from "@pokedata/db/schema/catalog";
import { caughtPokemon, favoritePokemon, team, teamMember } from "@pokedata/db/schema/member";
import { ORPCError } from "@orpc/server";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { generationId, locale, pokemonEntryColumns, withFormSuffix } from "../catalog-input";
import type { Context } from "../context";
import { protectedProcedure } from "../index";

/** Taille maximale d'une équipe de combat. */
export const TEAM_SIZE = 6;

const pokemonIdInput = z.object({ pokemonId: z.number().int().positive() });
const teamIdInput = z.object({ id: z.string().uuid() });

/** Tableau de bord : ce que le membre a déjà rassemblé. */
const summary = protectedProcedure.handler(async ({ context }) => {
  const userId = context.session.user.id;
  const [[favorites], [caught], [teams]] = await Promise.all([
    context.db
      .select({ value: count() })
      .from(favoritePokemon)
      .where(eq(favoritePokemon.userId, userId)),
    context.db
      .select({ value: count() })
      .from(caughtPokemon)
      .where(eq(caughtPokemon.userId, userId)),
    context.db.select({ value: count() }).from(team).where(eq(team.userId, userId)),
  ]);

  return {
    name: context.session.user.name,
    email: context.session.user.email,
    memberSince: context.session.user.createdAt,
    favorites: favorites?.value ?? 0,
    caught: caught?.value ?? 0,
    teams: teams?.value ?? 0,
  };
});

/** État d'un Pokémon pour le membre : favori, capturé. */
const pokemonStatus = protectedProcedure
  .input(pokemonIdInput)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const [favorite, caught] = await Promise.all([
      context.db
        .select({ id: favoritePokemon.pokemonId })
        .from(favoritePokemon)
        .where(
          and(eq(favoritePokemon.userId, userId), eq(favoritePokemon.pokemonId, input.pokemonId)),
        )
        .limit(1),
      context.db
        .select({ id: caughtPokemon.pokemonId })
        .from(caughtPokemon)
        .where(and(eq(caughtPokemon.userId, userId), eq(caughtPokemon.pokemonId, input.pokemonId)))
        .limit(1),
    ]);

    return { favorite: favorite.length > 0, caught: caught.length > 0 };
  });

const flagInput = pokemonIdInput.extend({ value: z.boolean() });

const setFavorite = protectedProcedure.input(flagInput).handler(async ({ context, input }) => {
  const userId = context.session.user.id;
  if (input.value) {
    await context.db
      .insert(favoritePokemon)
      .values({ userId, pokemonId: input.pokemonId })
      .onConflictDoNothing();
  } else {
    await context.db
      .delete(favoritePokemon)
      .where(
        and(eq(favoritePokemon.userId, userId), eq(favoritePokemon.pokemonId, input.pokemonId)),
      );
  }
  return { favorite: input.value };
});

const setCaught = protectedProcedure.input(flagInput).handler(async ({ context, input }) => {
  const userId = context.session.user.id;
  if (input.value) {
    await context.db
      .insert(caughtPokemon)
      .values({ userId, pokemonId: input.pokemonId })
      .onConflictDoNothing();
  } else {
    await context.db
      .delete(caughtPokemon)
      .where(and(eq(caughtPokemon.userId, userId), eq(caughtPokemon.pokemonId, input.pokemonId)));
  }
  return { caught: input.value };
});

/** Favoris du membre, dans l'ordre du Pokédex. */
const favorites = protectedProcedure
  .input(z.object({ locale }))
  .handler(async ({ context, input }) => {
    const rows = await context.db
      .select(pokemonEntryColumns)
      .from(favoritePokemon)
      .innerJoin(pokemon, eq(pokemon.id, favoritePokemon.pokemonId))
      .innerJoin(species, eq(species.id, pokemon.speciesId))
      .innerJoin(
        speciesName,
        and(eq(speciesName.speciesId, species.id), eq(speciesName.language, input.locale)),
      )
      .where(eq(favoritePokemon.userId, context.session.user.id))
      .orderBy(asc(species.id), asc(pokemon.id));

    return withFormSuffix(rows);
  });

/**
 * Progression du Pokédex national : espèces capturées par génération
 * d'apparition. Seule la variété par défaut compte pour une espèce.
 */
const progression = protectedProcedure.input(z.object({ locale })).handler(async ({ context }) => {
  const rows = await context.db
    .select({
      generationId: species.generationId,
      total: count(),
      caught: sql<number>`count(${caughtPokemon.pokemonId})::int`,
    })
    .from(pokemon)
    .innerJoin(species, eq(species.id, pokemon.speciesId))
    .leftJoin(
      caughtPokemon,
      and(
        eq(caughtPokemon.pokemonId, pokemon.id),
        eq(caughtPokemon.userId, context.session.user.id),
      ),
    )
    .where(eq(pokemon.isDefault, true))
    .groupBy(species.generationId)
    .orderBy(asc(species.generationId));

  return rows;
});

/** Équipes du membre, les plus récentes d'abord, avec leurs Pokémon. */
const listTeams = protectedProcedure.handler(async ({ context }) => {
  const teams = await context.db
    .select({
      id: team.id,
      name: team.name,
      generationId: team.generationId,
      updatedAt: team.updatedAt,
    })
    .from(team)
    .where(eq(team.userId, context.session.user.id))
    .orderBy(desc(team.updatedAt));

  const members = teams.length
    ? await context.db
        .select({
          teamId: teamMember.teamId,
          slot: teamMember.slot,
          pokemonId: teamMember.pokemonId,
        })
        .from(teamMember)
        .where(
          inArray(
            teamMember.teamId,
            teams.map((entry) => entry.id),
          ),
        )
        .orderBy(asc(teamMember.slot))
    : [];

  return teams.map((entry) => ({
    ...entry,
    pokemonIds: members
      .filter((member) => member.teamId === entry.id)
      .map((member) => member.pokemonId),
  }));
});

/** Équipe du membre, ou erreur si elle n'existe pas ou appartient à un autre. */
async function ownedTeam(db: Context["db"], userId: string, id: string) {
  const [entry] = await db
    .select({ id: team.id, name: team.name, generationId: team.generationId })
    .from(team)
    .where(and(eq(team.id, id), eq(team.userId, userId)))
    .limit(1);
  if (!entry) throw new ORPCError("NOT_FOUND");
  return entry;
}

/** Une équipe et ses Pokémon, typés pour la génération de l'équipe. */
const getTeam = protectedProcedure
  .input(teamIdInput.extend({ locale }))
  .handler(async ({ context, input }) => {
    const entry = await ownedTeam(context.db, context.session.user.id, input.id);

    const members = await context.db
      .select({
        ...pokemonEntryColumns,
        slot: teamMember.slot,
        types: sql<string[]>`coalesce(
          array_agg(${type.identifier} order by ${pokemonType.slot}) filter (where ${type.identifier} is not null),
          '{}'
        )`,
      })
      .from(teamMember)
      .innerJoin(pokemon, eq(pokemon.id, teamMember.pokemonId))
      .innerJoin(species, eq(species.id, pokemon.speciesId))
      .innerJoin(
        speciesName,
        and(eq(speciesName.speciesId, species.id), eq(speciesName.language, input.locale)),
      )
      .leftJoin(
        pokemonType,
        and(
          eq(pokemonType.pokemonId, pokemon.id),
          eq(pokemonType.generationId, entry.generationId),
        ),
      )
      .leftJoin(type, eq(type.id, pokemonType.typeId))
      .where(eq(teamMember.teamId, entry.id))
      .groupBy(teamMember.slot, pokemon.id, species.id, speciesName.name)
      .orderBy(asc(teamMember.slot));

    return { ...entry, members: withFormSuffix(members) };
  });

const teamFields = z.object({
  name: z.string().trim().min(1).max(60),
  generationId,
});

const createTeam = protectedProcedure.input(teamFields).handler(async ({ context, input }) => {
  const id = crypto.randomUUID();
  await context.db.insert(team).values({ id, userId: context.session.user.id, ...input });
  return { id };
});

/** Renomme l'équipe et remplace ses membres, dans l'ordre donné. */
const updateTeam = protectedProcedure
  .input(
    teamIdInput.extend({
      name: teamFields.shape.name,
      generationId,
      pokemonIds: z.array(z.number().int().positive()).max(TEAM_SIZE),
    }),
  )
  .handler(async ({ context, input }) => {
    await ownedTeam(context.db, context.session.user.id, input.id);

    await context.db.transaction(async (tx) => {
      await tx
        .update(team)
        .set({ name: input.name, generationId: input.generationId })
        .where(eq(team.id, input.id));
      await tx.delete(teamMember).where(eq(teamMember.teamId, input.id));
      if (input.pokemonIds.length) {
        await tx.insert(teamMember).values(
          input.pokemonIds.map((pokemonId, index) => ({
            teamId: input.id,
            slot: index + 1,
            pokemonId,
          })),
        );
      }
    });

    return { id: input.id };
  });

const deleteTeam = protectedProcedure.input(teamIdInput).handler(async ({ context, input }) => {
  await ownedTeam(context.db, context.session.user.id, input.id);
  await context.db.delete(team).where(eq(team.id, input.id));
  return { id: input.id };
});

export const memberRouter = {
  summary,
  pokemonStatus,
  setFavorite,
  setCaught,
  favorites,
  progression,
  teams: {
    list: listTeams,
    get: getTeam,
    create: createTeam,
    update: updateTeam,
    delete: deleteTeam,
  },
};
