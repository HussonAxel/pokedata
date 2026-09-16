export const STAT_LABELS: Record<string, string> = {
  hp: "PV",
  attack: "Attaque",
  defense: "Défense",
  "special-attack": "Attaque spéciale",
  "special-defense": "Défense spéciale",
  speed: "Vitesse",
  special: "Spécial",
};

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 });
export function formatNumber(value: number) {
  return number.format(value);
}

export function formatMeasurement(value: number | null, unit: string) {
  return value === null ? "Non renseigné" : `${formatNumber(value / 10)} ${unit}`;
}

export function formatGender(rate: number) {
  if (rate === -1) return "Asexué";
  return `${formatNumber((8 - rate) * 12.5)} % mâles · ${formatNumber(rate * 12.5)} % femelles`;
}

/** Les noms de formes ne sont pas encore traduits dans le catalogue. */
export function formatForm(identifier: string) {
  return identifier.replaceAll("-", " ");
}

export function formatEvolutionCondition(condition: {
  triggerName: string | null;
  minimumLevel: number | null;
  minimumHappiness: number | null;
  minimumBeauty: number | null;
  minimumAffection: number | null;
  timeOfDay: string | null;
  needsOverworldRain: boolean;
  turnUpsideDown: boolean;
}) {
  return (
    [
      condition.triggerName,
      condition.minimumLevel !== null ? `niveau ${condition.minimumLevel}` : null,
      condition.minimumHappiness !== null ? `bonheur ≥ ${condition.minimumHappiness}` : null,
      condition.minimumBeauty !== null ? `beauté ≥ ${condition.minimumBeauty}` : null,
      condition.minimumAffection !== null ? `affection ≥ ${condition.minimumAffection}` : null,
      condition.timeOfDay ? condition.timeOfDay : null,
      condition.needsOverworldRain ? "sous la pluie" : null,
      condition.turnUpsideDown ? "console retournée" : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Condition non renseignée"
  );
}
