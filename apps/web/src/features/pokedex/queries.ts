import { orpc } from "@/utils/orpc";

/**
 * Le catalogue ne change qu'à l'import : le revalider pendant une session de
 * navigation ne peut rien rapporter. À remplacer par une clé de cache portant la
 * version du catalogue (`ingest.transform_run`) quand les imports seront
 * automatisés — l'invalidation viendra alors de la publication, pas d'un délai.
 */
export const CATALOG_STALE_TIME = 60 * 60 * 1000;

export type CatalogScope = {
  locale: "fr" | "en";
  generationId: number;
};

export function pokedexIndexOptions(scope: CatalogScope) {
  return orpc.pokedex.index.queryOptions({
    input: scope,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function pokedexReferenceOptions(scope: CatalogScope) {
  return orpc.pokedex.reference.queryOptions({
    input: scope,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function pokedexDetailOptions(scope: CatalogScope & { identifier: string }) {
  return orpc.pokedex.detail.queryOptions({
    input: scope,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function pokedexTypeChartOptions(scope: CatalogScope) {
  return orpc.pokedex.typeChart.queryOptions({
    input: scope,
    staleTime: CATALOG_STALE_TIME,
  });
}
