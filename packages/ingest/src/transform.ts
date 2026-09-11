import { readFile } from "node:fs/promises";

import type { Client } from "pg";

import { META_SCHEMA, type SourceInfo, sourceFile } from "./config.ts";
import { createClient, quoteIdent } from "./db.ts";

/** Langues remontées dans le modèle métier. Voir staging.languages. */
const LANGUAGES = "(5, 'fr'), (9, 'en')";

/**
 * Les tables du domaine, dans l'ordre de dépendance. Vidées en une fois avant
 * reconstruction : le catalogue est dérivé, jamais édité à la main.
 */
const DOMAIN_TABLES = [
  "pokemon_stat",
  "pokemon_type",
  "pokemon_form",
  "pokemon",
  "species_name",
  "species",
  "stat",
  "type_efficacy",
  "type_name",
  "type",
  "version",
  "version_group",
  "generation",
];

/**
 * Bornes d'existence d'une variété : la génération de son espèce, corrigée par
 * la plus ancienne version où l'une de ses formes a été introduite. Sans cela,
 * Raichu d'Alola apparaîtrait comme existant en première génération.
 */
const POKEMON_SPAN = `
  pokemon_span as (
    select p.id::int as pokemon_id,
           coalesce(
             (select min(vg.generation_id::int)
                from staging.pokemon_forms f
                join staging.version_groups vg on vg.id = f.introduced_in_version_group_id
               where f.pokemon_id = p.id),
             s.generation_id::int
           ) as from_generation
      from staging.pokemon p
      join staging.pokemon_species s on s.id = p.species_id
  )
`;

const STEPS: { label: string; sql: string }[] = [
  {
    label: "generation",
    sql: `
      insert into generation (id, identifier)
      select id::int, identifier from staging.generations
    `,
  },
  {
    label: "version_group",
    sql: `
      insert into version_group (id, identifier, generation_id, "order")
      select id::int, identifier, generation_id::int, "order"::int
        from staging.version_groups
    `,
  },
  {
    label: "version",
    sql: `
      insert into version (id, identifier, version_group_id)
      select id::int, identifier, version_group_id::int from staging.versions
    `,
  },
  {
    label: "type",
    sql: `
      insert into type (id, identifier, generation_id)
      select id::int, identifier, generation_id::int
        from staging.types
       where id::int < 10000
    `,
  },
  {
    label: "type_name",
    sql: `
      insert into type_name (type_id, language, name)
      select tn.type_id::int, l.code, tn.name
        from staging.type_names tn
        join (values ${LANGUAGES}) as l(id, code) on l.id = tn.local_language_id::int
       where tn.type_id::int < 10000
    `,
  },
  {
    // Table d'efficacité résolue par génération : une valeur historique
    // s'applique jusqu'à sa génération incluse, au-delà c'est la valeur courante.
    label: "type_efficacy",
    sql: `
      insert into type_efficacy (generation_id, damage_type_id, target_type_id, factor)
      with resolved as (
        select g.id::int as generation_id,
               te.damage_type_id::int as damage_type_id,
               te.target_type_id::int as target_type_id,
               te.damage_factor::int as current_factor,
               (select min(past.generation_id::int)
                  from staging.type_efficacy_past past
                 where past.damage_type_id = te.damage_type_id
                   and past.target_type_id = te.target_type_id
                   and past.generation_id::int >= g.id::int) as past_generation
          from staging.generations g
          cross join staging.type_efficacy te
          join staging.types dt on dt.id = te.damage_type_id and dt.generation_id::int <= g.id::int
          join staging.types tt on tt.id = te.target_type_id and tt.generation_id::int <= g.id::int
      )
      select r.generation_id,
             r.damage_type_id,
             r.target_type_id,
             coalesce(
               (select past.damage_factor::int
                  from staging.type_efficacy_past past
                 where past.damage_type_id::int = r.damage_type_id
                   and past.target_type_id::int = r.target_type_id
                   and past.generation_id::int = r.past_generation),
               r.current_factor
             )
        from resolved r
    `,
  },
  {
    label: "stat",
    sql: `
      insert into stat (id, identifier, is_battle_only)
      select id::int, identifier, is_battle_only = '1' from staging.stats
    `,
  },
  {
    label: "species",
    sql: `
      insert into species (
        id, identifier, generation_id, evolves_from_species_id, evolution_chain_id,
        gender_rate, capture_rate, base_happiness, hatch_counter,
        is_baby, is_legendary, is_mythical, has_gender_differences, "order"
      )
      select id::int,
             identifier,
             generation_id::int,
             nullif(evolves_from_species_id, '')::int,
             nullif(evolution_chain_id, '')::int,
             gender_rate::int,
             capture_rate::int,
             nullif(base_happiness, '')::int,
             nullif(hatch_counter, '')::int,
             is_baby = '1',
             is_legendary = '1',
             is_mythical = '1',
             has_gender_differences = '1',
             nullif("order", '')::int
        from staging.pokemon_species
    `,
  },
  {
    label: "species_name",
    sql: `
      insert into species_name (species_id, language, name, genus)
      select sn.pokemon_species_id::int, l.code, sn.name, nullif(sn.genus, '')
        from staging.pokemon_species_names sn
        join (values ${LANGUAGES}) as l(id, code) on l.id = sn.local_language_id::int
    `,
  },
  {
    label: "pokemon",
    sql: `
      insert into pokemon (id, identifier, species_id, height, weight, base_experience, is_default, "order")
      select id::int,
             identifier,
             species_id::int,
             nullif(height, '')::int,
             nullif(weight, '')::int,
             nullif(base_experience, '')::int,
             is_default = '1',
             nullif("order", '')::int
        from staging.pokemon
    `,
  },
  {
    label: "pokemon_form",
    sql: `
      insert into pokemon_form (
        id, identifier, form_identifier, pokemon_id, introduced_in_version_group_id,
        is_default, is_battle_only, is_mega, form_order, "order"
      )
      select id::int,
             identifier,
             nullif(form_identifier, ''),
             pokemon_id::int,
             nullif(introduced_in_version_group_id, '')::int,
             is_default = '1',
             is_battle_only = '1',
             is_mega = '1',
             nullif(form_order, '')::int,
             nullif("order", '')::int
        from staging.pokemon_forms
    `,
  },
  {
    // `pokemon_types_past` donne le typage complet d'une génération, pas un
    // correctif partiel : la valeur historique remplace donc tous les slots.
    label: "pokemon_type",
    sql: `
      insert into pokemon_type (pokemon_id, generation_id, slot, type_id)
      with ${POKEMON_SPAN},
      target as (
        select s.pokemon_id, g.id::int as generation_id
          from pokemon_span s
          join staging.generations g on g.id::int >= s.from_generation
      ),
      resolved as (
        select t.pokemon_id,
               t.generation_id,
               (select min(past.generation_id::int)
                  from staging.pokemon_types_past past
                 where past.pokemon_id::int = t.pokemon_id
                   and past.generation_id::int >= t.generation_id) as past_generation
          from target t
      )
      select r.pokemon_id, r.generation_id, past.slot::int, past.type_id::int
        from resolved r
        join staging.pokemon_types_past past
          on past.pokemon_id::int = r.pokemon_id
         and past.generation_id::int = r.past_generation
       where r.past_generation is not null
         and past.type_id::int < 10000
      union all
      select r.pokemon_id, r.generation_id, pt.slot::int, pt.type_id::int
        from resolved r
        join staging.pokemon_types pt on pt.pokemon_id::int = r.pokemon_id
       where r.past_generation is null
         and pt.type_id::int < 10000
    `,
  },
  {
    // Contrairement aux types, `pokemon_stats_past` est un correctif partiel :
    // il ne contient que les statistiques dont la valeur a changé. La résolution
    // se fait donc statistique par statistique, avec repli sur la valeur courante.
    //
    // Le périmètre varie aussi : la première génération avait une statistique
    // `special` unique (id 9), scindée en Spéciale Attaque / Spéciale Défense
    // à partir de la deuxième.
    label: "pokemon_stat",
    sql: `
      insert into pokemon_stat (pokemon_id, generation_id, stat_id, base_stat, effort)
      with ${POKEMON_SPAN},
      target as (
        select s.pokemon_id, g.id::int as generation_id
          from pokemon_span s
          join staging.generations g on g.id::int >= s.from_generation
      ),
      current_stat as materialized (
        select pokemon_id::int as pokemon_id,
               stat_id::int as stat_id,
               base_stat::int as base_stat,
               effort::int as effort
          from staging.pokemon_stats
      ),
      past_stat as materialized (
        select pokemon_id::int as pokemon_id,
               generation_id::int as generation_id,
               stat_id::int as stat_id,
               base_stat::int as base_stat,
               effort::int as effort
          from staging.pokemon_stats_past
      ),
      override as (
        select t.pokemon_id,
               t.generation_id,
               p.stat_id,
               p.base_stat,
               p.effort,
               row_number() over (
                 partition by t.pokemon_id, t.generation_id, p.stat_id
                 order by p.generation_id
               ) as rank
          from target t
          join past_stat p
            on p.pokemon_id = t.pokemon_id
           and p.generation_id >= t.generation_id
      ),
      scope as (
        select g.id::int as generation_id, s.id::int as stat_id
          from staging.generations g
          cross join staging.stats s
         where case
                 when g.id::int = 1 then s.id::int in (1, 2, 3, 6, 9)
                 else s.id::int in (1, 2, 3, 4, 5, 6)
               end
      )
      select t.pokemon_id,
             t.generation_id,
             sc.stat_id,
             coalesce(o.base_stat, c.base_stat),
             coalesce(o.effort, c.effort)
        from target t
        join scope sc on sc.generation_id = t.generation_id
        left join override o
          on o.pokemon_id = t.pokemon_id
         and o.generation_id = t.generation_id
         and o.stat_id = sc.stat_id
         and o.rank = 1
        left join current_stat c
          on c.pokemon_id = t.pokemon_id
         and c.stat_id = sc.stat_id
       where coalesce(o.base_stat, c.base_stat) is not null
    `,
  },
];

async function readSource(): Promise<SourceInfo> {
  try {
    return JSON.parse(await readFile(sourceFile, "utf8")) as SourceInfo;
  } catch {
    throw new Error("Aucune source connue. Lancer `pnpm ingest:fetch` puis `pnpm ingest:stage`.");
  }
}

async function assertStagingLoaded(client: Client) {
  const staged = await client.query<{ count: string }>(
    `select count(*)::text from information_schema.tables where table_schema = 'staging'`,
  );

  if (Number(staged.rows[0]?.count ?? 0) === 0) {
    throw new Error("Le schéma staging est vide. Lancer `pnpm ingest:stage` d'abord.");
  }
}

async function createMetaTable(client: Client) {
  await client.query(`
    create table if not exists ${quoteIdent(META_SCHEMA)}.transform_run (
      id serial primary key,
      source_sha text not null,
      started_at timestamptz not null default now(),
      finished_at timestamptz,
      status text not null default 'running',
      row_counts jsonb,
      error text
    )
  `);
}

/** staging -> modèle métier. Reconstruit intégralement les tables du catalogue. */
export async function runTransform() {
  const source = await readSource();
  const client = createClient();
  await client.connect();

  try {
    await assertStagingLoaded(client);
    await createMetaTable(client);

    const run = await client.query<{ id: number }>(
      `insert into ${quoteIdent(META_SCHEMA)}.transform_run (source_sha) values ($1) returning id`,
      [source.sha],
    );
    const runId = run.rows[0]?.id;

    try {
      await client.query("begin");
      await client.query(`truncate table ${DOMAIN_TABLES.join(", ")} cascade`);

      const rowCounts: Record<string, number> = {};

      for (const step of STEPS) {
        const result = await client.query(step.sql);
        rowCounts[step.label] = result.rowCount ?? 0;
        console.log(
          `  ${step.label.padEnd(20)} ${String(rowCounts[step.label]).padStart(9)} lignes`,
        );
      }

      await client.query("commit");

      await client.query(
        `update ${quoteIdent(META_SCHEMA)}.transform_run
           set status = 'done', finished_at = now(), row_counts = $2
         where id = $1`,
        [runId, JSON.stringify(rowCounts)],
      );

      const total = Object.values(rowCounts).reduce((sum, count) => sum + count, 0);
      console.log(
        `\nconstruit depuis ${source.sha.slice(0, 7)} : ${total.toLocaleString("fr-FR")} lignes`,
      );
    } catch (error) {
      await client.query("rollback");
      await client.query(
        `update ${quoteIdent(META_SCHEMA)}.transform_run
           set status = 'failed', finished_at = now(), error = $2
         where id = $1`,
        [runId, error instanceof Error ? error.message : String(error)],
      );
      throw error;
    }
  } finally {
    await client.end();
  }
}
