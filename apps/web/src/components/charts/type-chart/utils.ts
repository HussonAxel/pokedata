import type { TypeChartCell } from "./types";

export const SUPER = "var(--success)";

export const WEAK = "var(--destructive)";

/** La colonne de couverture, adressée comme un dix-neuvième type. */
export const COVERAGE = -1;

/** Multiplicateur lisible ; le neutre ne s'écrit pas, il se lit au vide. */
export const FACTOR_LABEL: Record<number, string> = {
  0: "0",
  25: "¼",
  50: "½",
  100: "",
  200: "2",
  400: "4",
};

export const factorLabel = (factor: number) => FACTOR_LABEL[factor] ?? String(factor / 100);

/** Toujours prononçable, y compris hors du tableau : « ×2 », « ×½ ». */
export const factorText = (factor: number) => `×${FACTOR_LABEL[factor] || "1"}`;

export type TypeChartLevel = "super" | "resist" | "immune" | "neutral";

/**
 * Quatre niveaux, pas un dégradé : l'immunité et la résistance partagent le
 * camp de la défense mais ne doivent jamais se confondre à l'œil.
 */
export const levelOf = (factor: number): TypeChartLevel =>
  factor === 0 ? "immune" : factor > 100 ? "super" : factor < 100 ? "resist" : "neutral";

export const levelNote: Record<TypeChartLevel, string | null> = {
  super: "très efficace",
  resist: "peu efficace",
  immune: "immunisé",
  neutral: null,
};

export const factorNote = (factor: number) => levelNote[levelOf(factor)];

/** La teinte qui signe le niveau : anneau au survol, chiffre d'infobulle. */
export const levelAccent: Record<TypeChartLevel, string> = {
  super: SUPER,
  resist: WEAK,
  immune: "var(--foreground)",
  neutral: "var(--border-strong)",
};

export const accentOf = (factor: number) => levelAccent[levelOf(factor)];

/** Une teinte en texte : sur le fond clair sa clarté est bridée pour que les
 * petits chiffres atteignent AA, en sombre elle reste native (`--ink-l`). */
export const ink = (color: string) => `oklch(from ${color} min(l, var(--ink-l, 1)) c h)`;

/**
 * Le fond porte la couleur, l'encre porte le contraste : un chiffre teinté sur
 * son propre fond teinté tombait sous AA à 11px. L'immunité inverse le couple,
 * c'est la seule case pleine de la grille.
 */
export const cellStyle = (factor: number, on: boolean): { background: string; color: string } => {
  switch (levelOf(factor)) {
    case "super":
      return {
        background: `color-mix(in srgb, ${SUPER} ${on ? 44 : 24}%, transparent)`,
        color: "var(--foreground)",
      };
    case "resist":
      return {
        background: `color-mix(in srgb, ${WEAK} ${on ? 40 : 22}%, transparent)`,
        color: "var(--foreground)",
      };
    case "immune":
      return {
        background: `color-mix(in srgb, var(--foreground) ${on ? 88 : 78}%, transparent)`,
        color: "var(--background)",
      };
    default:
      return {
        background: `color-mix(in srgb, var(--foreground) ${on ? 10 : 4}%, transparent)`,
        color: "var(--muted-foreground)",
      };
  }
};

export const same = (cell: TypeChartCell | null, y: number, x: number) =>
  cell?.y === y && cell?.x === x;

/** Trois lettres suffisent en tête de colonne, le libellé complet reste au survol. */
export const abbreviate = (name: string) => name.slice(0, 3);

export const RING = "inset 0 0 0 1.5px var(--foreground)";
