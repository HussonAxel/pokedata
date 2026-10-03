import { z } from "zod";

export const LATEST_GENERATION = 9;

/**
 * Filtres de la liste, partagés par la liste et la fiche : ils vivent dans
 * l'URL, donc une vue se partage et ouvrir une fiche ne réinitialise rien.
 */
export const pokedexSearchSchema = z.object({
  q: z.string().trim().max(50).optional(),
  // Un ou deux types, séparés par une virgule (`fire,flying`) : voir `parseTypes`.
  type: z.string().max(40).optional(),
  gen: z.coerce.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION),
});

export const MAX_TYPES = 2;

export function parseTypes(type: string | undefined) {
  return type ? type.split(",").filter(Boolean).slice(0, MAX_TYPES) : [];
}

/** Ajoute ou retire un type ; au-delà de `MAX_TYPES`, le plus ancien choix est remplacé. */
export function toggleType(type: string | undefined, identifier: string) {
  const current = parseTypes(type);
  const next = current.includes(identifier)
    ? current.filter((entry) => entry !== identifier)
    : [...current, identifier].slice(-MAX_TYPES);

  return next.length > 0 ? next.join(",") : undefined;
}

export type PokedexSearch = z.infer<typeof pokedexSearchSchema>;

/** Onglets de la fiche : l'identifiant vit dans l'URL, les libellés ici. */
export const POKEMON_TABS = [
  ["apercu", "Aperçu"],
  ["evolutions", "Évolutions"],
  ["elevage", "Élevage"],
  ["attaques", "Attaques"],
  ["rencontres", "Rencontres"],
  ["medias", "Médias"],
] as const;

export type PokemonTab = (typeof POKEMON_TABS)[number][0];

export const DEFAULT_POKEMON_TAB: PokemonTab = "apercu";

export const pokemonSearchSchema = pokedexSearchSchema.extend({
  // Un onglet inconnu retombe sur l'aperçu au lieu de casser le lien.
  onglet: z
    .enum(POKEMON_TABS.map(([id]) => id) as [PokemonTab, ...PokemonTab[]])
    .optional()
    .catch(undefined),
});
