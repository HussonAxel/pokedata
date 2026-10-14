import { useSuspenseQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { formatDamageClass } from "@/features/encyclopedia/format";
import {
  berryListOptions,
  itemListOptions,
  moveListOptions,
  talentListOptions,
} from "@/features/encyclopedia/queries";
import { normalizeSearch } from "@/features/encyclopedia/search";
import { formatDexNumber } from "@/features/pokedex/dex-number";
import { pokedexIndexOptions } from "@/features/pokedex/queries";

export const SEARCH_SCOPE = { locale: "fr", generationId: 9 } as const;

/** Résultats affichés par catégorie ; le reste se trouve dans la liste dédiée. */
export const RESULTS_PER_GROUP = 8;

/** Les listes interrogées par la recherche, dans un ordre fixe. */
export const searchQueries = () =>
  [
    pokedexIndexOptions(SEARCH_SCOPE),
    talentListOptions(SEARCH_SCOPE),
    moveListOptions(SEARCH_SCOPE),
    itemListOptions(SEARCH_SCOPE),
    berryListOptions(SEARCH_SCOPE),
  ] as const;

export type SearchResult = {
  identifier: string;
  name: string;
  detail?: string;
  /** Texte comparé à la recherche : nom, et numéro pour les Pokémon. */
  text: string;
};

function match(entries: SearchResult[], needle: string) {
  const found = entries.filter((entry) => normalizeSearch(entry.text).includes(needle));
  // Les noms qui commencent par la recherche passent devant ; le tri est stable.
  found.sort(
    (a, b) =>
      Number(!normalizeSearch(a.name).startsWith(needle)) -
      Number(!normalizeSearch(b.name).startsWith(needle)),
  );
  return { total: found.length, results: found.slice(0, RESULTS_PER_GROUP) };
}

/**
 * Recherche dans tout le catalogue, côté navigateur : les listes sont celles des
 * colonnes de l'encyclopédie, déjà en cache, et une frappe ne coûte aucune requête.
 */
export function useGlobalSearch(query: string) {
  const [pokemon, talents, moves, items, berries] = useSuspenseQueries({
    queries: searchQueries(),
  });

  // Les entrées comparables ne dépendent que des données, pas de la frappe.
  const groups = useMemo(
    () => ({
      pokemon: pokemon.data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        detail: `N° ${formatDexNumber(entry.dexNumber)}`,
        text: `${entry.name} ${formatDexNumber(entry.dexNumber)}`,
      })),
      talents: talents.data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        detail: `Génération ${entry.introducedIn}`,
        text: entry.name,
      })),
      moves: moves.data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        detail: formatDamageClass(entry.damageClass),
        text: entry.name,
      })),
      items: items.data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        detail: entry.category ?? undefined,
        text: entry.name,
      })),
      berries: berries.data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        text: entry.name,
      })),
    }),
    [pokemon.data, talents.data, moves.data, items.data, berries.data],
  );

  return useMemo(() => {
    const needle = normalizeSearch(query);
    if (needle.length < 2) return null;

    return {
      pokemon: match(groups.pokemon, needle),
      talents: match(groups.talents, needle),
      moves: match(groups.moves, needle),
      items: match(groups.items, needle),
      berries: match(groups.berries, needle),
    };
  }, [groups, query]);
}
