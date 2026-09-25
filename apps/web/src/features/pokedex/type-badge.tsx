import type { ReactNode } from "react";

const TYPE_CLASSES: Record<string, string> = {
  normal: "bg-stone-500/10 text-stone-700 dark:text-stone-300",
  fighting: "bg-red-500/10 text-red-700 dark:text-red-300",
  flying: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  poison: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  ground: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rock: "bg-yellow-500/10 text-yellow-800 dark:text-yellow-300",
  bug: "bg-lime-500/10 text-lime-800 dark:text-lime-300",
  ghost: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  steel: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  fire: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  water: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  grass: "bg-green-500/10 text-green-700 dark:text-green-300",
  electric: "bg-yellow-500/10 text-yellow-800 dark:text-yellow-300",
  psychic: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  ice: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  dragon: "bg-indigo-600/10 text-indigo-800 dark:text-indigo-300",
  dark: "bg-stone-700/10 text-stone-800 dark:text-stone-300",
  fairy: "bg-pink-400/10 text-pink-700 dark:text-pink-300",
  stellar: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
};

export function TypeBadge({
  identifier,
  label,
  icon,
}: {
  identifier: string;
  label?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-current/20 px-2.5 py-1 text-xs font-medium capitalize ${
        TYPE_CLASSES[identifier] ?? "border-border bg-muted text-muted-foreground"
      }`}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex [&_svg]:size-3.5">
          {icon}
        </span>
      ) : null}
      {label ?? identifier}
    </span>
  );
}
