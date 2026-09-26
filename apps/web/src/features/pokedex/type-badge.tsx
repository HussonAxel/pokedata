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

const TYPE_LABELS: Record<string, string> = {
  normal: "Normal",
  fighting: "Combat",
  flying: "Vol",
  poison: "Poison",
  ground: "Sol",
  rock: "Roche",
  bug: "Insecte",
  ghost: "Spectre",
  steel: "Acier",
  fire: "Feu",
  water: "Eau",
  grass: "Plante",
  electric: "Électrik",
  psychic: "Psy",
  ice: "Glace",
  dragon: "Dragon",
  dark: "Ténèbres",
  fairy: "Fée",
  stellar: "Stellaire",
};

/** Teinte d'un type (fond léger, encre lisible), pour les surfaces hors badge. */
export function typeTint(identifier: string) {
  return TYPE_CLASSES[identifier] ?? "bg-muted text-muted-foreground";
}

export function TypeBadge({ identifier, label }: { identifier: string; label?: string }) {
  const name = label ?? TYPE_LABELS[identifier] ?? identifier;

  return (
    <img
      src={`/pokemon-types/${identifier}.svg`}
      alt={name}
      title={name}
      width={24}
      height={24}
      decoding="async"
      className="size-6 shrink-0 object-contain"
    />
  );
}
