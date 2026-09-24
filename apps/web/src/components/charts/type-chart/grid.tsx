"use client";

import { AnimatePresence, motion } from "motion/react";
import { type CSSProperties, type ReactNode } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@pokedata/ui/lib/utils";
import { useTypeChart } from "./context";
import {
  abbreviate,
  accentOf,
  cellStyle,
  COVERAGE,
  factorLabel,
  factorText,
  ink,
  levelOf,
  RING,
  same,
  SUPER,
} from "./utils";

export function TypeChartGrid({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const {
    types,
    reduce,
    canHover,
    selection,
    settled,
    coverage,
    factorAt,
    hot,
    sweepRow,
    enter,
    press,
    clearOnEscape,
    setHover,
    gridRef,
    tooltipId,
  } = useTypeChart();
  return (
    <div
      ref={gridRef}
      className={cn("data-chart-grid relative grid gap-1", className)}
      style={
        {
          "--data-chart-columns": `76px repeat(${types.length}, minmax(22px, 1fr)) 44px`,
        } as CSSProperties
      }
      onPointerLeave={() => setHover(null)}
    >
      <span className="pb-1 pr-1.5 text-right text-xs text-muted-foreground">Att. ╲ Déf.</span>
      {types.map((column, x) => (
        <span
          key={column.id}
          title={column.name}
          className={cn(
            "pb-1 text-center text-xs transition-colors duration-200",
            hot?.x === x ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {abbreviate(column.name)}
        </span>
      ))}
      <span
        className={cn(
          "pb-1 text-center text-xs transition-colors duration-200",
          hot?.x === COVERAGE ? "text-foreground" : "text-muted-foreground",
        )}
      >
        ×2
      </span>

      {types.map((attacker, y) => (
        <div key={attacker.id} className="contents">
          <span
            className={cn(
              "flex items-center justify-end truncate pr-1.5 text-xs transition-colors duration-200",
              hot?.y === y ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {attacker.name}
          </span>

          {types.map((defender, x) => {
            const factor = factorAt(y, x);
            const on = same(hot, y, x);
            const picked = same(selection, y, x);
            const dim = !!hot && !on && hot.y !== y && hot.x !== x;
            const lift = settled && on && canHover && !reduce ? 1.15 : 1;
            return (
              // le span extérieur porte l'extinction, elle ne se bat jamais
              // avec les transformations à l'intérieur
              <span
                key={defender.id}
                className="data-chart-cell-dimming relative block aspect-square w-full transition-opacity duration-200"
                style={{ "--data-chart-opacity": dim ? "0.35" : "1" } as CSSProperties}
              >
                {/* la zone cliquable déborde d'une demi-gouttière de chaque côté,
                    la grille n'a donc aucun angle mort ; le visuel à l'intérieur
                    ne prend jamais le pointeur */}
                <motion.button
                  type="button"
                  data-type-cell={`${y}-${x}`}
                  aria-describedby={on ? tooltipId : undefined}
                  aria-label={`${attacker.name} contre ${defender.name} ${factorText(factor)}`}
                  aria-pressed={picked}
                  onPointerEnter={enter(y, x)}
                  onFocus={enter(y, x)}
                  onBlur={() => setHover(null)}
                  onClick={press(y, x)}
                  onKeyDown={clearOnEscape}
                  className="absolute -inset-0.5 block rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  whileTap={reduce ? undefined : { scale: 0.92, transition: SPRING_PRESS }}
                >
                  <motion.span
                    className="data-chart-cell-surface pointer-events-none absolute inset-0.5 grid place-items-center rounded-xs font-mono text-xs font-semibold tabular-nums"
                    style={
                      {
                        "--data-chart-background": cellStyle(factor, on).background,
                        "--data-chart-color": cellStyle(factor, on).color,
                        "--data-chart-shadow": picked ? RING : "none",
                      } as CSSProperties
                    }
                    initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                    // la vague diagonale à l'entrée ; une fois posée, la case
                    // survolée se soulève et survoler la couverture rejoue la ligne
                    animate={
                      sweepRow === y && !reduce
                        ? {
                            opacity: 1,
                            // une pulsation contenue sous la gouttière : une case
                            // au sommet n'empiète jamais sur ses voisines
                            scale: [1, 1.1, 1],
                            transition: { duration: 0.36, ease: EASE_OUT, delay: x * 0.02 },
                          }
                        : settled
                          ? { opacity: 1, scale: lift, transition: SPRING_PRESS }
                          : {
                              opacity: 1,
                              scale: 1,
                              transition: reduce
                                ? { duration: 0 }
                                : { ...SPRING_PRESS, delay: (y + x) * 0.02 },
                            }
                    }
                  >
                    {/* l'anneau vit DANS la case : inset-0 remplit sa boîte et
                        borderRadius:inherit copie son arrondi, il partage donc
                        toujours sa taille, son échelle et ses angles exacts */}
                    <AnimatePresence>
                      {on && !picked && levelOf(factor) !== "neutral" ? (
                        <motion.span
                          className="data-chart-cell-ring pointer-events-none absolute inset-0"
                          style={{ "--data-chart-ring-color": accentOf(factor) } as CSSProperties}
                          initial={reduce ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12, ease: EASE_OUT }}
                        />
                      ) : null}
                    </AnimatePresence>
                    {factorLabel(factor)}
                  </motion.span>
                </motion.button>
              </span>
            );
          })}

          <span
            className="data-chart-cell-dimming relative block transition-opacity duration-200"
            style={{ "--data-chart-opacity": hot && hot.y !== y ? "0.35" : "1" } as CSSProperties}
          >
            <motion.button
              type="button"
              data-type-cell={`${y}-${COVERAGE}`}
              aria-describedby={same(hot, y, COVERAGE) ? tooltipId : undefined}
              aria-label={`${attacker.name} : ${coverage[y]} types touchés ×2`}
              aria-pressed={same(selection, y, COVERAGE)}
              onPointerEnter={enter(y, COVERAGE)}
              onFocus={enter(y, COVERAGE)}
              onBlur={() => setHover(null)}
              onClick={press(y, COVERAGE)}
              onKeyDown={clearOnEscape}
              className="absolute -inset-0.5 block rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              whileTap={reduce ? undefined : { scale: 0.96, transition: SPRING_PRESS }}
            >
              <motion.span
                className={cn(
                  "data-chart-cell-content pointer-events-none absolute inset-0.5 grid place-items-center rounded-xs font-mono text-xs font-semibold tabular-nums",
                  same(hot, y, COVERAGE) ? "bg-background" : "bg-foreground/5",
                )}
                // une case neutre sous le chiffre coloré : une teinte de la même
                // couleur lui mangeait son contraste
                style={
                  {
                    "--data-chart-color": ink(SUPER),
                    "--data-chart-shadow": same(selection, y, COVERAGE)
                      ? RING
                      : same(hot, y, COVERAGE)
                        ? "inset 0 0 0 1px var(--border-strong)"
                        : "none",
                  } as CSSProperties
                }
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.4, ease: EASE_OUT, delay: 0.02 * (y + types.length) }
                }
              >
                {/* le total reçoit le même anneau affleurant que les cases,
                    sauf s'il porte déjà celui de la sélection */}
                <AnimatePresence>
                  {same(hot, y, COVERAGE) && !same(selection, y, COVERAGE) ? (
                    <motion.span
                      className="data-chart-cell-ring pointer-events-none absolute inset-0"
                      style={{ "--data-chart-ring-color": SUPER } as CSSProperties}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12, ease: EASE_OUT }}
                    />
                  ) : null}
                </AnimatePresence>
                {coverage[y]}
              </motion.span>
            </motion.button>
          </span>
        </div>
      ))}

      {children}
    </div>
  );
}
