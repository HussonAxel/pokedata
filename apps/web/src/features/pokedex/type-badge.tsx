const TYPE_CLASSES: Record<string, string> = {
  normal: "bg-stone-300 text-stone-900",
  fighting: "bg-red-700 text-white",
  flying: "bg-indigo-300 text-indigo-950",
  poison: "bg-purple-600 text-white",
  ground: "bg-amber-600 text-white",
  rock: "bg-yellow-700 text-white",
  bug: "bg-lime-500 text-lime-950",
  ghost: "bg-violet-700 text-white",
  steel: "bg-slate-400 text-slate-950",
  fire: "bg-orange-500 text-white",
  water: "bg-blue-500 text-white",
  grass: "bg-green-500 text-green-950",
  electric: "bg-yellow-400 text-yellow-950",
  psychic: "bg-pink-500 text-white",
  ice: "bg-cyan-300 text-cyan-950",
  dragon: "bg-indigo-600 text-white",
  dark: "bg-stone-700 text-white",
  fairy: "bg-pink-300 text-pink-950",
  stellar: "bg-teal-400 text-teal-950",
};

export function TypeBadge({ identifier, label }: { identifier: string; label?: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        TYPE_CLASSES[identifier] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {label ?? identifier}
    </span>
  );
}
