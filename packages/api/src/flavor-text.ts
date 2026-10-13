import { itemFlavorText, moveFlavorText, versionGroup } from "@pokedata/db/schema/catalog";
import { sql, type AnyColumn } from "drizzle-orm";

/**
 * Dernière description d'un élément du catalogue dans la langue et jusqu'à la
 * génération consultées. Voir aussi `abilityDescription`.
 */
function latestFlavorText(
  table: typeof moveFlavorText | typeof itemFlavorText,
  ownerColumn: AnyColumn,
  owner: AnyColumn,
  locale: "fr" | "en",
  generationId: number,
) {
  return sql<string | null>`(
    select ${table.flavorText}
    from ${table}
    join ${versionGroup} on ${versionGroup.id} = ${table.versionGroupId}
    where ${ownerColumn} = ${owner}
      and ${table.language} = ${locale}
      and ${versionGroup.generationId} <= ${generationId}
    order by ${versionGroup.generationId} desc, ${versionGroup.order} desc, ${versionGroup.id} desc
    limit 1
  )`;
}

export function moveDescription(owner: AnyColumn, locale: "fr" | "en", generationId: number) {
  return latestFlavorText(moveFlavorText, moveFlavorText.moveId, owner, locale, generationId);
}

export function itemDescription(owner: AnyColumn, locale: "fr" | "en", generationId: number) {
  return latestFlavorText(itemFlavorText, itemFlavorText.itemId, owner, locale, generationId);
}
