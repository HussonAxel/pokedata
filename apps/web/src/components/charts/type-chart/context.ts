"use client";

import { useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import type { TypeChartCell, TypeChartProps } from "./types";
import { COVERAGE, factorNote, factorText, same } from "./utils";

/**
 * La table des types en grille attaquants × défenseurs. Chaque case se teinte
 * vers la couleur « très efficace » ou « peu efficace » selon son écart au
 * neutre, et une colonne de couverture compte les ×2 de la ligne. Les cases
 * entrent en vague diagonale. Survoler une case affiche une infobulle et
 * éteint tout ce qui ne partage ni sa ligne ni sa colonne ; survoler la
 * couverture rejoue la ligne type par type. Cliquer épingle la case : la
 * grille garde la croix allumée jusqu'au clic suivant ou à Échap. Les reliefs
 * au survol sont réservés aux pointeurs fins, et le mode mouvement réduit ne
 * garde que les fondus.
 */
export function useTypeChartModel({
  types = [],
  factors = [],
  selection: controlledSelection,
  defaultSelection = null,
  onSelectionChange,
}: TypeChartProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [storedHover, setHover] = useState<TypeChartCell | null>(null);
  const [internalSelection, setInternalSelection] = useState(defaultSelection);
  const requestedSelection =
    controlledSelection === undefined ? internalSelection : controlledSelection;
  const validCell = (cell: TypeChartCell) =>
    Number.isInteger(cell.y) &&
    Number.isInteger(cell.x) &&
    cell.y >= 0 &&
    cell.y < types.length &&
    (cell.x === COVERAGE || (cell.x >= 0 && cell.x < types.length));
  const selection = requestedSelection && validCell(requestedSelection) ? requestedSelection : null;
  if (requestedSelection && !selection && controlledSelection === undefined)
    setInternalSelection(null);
  const hover = storedHover && validCell(storedHover) ? storedHover : null;
  if (storedHover && !hover) setHover(null);
  const setSelection = (next: TypeChartCell | null) => {
    if (controlledSelection === undefined) setInternalSelection(next);
    onSelectionChange?.(next);
  };
  const gridRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  // la vague d'entrée possède les cases jusqu'à son atterrissage ; les reliefs
  // au survol prennent le relais ensuite
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(
      () => setSettled(true),
      reduce ? 0 : (types.length * 2 + 1) * 20 + 500,
    );
    return () => clearTimeout(timer);
  }, [types.length, reduce]);

  const factorAt = (y: number, x: number) => factors[y]?.[x] ?? 100;
  /** Couverture offensive : le nombre de types encaissant plus que le neutre. */
  const coverage = useMemo(
    () =>
      types.map((_, y) =>
        types.reduce((count, _type, x) => count + (factorAt(y, x) > 100 ? 1 : 0), 0),
      ),
    [types, factors],
  );

  const select = (cell: TypeChartCell) => {
    setSelection(same(selection, cell.y, cell.x) ? null : cell);
  };
  const clear = () => setSelection(null);

  /** La case dont la grille suit la croix, les libellés et le rejeu de ligne. */
  const hot = hover ?? selection;
  /** La case qui porte l'infobulle : une case épinglée la garde ouverte. */
  const tip = hover ?? selection;
  // le rejeu de ligne est une fioriture de survol simple
  const sweepRow = hot?.x === COVERAGE ? hot.y : null;

  const tipFactor = tip ? (tip.x === COVERAGE ? 200 : factorAt(tip.y, tip.x)) : 100;
  const tipValue = tip
    ? tip.x === COVERAGE
      ? String(coverage[tip.y])
      : factorText(factorAt(tip.y, tip.x))
    : "";
  const tipLabel = tip
    ? tip.x === COVERAGE
      ? (types[tip.y]?.name ?? "")
      : `${types[tip.y]?.name ?? ""} → ${types[tip.x]?.name ?? ""}`
    : "";
  const tipNote = tip
    ? tip.x === COVERAGE
      ? "types touchés ×2"
      : factorNote(factorAt(tip.y, tip.x))
    : null;

  const enter = (y: number, x: number) => () => setHover({ y, x });
  const press = (y: number, x: number) => () => select({ y, x });
  const clearOnEscape = (event: { key: string }) => {
    if (event.key === "Escape") clear();
  };

  return {
    types,
    reduce,
    canHover,
    hover,
    selection,
    settled,
    coverage,
    factorAt,
    clear,
    hot,
    tip,
    sweepRow,
    tipFactor,
    tipValue,
    tipLabel,
    tipNote,
    enter,
    press,
    clearOnEscape,
    setHover,
    setSelection,
    gridRef,
    tooltipId,
  };
}

export const TypeChartContext = createContext<ReturnType<typeof useTypeChartModel> | null>(null);

export function useTypeChart() {
  const context = useContext(TypeChartContext);
  if (!context) throw new Error("Les parties de TypeChart doivent vivre dans TypeChart");
  return context;
}
