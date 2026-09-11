import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

/**
 * Catalogue Pokémon, alimenté depuis le schéma `staging` par `pnpm ingest:transform`.
 *
 * Les identifiants sont ceux de PokéAPI/veekun : une seule source alimente le
 * catalogue, et des clés de substitution n'ajouteraient qu'une jointure. Une
 * table de correspondance sera introduite quand une deuxième source d'identifiants
 * arrivera (Showdown, résultats de tournois).
 *
 * Les données qui varient selon l'époque (types, statistiques, table d'efficacité)
 * sont matérialisées par génération : la résolution entre valeur courante et
 * valeurs historiques est faite une fois à l'import, pas à chaque requête.
 */

export const generation = pgTable("generation", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").notNull(),
});

export const versionGroup = pgTable(
  "version_group",
  {
    id: integer("id").primaryKey(),
    identifier: text("identifier").notNull(),
    generationId: integer("generation_id")
      .notNull()
      .references(() => generation.id),
    order: integer("order").notNull(),
  },
  (table) => [index("version_group_generation_idx").on(table.generationId)],
);

export const version = pgTable(
  "version",
  {
    id: integer("id").primaryKey(),
    identifier: text("identifier").notNull(),
    versionGroupId: integer("version_group_id")
      .notNull()
      .references(() => versionGroup.id),
  },
  (table) => [index("version_version_group_idx").on(table.versionGroupId)],
);

export const type = pgTable("type", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").notNull(),
  /** Génération d'introduction du type. */
  generationId: integer("generation_id")
    .notNull()
    .references(() => generation.id),
});

export const typeName = pgTable(
  "type_name",
  {
    typeId: integer("type_id")
      .notNull()
      .references(() => type.id),
    language: text("language").notNull(),
    name: text("name").notNull(),
  },
  (table) => [primaryKey({ columns: [table.typeId, table.language] })],
);

/** Table d'efficacité résolue pour chaque génération. 100 = neutre, 0 = immunité. */
export const typeEfficacy = pgTable(
  "type_efficacy",
  {
    generationId: integer("generation_id")
      .notNull()
      .references(() => generation.id),
    damageTypeId: integer("damage_type_id")
      .notNull()
      .references(() => type.id),
    targetTypeId: integer("target_type_id")
      .notNull()
      .references(() => type.id),
    factor: integer("factor").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.generationId, table.damageTypeId, table.targetTypeId] }),
  ],
);

export const stat = pgTable("stat", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").notNull(),
  isBattleOnly: boolean("is_battle_only").notNull(),
});

/** Espèce : l'entrée du Pokédex national. Pikachu, indépendamment de ses formes. */
export const species = pgTable(
  "species",
  {
    id: integer("id").primaryKey(),
    identifier: text("identifier").notNull(),
    generationId: integer("generation_id")
      .notNull()
      .references(() => generation.id),
    evolvesFromSpeciesId: integer("evolves_from_species_id"),
    evolutionChainId: integer("evolution_chain_id"),
    genderRate: integer("gender_rate").notNull(),
    captureRate: integer("capture_rate").notNull(),
    baseHappiness: integer("base_happiness"),
    hatchCounter: integer("hatch_counter"),
    isBaby: boolean("is_baby").notNull(),
    isLegendary: boolean("is_legendary").notNull(),
    isMythical: boolean("is_mythical").notNull(),
    hasGenderDifferences: boolean("has_gender_differences").notNull(),
    order: integer("order"),
  },
  (table) => [
    index("species_generation_idx").on(table.generationId),
    index("species_evolution_chain_idx").on(table.evolutionChainId),
  ],
);

export const speciesName = pgTable(
  "species_name",
  {
    speciesId: integer("species_id")
      .notNull()
      .references(() => species.id),
    language: text("language").notNull(),
    name: text("name").notNull(),
    genus: text("genus"),
  },
  (table) => [
    primaryKey({ columns: [table.speciesId, table.language] }),
    index("species_name_name_idx").on(table.name),
  ],
);

/** Variété : la forme jouable d'une espèce. Pikachu, Raichu d'Alola, Méga-Dracaufeu X. */
export const pokemon = pgTable(
  "pokemon",
  {
    id: integer("id").primaryKey(),
    identifier: text("identifier").notNull(),
    speciesId: integer("species_id")
      .notNull()
      .references(() => species.id),
    height: integer("height"),
    weight: integer("weight"),
    baseExperience: integer("base_experience"),
    isDefault: boolean("is_default").notNull(),
    order: integer("order"),
  },
  (table) => [index("pokemon_species_idx").on(table.speciesId)],
);

/** Forme : variante d'une variété, cosmétique ou non. */
export const pokemonForm = pgTable(
  "pokemon_form",
  {
    id: integer("id").primaryKey(),
    identifier: text("identifier").notNull(),
    formIdentifier: text("form_identifier"),
    pokemonId: integer("pokemon_id")
      .notNull()
      .references(() => pokemon.id),
    introducedInVersionGroupId: integer("introduced_in_version_group_id").references(
      () => versionGroup.id,
    ),
    isDefault: boolean("is_default").notNull(),
    isBattleOnly: boolean("is_battle_only").notNull(),
    isMega: boolean("is_mega").notNull(),
    formOrder: integer("form_order"),
    order: integer("order"),
  },
  (table) => [index("pokemon_form_pokemon_idx").on(table.pokemonId)],
);

/** Types d'une variété, résolus pour chaque génération où elle existe. */
export const pokemonType = pgTable(
  "pokemon_type",
  {
    pokemonId: integer("pokemon_id")
      .notNull()
      .references(() => pokemon.id),
    generationId: integer("generation_id")
      .notNull()
      .references(() => generation.id),
    slot: integer("slot").notNull(),
    typeId: integer("type_id")
      .notNull()
      .references(() => type.id),
  },
  (table) => [
    primaryKey({ columns: [table.pokemonId, table.generationId, table.slot] }),
    index("pokemon_type_lookup_idx").on(table.generationId, table.typeId),
  ],
);

/** Statistiques de base, résolues pour chaque génération où la variété existe. */
export const pokemonStat = pgTable(
  "pokemon_stat",
  {
    pokemonId: integer("pokemon_id")
      .notNull()
      .references(() => pokemon.id),
    generationId: integer("generation_id")
      .notNull()
      .references(() => generation.id),
    statId: integer("stat_id")
      .notNull()
      .references(() => stat.id),
    baseStat: integer("base_stat").notNull(),
    effort: integer("effort").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.pokemonId, table.generationId, table.statId] }),
    index("pokemon_stat_lookup_idx").on(table.generationId, table.statId, table.baseStat),
  ],
);

export const speciesRelations = relations(species, ({ one, many }) => ({
  generation: one(generation, {
    fields: [species.generationId],
    references: [generation.id],
  }),
  names: many(speciesName),
  varieties: many(pokemon),
}));

export const speciesNameRelations = relations(speciesName, ({ one }) => ({
  species: one(species, {
    fields: [speciesName.speciesId],
    references: [species.id],
  }),
}));

export const pokemonRelations = relations(pokemon, ({ one, many }) => ({
  species: one(species, {
    fields: [pokemon.speciesId],
    references: [species.id],
  }),
  forms: many(pokemonForm),
  types: many(pokemonType),
  stats: many(pokemonStat),
}));

export const pokemonFormRelations = relations(pokemonForm, ({ one }) => ({
  pokemon: one(pokemon, {
    fields: [pokemonForm.pokemonId],
    references: [pokemon.id],
  }),
}));

export const pokemonTypeRelations = relations(pokemonType, ({ one }) => ({
  pokemon: one(pokemon, {
    fields: [pokemonType.pokemonId],
    references: [pokemon.id],
  }),
  type: one(type, {
    fields: [pokemonType.typeId],
    references: [type.id],
  }),
}));

export const pokemonStatRelations = relations(pokemonStat, ({ one }) => ({
  pokemon: one(pokemon, {
    fields: [pokemonStat.pokemonId],
    references: [pokemon.id],
  }),
  stat: one(stat, {
    fields: [pokemonStat.statId],
    references: [stat.id],
  }),
}));

export const versionGroupRelations = relations(versionGroup, ({ one, many }) => ({
  generation: one(generation, {
    fields: [versionGroup.generationId],
    references: [generation.id],
  }),
  versions: many(version),
}));

export const versionRelations = relations(version, ({ one }) => ({
  versionGroup: one(versionGroup, {
    fields: [version.versionGroupId],
    references: [versionGroup.id],
  }),
}));
