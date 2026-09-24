import type { ReactNode } from "react";

/** Un type du catalogue, tel que renvoyé par `pokedex.typeChart`. */
export interface TypeChartType {
  id: number;
  identifier: string;
  name: string;
}

/** Ligne (type attaquant) et colonne ; la colonne `COVERAGE` vise le total. */
export type TypeChartCell = { y: number; x: number };

export interface TypeChartProps {
  /** Types dans l'ordre des lignes et des colonnes. */
  types?: TypeChartType[];
  /** `factors[attaquant][defenseur]` en centièmes : 0, 50, 100, 200. */
  factors?: number[][];
  className?: string;
  children?: ReactNode;
  selection?: TypeChartCell | null;
  defaultSelection?: TypeChartCell | null;
  onSelectionChange?: (selection: TypeChartCell | null) => void;
}

export interface TypeChartTooltipData {
  label: string;
  value: string;
  note: string | null;
  factor: number;
}
