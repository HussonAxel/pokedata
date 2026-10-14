/**
 * Les fonds de la table des types : le vert signe l'attaque efficace, le rouge
 * l'attaque freinée, le plein l'immunité. ×4 et ×¼ foncent la même teinte.
 */
export const MULTIPLIER_CLASSES: Record<number, string> = {
  4: "bg-success/45 text-foreground",
  2: "bg-success/25 text-foreground",
  1: "bg-foreground/5 text-muted-foreground",
  0.5: "bg-destructive/25 text-foreground",
  0.25: "bg-destructive/45 text-foreground",
  0: "bg-foreground/80 text-background",
};

const SYMBOLS: Record<number, string> = { 0.25: "¼", 0.5: "½" };

/** « ×2 », « ×½ », « ×0 ». */
export const formatMultiplier = (multiplier: number) =>
  `×${SYMBOLS[multiplier] ?? multiplier.toLocaleString("fr-FR")}`;
