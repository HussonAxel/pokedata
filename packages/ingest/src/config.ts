import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Dépôt source des données. CSV sous licence BSD-3 (PokéAPI) / MIT (veekun). */
export const REPO = "PokeAPI/pokeapi";

/** Emplacement des CSV dans le dépôt. */
export const CSV_PATH_IN_REPO = "data/v2/csv";

/**
 * Référence Git à importer. Par défaut la branche par défaut du dépôt, mais
 * `ingest:fetch` résout toujours la référence en SHA de commit et l'enregistre,
 * pour qu'un import soit rejouable à l'identique : POKEAPI_REF=<sha> pnpm ingest:fetch
 */
export const ref = process.env.POKEAPI_REF ?? "master";

export const cacheDir = join(packageRoot, ".cache");
export const csvDir = join(cacheDir, "csv");
export const sourceFile = join(cacheDir, "source.json");

/** Les scripts d'ingestion lisent DATABASE_URL au même endroit que drizzle.config.ts. */
export const envFile = join(packageRoot, "..", "..", "apps", "web", ".env");

/** Miroir brut des CSV. Détruit et reconstruit à chaque `ingest:stage`. */
export const RAW_SCHEMA = "staging";

/** Métadonnées d'import, conservées d'une exécution à l'autre. */
export const META_SCHEMA = "ingest";

export type SourceInfo = {
  repo: string;
  ref: string;
  sha: string;
  committedAt: string;
  fetchedAt: string;
};
