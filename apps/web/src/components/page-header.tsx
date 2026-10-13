import { cn } from "@pokedata/ui/lib/utils";
import type { ComponentProps } from "react";

/**
 * En-tête d'une page de contenu : sur-titre technique, titre serif, métadonnées.
 *
 * ```tsx
 * <PageHeader>
 *   <PageEyebrow>talent ( 3 )</PageEyebrow>
 *   <PageTitle>Œil Composé</PageTitle>
 *   <PageMeta>Apparu en génération 3</PageMeta>
 * </PageHeader>
 * ```
 */
export function PageHeader({ className, ...props }: ComponentProps<"header">) {
  return <header className={cn("flex min-w-0 flex-col gap-2", className)} {...props} />;
}

/** Sur-titre en mono minuscule : « pokémon ( 0012 ) ». */
export function PageEyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("font-mono text-sm tracking-wide text-muted-foreground lowercase", className)}
      {...props}
    />
  );
}

export function PageTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "font-heading text-4xl font-medium tracking-tight text-balance wrap-anywhere @2xl:text-5xl",
        className,
      )}
      {...props}
    />
  );
}

/** Ligne de métadonnées en mono capitales. */
export function PageMeta({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("label-mono text-muted-foreground", className)} {...props} />;
}
