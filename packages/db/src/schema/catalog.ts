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

export const ability = pgTable("ability", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").notNull(),
  generationId: integer("generation_id").references(() => generation.id),
});

export const abilityName = pgTable(
  "ability_name",
  {
    abilityId: integer("ability_id")
      .notNull()
      .references(() => ability.id),
    language: text("language").notNull(),
    name: text("name").notNull(),
  },
  (table) => [primaryKey({ columns: [table.abilityId, table.language] })],
);

export const abilityFlavorText = pgTable(
  "ability_flavor_text",
  {
    abilityId: integer("ability_id")
      .notNull()
      .references(() => ability.id),
    language: text("language").notNull(),
    versionGroupId: integer("version_group_id")
      .notNull()
      .references(() => versionGroup.id),
    flavorText: text("flavor_text").notNull(),
  },
  (table) => [primaryKey({ columns: [table.abilityId, table.language, table.versionGroupId] })],
);

export const pokemonAbility = pgTable(
  "pokemon_ability",
  {
    pokemonId: integer("pokemon_id")
      .notNull()
      .references(() => pokemon.id),
    abilityId: integer("ability_id")
      .notNull()
      .references(() => ability.id),
    slot: integer("slot").notNull(),
    isHidden: boolean("is_hidden").notNull(),
  },
  (table) => [primaryKey({ columns: [table.pokemonId, table.abilityId] })],
);

export const move = pgTable("move", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").notNull(),
  generationId: integer("generation_id").references(() => generation.id),
  typeId: integer("type_id").references(() => type.id),
  power: integer("power"),
  pp: integer("pp"),
  accuracy: integer("accuracy"),
  priority: integer("priority"),
  effectChance: integer("effect_chance"),
});

export const moveName = pgTable(
  "move_name",
  {
    moveId: integer("move_id")
      .notNull()
      .references(() => move.id),
    language: text("language").notNull(),
    name: text("name").notNull(),
  },
  (table) => [primaryKey({ columns: [table.moveId, table.language] })],
);

export const pokemonMove = pgTable(
  "pokemon_move",
  {
    pokemonId: integer("pokemon_id")
      .notNull()
      .references(() => pokemon.id),
    versionGroupId: integer("version_group_id")
      .notNull()
      .references(() => versionGroup.id),
    moveId: integer("move_id")
      .notNull()
      .references(() => move.id),
    methodId: integer("method_id").notNull(),
    level: integer("level").notNull(),
    order: integer("order"),
  },
  (table) => [
    primaryKey({ columns: [table.pokemonId, table.versionGroupId, table.moveId, table.methodId] }),
  ],
);

export const eggGroup = pgTable("egg_group", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").notNull(),
});

export const eggGroupName = pgTable(
  "egg_group_name",
  {
    eggGroupId: integer("egg_group_id")
      .notNull()
      .references(() => eggGroup.id),
    language: text("language").notNull(),
    name: text("name").notNull(),
  },
  (table) => [primaryKey({ columns: [table.eggGroupId, table.language] })],
);

export const pokemonEggGroup = pgTable(
  "pokemon_egg_group",
  {
    speciesId: integer("species_id")
      .notNull()
      .references(() => species.id),
    eggGroupId: integer("egg_group_id")
      .notNull()
      .references(() => eggGroup.id),
  },
  (table) => [primaryKey({ columns: [table.speciesId, table.eggGroupId] })],
);

export const speciesFlavorText = pgTable(
  "species_flavor_text",
  {
    speciesId: integer("species_id")
      .notNull()
      .references(() => species.id),
    versionId: integer("version_id")
      .notNull()
      .references(() => version.id),
    language: text("language").notNull(),
    flavorText: text("flavor_text").notNull(),
  },
  (table) => [primaryKey({ columns: [table.speciesId, table.versionId, table.language] })],
);

export const pokemonEvolution = pgTable("pokemon_evolution", {
  id: integer("id").primaryKey(),
  evolvedSpeciesId: integer("evolved_species_id")
    .notNull()
    .references(() => species.id),
  triggerId: integer("trigger_id"),
  versionGroupId: integer("version_group_id").references(() => versionGroup.id),
  minimumLevel: integer("minimum_level"),
  minimumHappiness: integer("minimum_happiness"),
  minimumBeauty: integer("minimum_beauty"),
  minimumAffection: integer("minimum_affection"),
  timeOfDay: text("time_of_day"),
  locationId: integer("location_id"),
  triggerItemId: integer("trigger_item_id"),
  heldItemId: integer("held_item_id"),
  knownMoveId: integer("known_move_id"),
  knownMoveTypeId: integer("known_move_type_id"),
  tradeSpeciesId: integer("trade_species_id"),
  relativePhysicalStats: integer("relative_physical_stats"),
  needsOverworldRain: boolean("needs_overworld_rain").notNull(),
  turnUpsideDown: boolean("turn_upside_down").notNull(),
});

export const evolutionTriggerName = pgTable(
  "evolution_trigger_name",
  {
    triggerId: integer("trigger_id").notNull(),
    language: text("language").notNull(),
    name: text("name").notNull(),
  },
  (table) => [primaryKey({ columns: [table.triggerId, table.language] })],
);

export const location = pgTable("location", {
  id: integer("id").primaryKey(),
  identifier: text("identifier").notNull(),
});

export const locationName = pgTable(
  "location_name",
  {
    locationId: integer("location_id")
      .notNull()
      .references(() => location.id),
    language: text("language").notNull(),
    name: text("name").notNull(),
  },
  (table) => [primaryKey({ columns: [table.locationId, table.language] })],
);

export const locationArea = pgTable("location_area", {
  id: integer("id").primaryKey(),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  identifier: text("identifier").notNull(),
});

export const encounter = pgTable(
  "encounter",
  {
    id: integer("id").primaryKey(),
    pokemonId: integer("pokemon_id")
      .notNull()
      .references(() => pokemon.id),
    locationAreaId: integer("location_area_id")
      .notNull()
      .references(() => locationArea.id),
    versionId: integer("version_id")
      .notNull()
      .references(() => version.id),
    minLevel: integer("min_level").notNull(),
    maxLevel: integer("max_level").notNull(),
    methodId: integer("method_id"),
    rarity: integer("rarity"),
  },
  (table) => [index("encounter_pokemon_idx").on(table.pokemonId)],
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
