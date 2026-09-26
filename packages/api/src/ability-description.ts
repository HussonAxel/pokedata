import { ability, abilityFlavorText, versionGroup } from "@pokedata/db/schema/catalog";
import { sql } from "drizzle-orm";

/** Dernière description disponible dans la langue et jusqu'à la génération consultées. */
export function abilityDescription(locale: "fr" | "en", generationId: number) {
  return sql<string | null>`(
    select ${abilityFlavorText.flavorText}
    from ${abilityFlavorText}
    join ${versionGroup} on ${versionGroup.id} = ${abilityFlavorText.versionGroupId}
    where ${abilityFlavorText.abilityId} = ${ability.id}
      and ${abilityFlavorText.language} = ${locale}
      and ${versionGroup.generationId} <= ${generationId}
    order by ${versionGroup.generationId} desc, ${versionGroup.order} desc, ${versionGroup.id} desc
    limit 1
  )`;
}
