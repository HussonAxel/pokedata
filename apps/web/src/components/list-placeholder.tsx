import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@pokedata/ui/components/empty";
import type { ReactNode } from "react";

/** Page d'une liste quand rien n'est encore ouvert : la liste est dans la colonne voisine. */
export function ListPlaceholder({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Empty id="contenu" className="h-full">
      <EmptyHeader>
        <EmptyTitle>
          <h1>{title}</h1>
        </EmptyTitle>
        <EmptyDescription>{children}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
