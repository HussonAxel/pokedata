import { orpc } from "@/utils/orpc";
import { CATALOG_STALE_TIME, type CatalogScope } from "./queries";

export function talentDetailOptions(scope: CatalogScope & { identifier: string }) {
  return orpc.talents.detail.queryOptions({
    input: scope,
    staleTime: CATALOG_STALE_TIME,
  });
}
