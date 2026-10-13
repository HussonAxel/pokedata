import { InputGroup, InputGroupAddon, InputGroupInput } from "@pokedata/ui/components/input-group";
import { ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@pokedata/ui/components/item";
import { cn } from "@pokedata/ui/lib/utils";
import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SearchIcon } from "lucide-react";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  Column,
  ColumnBody,
  ColumnEmpty,
  ColumnHeader,
  ColumnItem,
  ColumnList,
  LIST_COLUMN_WIDTH,
} from "@/components/columns-panel";
import { GenerationSelect } from "@/components/generation-select";
import { normalizeSearch } from "@/features/encyclopedia/search";
import { LATEST_GENERATION } from "@/features/pokedex/search";

const GENERATIONS = Array.from({ length: LATEST_GENERATION }, (_, index) => index + 1);

const ROW_HEIGHT = 48;
const LIST_PADDING = 8;

export type CatalogEntry = {
  identifier: string;
  name: string;
  /** Seconde ligne : catégorie, type, puissance… */
  meta?: ReactNode;
  /** Visuel en tête de ligne : icône de type, sprite d'objet. */
  media?: ReactNode;
};

/**
 * Troisième colonne d'une section de l'encyclopédie : une liste filtrable dont
 * chaque ligne ouvre une fiche. Comme la liste du Pokédex, la recherche vit dans
 * l'URL (`q`) et seules les lignes visibles existent dans le DOM.
 */
export function CatalogColumn({
  basePath,
  label,
  entries,
  renderLink,
  mobile,
  className,
  onSelect,
}: {
  /** Préfixe des fiches (`/encyclopedie/talents`) : sert à repérer la ligne ouverte. */
  basePath: string;
  /** Nom de la liste au pluriel, en minuscules (« talents »). */
  label: string;
  entries: CatalogEntry[];
  /** Lien vers la fiche d'une ligne ; la ligne en garde le rendu. */
  renderLink: (entry: CatalogEntry, onSelect?: () => void) => ReactElement;
  mobile: boolean;
  className?: string;
  onSelect?: () => void;
}) {
  const { q, gen = LATEST_GENERATION } = useSearch({ strict: false });
  const navigate = useNavigate();
  const selectedIdentifier = useRouterState({
    select: (router) =>
      router.location.pathname.startsWith(`${basePath}/`)
        ? decodeURIComponent(
            router.location.pathname.slice(basePath.length + 1).split("/")[0] ?? "",
          )
        : undefined,
  });

  const deferredQuery = useDeferredValue(q ?? "");
  const filtered = useMemo(() => {
    const needle = normalizeSearch(deferredQuery);
    if (!needle) return entries;
    return entries.filter((entry) => normalizeSearch(entry.name).includes(needle));
  }, [entries, deferredQuery]);

  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => viewport,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => filtered[index]?.identifier ?? index,
    paddingStart: LIST_PADDING,
    paddingEnd: LIST_PADDING,
    overscan: 10,
    // Côté serveur, aucune mesure n'existe : on rend de quoi remplir un écran.
    initialRect: { width: 0, height: 640 },
  });

  // Une nouvelle recherche repart du haut de la liste.
  useEffect(() => {
    viewport?.scrollTo({ top: 0 });
    // Seule la recherche compte ici, pas le viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery]);

  // Arrivé sur une fiche par son lien, on retrouve sa ligne.
  useEffect(() => {
    if (!viewport || !selectedIdentifier) return;
    const index = filtered.findIndex((entry) => entry.identifier === selectedIdentifier);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  const setQuery = (value: string) =>
    navigate({
      to: ".",
      search: (previous) => ({ ...previous, q: value || undefined }),
      replace: true,
      resetScroll: false,
    });

  return (
    <Column
      id={onSelect ? undefined : "items-list"}
      mobile={mobile}
      className={cn(LIST_COLUMN_WIDTH, className)}
    >
      <ColumnHeader className="flex-col items-stretch">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={q ?? ""}
            placeholder="Rechercher un nom"
            aria-label={`Rechercher dans les ${label}`}
            onChange={(event) => void setQuery(event.target.value)}
          />
        </InputGroup>
        <div className="flex items-end justify-between gap-3 px-1">
          <p className="label-mono text-muted-foreground" aria-live="polite">
            {filtered.length} {label}
          </p>
          <GenerationSelect
            label="Génération"
            value={gen}
            generations={GENERATIONS}
            onValueChange={(next) =>
              void navigate({
                to: ".",
                search: (previous) => ({ ...previous, gen: next }),
                resetScroll: false,
              })
            }
          />
        </div>
      </ColumnHeader>

      {filtered.length === 0 ? (
        <ColumnEmpty>Aucun résultat pour cette recherche.</ColumnEmpty>
      ) : (
        <ColumnBody viewportRef={setViewport}>
          <ColumnList
            size="row-lg"
            selectedIndex={filtered.findIndex((entry) => entry.identifier === selectedIdentifier)}
          >
            <ul
              className="relative h-(--list-height)"
              style={{ "--list-height": `${virtualizer.getTotalSize()}px` } as CSSProperties}
            >
              {virtualizer.getVirtualItems().map((row) => {
                const entry = filtered[row.index];
                if (!entry) return null;

                return (
                  <li
                    key={row.key}
                    aria-setsize={filtered.length}
                    aria-posinset={row.index + 1}
                    className="absolute inset-x-2 top-0 h-(--row-height) translate-y-(--row-start)"
                    style={
                      {
                        "--row-height": `${row.size}px`,
                        "--row-start": `${row.start}px`,
                      } as CSSProperties
                    }
                  >
                    <ColumnItem
                      size="row-lg"
                      selected={entry.identifier === selectedIdentifier}
                      render={renderLink(entry, onSelect)}
                    >
                      {entry.media ? <ItemMedia>{entry.media}</ItemMedia> : null}
                      <ItemContent className="min-w-0">
                        <ItemTitle className="w-full">{entry.name}</ItemTitle>
                        {entry.meta ? <ItemDescription>{entry.meta}</ItemDescription> : null}
                      </ItemContent>
                    </ColumnItem>
                  </li>
                );
              })}
            </ul>
          </ColumnList>
        </ColumnBody>
      )}
    </Column>
  );
}
