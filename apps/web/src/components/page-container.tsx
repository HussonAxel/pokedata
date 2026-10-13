import { cn } from "@pokedata/ui/lib/utils";
import type { ComponentProps } from "react";

/** Contenu principal d'une page : largeur de lecture, marges et rythme vertical. */
export function PageContainer({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      id="contenu"
      className={cn(
        "@container mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 px-5 py-6 @2xl:px-8",
        className,
      )}
      {...props}
    />
  );
}
