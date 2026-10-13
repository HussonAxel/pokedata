/** Libellés des données codées du catalogue (identifiants PokéAPI). */

const DAMAGE_CLASS_LABELS: Record<string, string> = {
  physical: "Physique",
  special: "Spéciale",
  status: "Statut",
};

export const formatDamageClass = (damageClass: string | null) =>
  damageClass ? (DAMAGE_CLASS_LABELS[damageClass] ?? damageClass) : "—";

const FIRMNESS_LABELS: Record<string, string> = {
  "very-soft": "Très tendre",
  soft: "Tendre",
  hard: "Ferme",
  "very-hard": "Très ferme",
  "super-hard": "Super ferme",
};

export const formatFirmness = (firmness: string | null) =>
  firmness ? (FIRMNESS_LABELS[firmness] ?? firmness) : "Non renseignée";

/** Saveurs des baies, dans l'ordre des jeux. */
export const FLAVORS = [
  ["spicy", "Épicé"],
  ["dry", "Sec"],
  ["sweet", "Sucré"],
  ["bitter", "Amer"],
  ["sour", "Acide"],
] as const;

/** « 90 » ou « — » pour une valeur absente (attaque de statut, précision infaillible). */
export const formatValue = (value: number | null | undefined, unit = "") =>
  value === null || value === undefined ? "—" : `${value.toLocaleString("fr-FR")}${unit}`;
