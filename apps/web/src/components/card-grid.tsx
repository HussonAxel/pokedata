import { cn } from "@pokedata/ui/lib/utils";
import type { ComponentProps } from "react";

/** Grille de cartes qui suit la largeur de son conteneur (`@container`). */
export function CardGrid({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-3", className)} {...props} />;
}

export function CardGridItem(props: ComponentProps<"li">) {
  return <li {...props} />;
}
