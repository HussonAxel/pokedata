import dotenv from "dotenv";
import { Client } from "pg";

import { envFile } from "./config.ts";

dotenv.config({ path: envFile, quiet: true });

export function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(`DATABASE_URL absent. Attendu dans ${envFile}`);
  }

  return new Client({ connectionString });
}

/** Échappe un identifiant SQL (nom de schéma, de table ou de colonne). */
export function quoteIdent(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
