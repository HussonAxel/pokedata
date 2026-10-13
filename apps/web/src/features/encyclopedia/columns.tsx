import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

import { CatalogColumn } from "@/features/encyclopedia/catalog-column";
import { formatDamageClass, formatFirmness } from "@/features/encyclopedia/format";
import { ItemSprite } from "@/features/encyclopedia/item-sprite";
import {
  berryListOptions,
  itemListOptions,
  moveListOptions,
  talentListOptions,
} from "@/features/encyclopedia/queries";
import { LATEST_GENERATION } from "@/features/pokedex/search";
import { TypeBadge } from "@/features/pokedex/type-badge";

type ColumnProps = { mobile: boolean; className?: string; onSelect?: () => void };

/** Portée des listes : la génération de l'URL, la recherche reste à la colonne. */
function useListScope() {
  const { gen = LATEST_GENERATION, q } = useSearch({ strict: false });
  return { scope: { locale: "fr" as const, generationId: gen }, gen, q };
}

export function TalentColumn(props: ColumnProps) {
  const { scope, gen, q } = useListScope();
  const { data } = useSuspenseQuery(talentListOptions(scope));
  const entries = useMemo(
    () =>
      data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        meta: `Génération ${entry.introducedIn}`,
      })),
    [data.entries],
  );

  return (
    <CatalogColumn
      {...props}
      basePath="/encyclopedie/talents"
      label="talents"
      entries={entries}
      renderLink={(entry, onSelect) => (
        <Link
          to="/encyclopedie/talents/$talentId"
          params={{ talentId: entry.identifier }}
          search={{ gen, q }}
          resetScroll={false}
          onClick={onSelect}
        />
      )}
    />
  );
}

export function MoveColumn(props: ColumnProps) {
  const { scope, gen, q } = useListScope();
  const { data } = useSuspenseQuery(moveListOptions(scope));
  const entries = useMemo(
    () =>
      data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        media: <TypeBadge identifier={entry.type} />,
        meta: [
          formatDamageClass(entry.damageClass),
          entry.power ? `Puissance ${entry.power}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      })),
    [data.entries],
  );

  return (
    <CatalogColumn
      {...props}
      basePath="/encyclopedie/attaques"
      label="attaques"
      entries={entries}
      renderLink={(entry, onSelect) => (
        <Link
          to="/encyclopedie/attaques/$attaqueId"
          params={{ attaqueId: entry.identifier }}
          search={{ gen, q }}
          resetScroll={false}
          onClick={onSelect}
        />
      )}
    />
  );
}

export function ItemColumn(props: ColumnProps) {
  const { scope, gen, q } = useListScope();
  const { data } = useSuspenseQuery(itemListOptions(scope));
  const entries = useMemo(
    () =>
      data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        media: <ItemSprite identifier={entry.identifier} />,
        meta: entry.category ?? undefined,
      })),
    [data.entries],
  );

  return (
    <CatalogColumn
      {...props}
      basePath="/encyclopedie/objets"
      label="objets"
      entries={entries}
      renderLink={(entry, onSelect) => (
        <Link
          to="/encyclopedie/objets/$objetId"
          params={{ objetId: entry.identifier }}
          search={{ gen, q }}
          resetScroll={false}
          onClick={onSelect}
        />
      )}
    />
  );
}

export function BerryColumn(props: ColumnProps) {
  const { scope, gen, q } = useListScope();
  const { data } = useSuspenseQuery(berryListOptions(scope));
  const entries = useMemo(
    () =>
      data.entries.map((entry) => ({
        identifier: entry.identifier,
        name: entry.name,
        media: <ItemSprite identifier={entry.identifier} />,
        meta: formatFirmness(entry.firmness),
      })),
    [data.entries],
  );

  return (
    <CatalogColumn
      {...props}
      basePath="/encyclopedie/baies"
      label="baies"
      entries={entries}
      renderLink={(entry, onSelect) => (
        <Link
          to="/encyclopedie/baies/$baieId"
          params={{ baieId: entry.identifier }}
          search={{ gen, q }}
          resetScroll={false}
          onClick={onSelect}
        />
      )}
    />
  );
}
