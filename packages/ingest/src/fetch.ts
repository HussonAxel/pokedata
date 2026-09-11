import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";

import { extract } from "tar";

import {
  CSV_PATH_IN_REPO,
  REPO,
  type SourceInfo,
  cacheDir,
  csvDir,
  ref,
  sourceFile,
} from "./config.ts";

type CommitResponse = {
  sha: string;
  commit: { committer: { date: string } };
};

/**
 * Résout une référence Git (branche, tag ou SHA) en SHA de commit, pour que
 * l'import enregistre exactement la version des données qu'il a chargée.
 */
async function resolveCommit() {
  const response = await fetch(`https://api.github.com/repos/${REPO}/commits/${ref}`, {
    headers: { accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    throw new Error(`Résolution de la référence "${ref}" échouée : HTTP ${response.status}`);
  }

  const commit = (await response.json()) as CommitResponse;

  return { sha: commit.sha, committedAt: commit.commit.committer.date };
}

/** Télécharge les CSV du dépôt PokéAPI dans .cache/csv, sans cloner le dépôt entier. */
export async function runFetch() {
  const { sha, committedAt } = await resolveCommit();
  console.log(`source   ${REPO}@${ref} -> ${sha}`);
  console.log(`commit   ${committedAt}`);

  const response = await fetch(`https://codeload.github.com/${REPO}/tar.gz/${sha}`);

  if (!response.ok || !response.body) {
    throw new Error(`Téléchargement de l'archive échoué : HTTP ${response.status}`);
  }

  await rm(cacheDir, { recursive: true, force: true });
  await mkdir(csvDir, { recursive: true });

  // L'archive contient <repo>-<sha>/data/v2/csv/<fichier>.csv : on retire ces
  // quatre niveaux pour extraire les CSV directement à plat.
  const stripDepth = CSV_PATH_IN_REPO.split("/").length + 1;

  await pipeline(
    Readable.fromWeb(response.body as WebReadableStream<Uint8Array>),
    extract({
      cwd: csvDir,
      strip: stripDepth,
      filter: (path) => path.includes(`/${CSV_PATH_IN_REPO}/`) && path.endsWith(".csv"),
    }),
  );

  const files = await readdir(csvDir);

  if (files.length === 0) {
    throw new Error("Aucun CSV extrait : la structure du dépôt a probablement changé.");
  }

  const source: SourceInfo = {
    repo: REPO,
    ref,
    sha,
    committedAt,
    fetchedAt: new Date().toISOString(),
  };

  await writeFile(sourceFile, `${JSON.stringify(source, null, 2)}\n`);

  console.log(`extrait  ${files.length} fichiers CSV dans ${csvDir}`);
}
