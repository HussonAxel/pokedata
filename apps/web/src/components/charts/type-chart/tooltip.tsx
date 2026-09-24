"use client";
import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@pokedata/ui/lib/utils";
import { useTypeChart } from "./context";
import type { TypeChartCell, TypeChartTooltipData } from "./types";
import { accentOf, ink, levelOf } from "./utils";

export function TypeChartTooltip({
  children,
  className,
}: {
  children?: ReactNode | ((data: TypeChartTooltipData) => ReactNode);
  className?: string;
}) {
  const { gridRef, tooltipId, tip, tipFactor, tipValue, tipLabel, tipNote } = useTypeChart();
  const [dismissed, setDismissed] = useState<TypeChartCell | null>(null);
  const anchorRef = useMemo(
    () => ({
      get current() {
        return tip
          ? (gridRef.current?.querySelector<HTMLElement>(`[data-type-cell="${tip.y}-${tip.x}"]`) ??
              null)
          : null;
      },
    }),
    [gridRef, tip],
  );
  const data = { label: tipLabel, value: tipValue, note: tipNote, factor: tipFactor };
  return (
    <Tooltip
      key={tip ? `${tip.y}-${tip.x}` : "closed"}
      open={tip !== null && dismissed !== tip}
      onOpenChange={(open) => {
        if (!open) setDismissed(tip);
      }}
      id={tooltipId}
      anchorRef={anchorRef}
      className={cn("flex items-center gap-1.5", className)}
      content={
        typeof children === "function"
          ? children(data)
          : (children ?? (
              <>
                <span className="text-muted-foreground">{tipLabel}</span>
                <span
                  className="data-chart-tooltip-value font-mono tabular-nums"
                  style={
                    {
                      "--data-chart-tooltip-color":
                        levelOf(tipFactor) === "neutral"
                          ? "var(--foreground)"
                          : ink(accentOf(tipFactor)),
                    } as CSSProperties
                  }
                >
                  {tipValue}
                </span>
                {tipNote ? <span className="text-muted-foreground">{tipNote}</span> : null}
              </>
            ))
      }
    />
  );
}
