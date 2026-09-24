"use client";
// Dérivé de beui.dev/charts/returns-calendar : même grammaire visuelle,
// données du catalogue (efficacité des types) à la place des rendements.

import { cn } from "@pokedata/ui/lib/utils";
import { TypeChartContext, useTypeChartModel } from "./type-chart/context";
import { TypeChartGrid } from "./type-chart/grid";
import { TypeChartTooltip } from "./type-chart/tooltip";
import type { TypeChartProps } from "./type-chart/types";

/** Composez Grid et Tooltip, ou omettez les enfants pour la table complète. */
export function TypeChart({ children, className, ...props }: TypeChartProps) {
  const model = useTypeChartModel(props);
  return (
    <TypeChartContext.Provider value={model}>
      <div className={cn("w-full min-w-[640px] [--ink-l:0.45] dark:[--ink-l:1]", className)}>
        {children === undefined ? (
          <TypeChartGrid>
            <TypeChartTooltip />
          </TypeChartGrid>
        ) : (
          children
        )}
      </div>
    </TypeChartContext.Provider>
  );
}

export { useTypeChart } from "./type-chart/context";
export { TypeChartGrid } from "./type-chart/grid";
export { TypeChartTooltip } from "./type-chart/tooltip";
export type { TypeChartProps, TypeChartTooltipData, TypeChartType } from "./type-chart/types";

// Un alias local garde cette forme de données hors de la liste des composants.
export type TypeChartCell = import("./type-chart/types").TypeChartCell;
