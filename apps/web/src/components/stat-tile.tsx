import { Item, ItemContent, ItemDescription } from "@pokedata/ui/components/item";
import { ArrowRightIcon } from "lucide-react";
import type { ReactElement } from "react";

/** Un chiffre en dot-matrix (docs/design.md), qui mène à la page correspondante. */
export function StatTile({
  value,
  label,
  link,
}: {
  value: number | string;
  label: string;
  link: ReactElement;
}) {
  return (
    <Item variant="outline" className="h-full" render={link}>
      <ItemContent>
        <span className="font-dot text-4xl font-black tabular-nums">
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </span>
        <ItemDescription>{label}</ItemDescription>
      </ItemContent>
      <ArrowRightIcon aria-hidden="true" className="size-4 text-muted-foreground" />
    </Item>
  );
}
