import { z } from "zod";

import { LATEST_GENERATION } from "@/features/pokedex/search";

/**
 * Recherche d'une liste de l'encyclopédie, partagée par la liste et ses fiches :
 * ouvrir une fiche ne réinitialise pas la recherche.
 */
export const encyclopediaSearchSchema = z.object({
  q: z.string().trim().max(50).optional(),
  gen: z.coerce.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION),
});

export type EncyclopediaSearch = z.infer<typeof encyclopediaSearchSchema>;

/** Recherche insensible à la casse et aux accents : « electrik » trouve « Électrik ». */
export function normalizeSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
