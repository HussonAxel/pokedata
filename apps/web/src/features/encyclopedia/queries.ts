import { CATALOG_STALE_TIME, type CatalogScope } from "@/features/pokedex/queries";
import { orpc } from "@/utils/orpc";

type DetailScope = CatalogScope & { identifier: string };

/* Listes de l'encyclopédie : une réponse entière, filtrée dans le navigateur. */

export const talentListOptions = (scope: CatalogScope) =>
  orpc.talents.list.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });

export const moveListOptions = (scope: CatalogScope) =>
  orpc.moves.list.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });

export const itemListOptions = (scope: CatalogScope) =>
  orpc.items.list.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });

export const berryListOptions = (scope: CatalogScope) =>
  orpc.berries.list.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });

/* Fiches. */

export const talentDetailOptions = (scope: DetailScope) =>
  orpc.talents.detail.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });

export const moveDetailOptions = (scope: DetailScope) =>
  orpc.moves.detail.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });

export const itemDetailOptions = (scope: DetailScope) =>
  orpc.items.detail.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });

export const berryDetailOptions = (scope: DetailScope) =>
  orpc.berries.detail.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });

export const typeDetailOptions = (scope: DetailScope) =>
  orpc.types.detail.queryOptions({ input: scope, staleTime: CATALOG_STALE_TIME });
