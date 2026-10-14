import { index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/*
 * Données des membres. Les Pokémon sont désignés par leur identifiant PokéAPI
 * (`pokemon.id`), SANS clé étrangère vers le catalogue : `ingest:transform`
 * reconstruit le catalogue par `truncate … cascade`, qui effacerait sinon ces
 * lignes à chaque import. Les identifiants PokéAPI sont stables d'un import à
 * l'autre ; une variété disparue est simplement ignorée à l'affichage.
 */

/** Pokémon favoris d'un membre. */
export const favoritePokemon = pgTable(
  "favorite_pokemon",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    pokemonId: integer("pokemon_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.pokemonId] })],
);

/** Pokémon capturés : la progression du Pokédex d'un membre. */
export const caughtPokemon = pgTable(
  "caught_pokemon",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    pokemonId: integer("pokemon_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.pokemonId] })],
);

/** Équipe de combat : jusqu'à six Pokémon, pensée pour une génération. */
export const team = pgTable(
  "team",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    generationId: integer("generation_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("team_user_idx").on(table.userId)],
);

export const teamMember = pgTable(
  "team_member",
  {
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    /** Position dans l'équipe, de 1 à 6. */
    slot: integer("slot").notNull(),
    pokemonId: integer("pokemon_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.teamId, table.slot] })],
);
