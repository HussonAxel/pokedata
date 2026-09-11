import { createReadStream } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { pipeline } from "node:stream/promises";

import type { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";

import { META_SCHEMA, RAW_SCHEMA, type SourceInfo, csvDir, sourceFile } from "./config.ts";
import { createClient, quoteIdent } from "./db.ts";

/** Lit la seule ligne d'en-tête du CSV, sans charger le fichier en mémoire. */
async function readHeader(file: string) {
  const stream = createReadStream(file, { encoding: "utf8", highWaterMark: 64 * 1024 });
  let buffer = "";

  for await (const chunk of stream) {
    buffer += chunk;
    const newline = buffer.indexOf("\n");

    if (newline !== -1) {
      stream.destroy();
      buffer = buffer.slice(0, newline);
      break;
    }
  }

  return buffer
    .replace(/^﻿/, "")
    .replace(/\r$/, "")
    .split(",")
    .map((column) => column.trim());
}

async function readSource(): Promise<SourceInfo> {
  try {
    return JSON.parse(await readFile(sourceFile, "utf8")) as SourceInfo;
  } catch {
    throw new Error("Aucune source téléchargée. Lancer `pnpm ingest:fetch` d'abord.");
  }
}

async function createMetaSchema(client: Client) {
  await client.query(`create schema if not exists ${quoteIdent(META_SCHEMA)}`);
  await client.query(`
    create table if not exists ${quoteIdent(META_SCHEMA)}.import_run (
      id serial primary key,
      source_repo text not null,
      source_ref text not null,
      source_sha text not null,
      committed_at timestamptz,
      started_at timestamptz not null default now(),
      finished_at timestamptz,
      status text not null default 'running',
      table_count integer,
      row_counts jsonb,
      error text
    )
  `);
}

/**
 * Charge les CSV dans le schéma `staging`, à l'identique : une table par fichier,
 * toutes les colonnes en text, aucune transformation. Le typage et les décisions
 * de modélisation appartiennent à l'étape `transform`.
 */
export async function runStage() {
  const source = await readSource();
  const files = (await readdir(csvDir)).filter((file) => file.endsWith(".csv")).sort();

  if (files.length === 0) {
    throw new Error(`Aucun CSV dans ${csvDir}. Lancer \`pnpm ingest:fetch\` d'abord.`);
  }

  console.log(`source   ${source.repo}@${source.sha.slice(0, 7)} (${source.committedAt})`);
  console.log(`fichiers ${files.length}`);

  const client = createClient();
  await client.connect();

  await createMetaSchema(client);

  // Hors transaction : la trace de l'exécution doit survivre à un échec du chargement.
  const run = await client.query<{ id: number }>(
    `insert into ${quoteIdent(META_SCHEMA)}.import_run
       (source_repo, source_ref, source_sha, committed_at)
     values ($1, $2, $3, $4)
     returning id`,
    [source.repo, source.ref, source.sha, source.committedAt],
  );
  const runId = run.rows[0]?.id;

  try {
    // Tout le chargement dans une transaction : en cas d'échec, le schéma
    // `staging` précédent reste intact (le DDL est transactionnel sous Postgres).
    await client.query("begin");
    await client.query(`drop schema if exists ${quoteIdent(RAW_SCHEMA)} cascade`);
    await client.query(`create schema ${quoteIdent(RAW_SCHEMA)}`);

    const rowCounts: Record<string, number> = {};

    for (const file of files) {
      const path = join(csvDir, file);
      const table = basename(file, ".csv");
      const columns = await readHeader(path);

      if (columns.length === 0 || columns.some((column) => column.length === 0)) {
        throw new Error(`En-tête illisible dans ${file}`);
      }

      const qualified = `${quoteIdent(RAW_SCHEMA)}.${quoteIdent(table)}`;
      const definition = columns.map((column) => `${quoteIdent(column)} text`).join(", ");

      await client.query(`create table ${qualified} (${definition})`);

      const columnList = columns.map(quoteIdent).join(", ");
      const copy = client.query(
        copyFrom(`copy ${qualified} (${columnList}) from stdin with (format csv, header true)`),
      );

      await pipeline(createReadStream(path), copy);

      const count = await client.query<{ count: string }>(
        `select count(*)::text from ${qualified}`,
      );
      rowCounts[table] = Number(count.rows[0]?.count ?? 0);

      console.log(`  ${table.padEnd(44)} ${String(rowCounts[table]).padStart(9)} lignes`);
    }

    await client.query("commit");

    const total = Object.values(rowCounts).reduce((sum, count) => sum + count, 0);

    await client.query(
      `update ${quoteIdent(META_SCHEMA)}.import_run
         set status = 'done', finished_at = now(), table_count = $2, row_counts = $3
       where id = $1`,
      [runId, files.length, JSON.stringify(rowCounts)],
    );

    console.log(`\nchargé   ${files.length} tables, ${total.toLocaleString("fr-FR")} lignes`);
  } catch (error) {
    await client.query("rollback");
    await client.query(
      `update ${quoteIdent(META_SCHEMA)}.import_run
         set status = 'failed', finished_at = now(), error = $2
       where id = $1`,
      [runId, error instanceof Error ? error.message : String(error)],
    );
    throw error;
  } finally {
    await client.end();
  }
}
