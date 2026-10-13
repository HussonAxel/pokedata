import { cn } from "@pokedata/ui/lib/utils";
import type { ComponentProps } from "react";

/** Numéro du Pokédex national sur quatre chiffres : « 0012 ». */
export const formatDexNumber = (dexNumber: number) => String(dexNumber).padStart(4, "0");

/** Numéro du Pokédex affiché en dot-matrix (docs/design.md). */
export function DexNumber({
  value,
  className,
  ...props
}: ComponentProps<"span"> & { value: number }) {
  return (
    <span className={cn("font-dot font-black tracking-wider tabular-nums", className)} {...props}>
      <span className="sr-only">Numéro </span>
      {formatDexNumber(value)}
    </span>
  );
}
