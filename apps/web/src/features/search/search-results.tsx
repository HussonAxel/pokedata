import { Button } from "@pokedata/ui/components/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@pokedata/ui/components/item";
import { ArrowRightIcon } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import {
  Section,
  SectionAction,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";

/** Une catégorie de résultats ; vide, elle ne s'affiche pas. */
export function SearchGroup({
  id,
  title,
  total,
  shown,
  allResults,
  children,
}: {
  id: string;
  title: string;
  total: number;
  shown: number;
  /** Lien vers la liste complète, recherche appliquée. */
  allResults: ReactElement;
  children: ReactNode;
}) {
  if (total === 0) return null;

  return (
    <Section id={id}>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        <SectionDescription>
          {total} résultat{total > 1 ? "s" : ""}
          {total > shown ? `, ${shown} premiers affichés` : ""}
        </SectionDescription>
        {total > shown ? (
          <SectionAction>
            <Button variant="outline" size="sm" nativeButton={false} render={allResults}>
              Tout voir
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </SectionAction>
        ) : null}
      </SectionHeader>
      <SectionContent>
        <ul className="grid gap-2 @lg:grid-cols-2">{children}</ul>
      </SectionContent>
    </Section>
  );
}

export function SearchResultItem({
  name,
  detail,
  link,
}: {
  name: string;
  detail?: string;
  link: ReactElement;
}) {
  return (
    <li>
      <Item variant="outline" render={link}>
        <ItemContent>
          <ItemTitle>{name}</ItemTitle>
          {detail ? <ItemDescription>{detail}</ItemDescription> : null}
        </ItemContent>
      </Item>
    </li>
  );
}
