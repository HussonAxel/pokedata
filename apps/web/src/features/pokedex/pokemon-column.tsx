import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDeferredValue, useEffect, useMemo, useState, type CSSProperties } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@pokedata/ui/components/input-group";
import {
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@pokedata/ui/components/item";
import {
  Column,
  ColumnBody,
  ColumnEmpty,
  ColumnHeader,
  ColumnItem,
  ColumnList,
  LIST_COLUMN_WIDTH,
} from "@/components/columns-panel";
import { PokemonFilters } from "@/features/pokedex/pokemon-filters";
import { pokedexIndexOptions, pokedexReferenceOptions } from "@/features/pokedex/queries";
import { LATEST_GENERATION, parseTypes, type PokedexSearch } from "@/features/pokedex/search";
import { artworkUrl, preloadImage, spriteUrl } from "@/features/pokedex/sprites";
import { TypeBadge } from "@/features/pokedex/type-badge";

const ROW_HEIGHT = 48;
const LIST_PADDING = 8;

/** Troisième colonne de la section Pokédex : les Pokémon, filtrables, qui ouvrent leur fiche. */
export function PokemonColumn({ mobile }: { mobile: boolean }) {
  const { q, type, gen = LATEST_GENERATION, onglet } = useSearch({ strict: false });
  // Lu dans l'URL et non dans les routes résolues : la ligne se sélectionne au clic,
  // sans attendre le chargement de la fiche.
  const pokemonId = useRouterState({
    select: (router) => router.location.pathname.match(/^\/pokedex\/([^/]+)/)?.[1],
  });
  const navigate = useNavigate();
  const scope = { locale: "fr" as const, generationId: gen };

  const { data: index } = useSuspenseQuery(pokedexIndexOptions(scope));
  const { data: reference } = useSuspenseQuery(pokedexReferenceOptions(scope));

  // La frappe reste fluide même si la liste rendue est longue : le filtrage
  // s'exécute sur une valeur différée, l'input ne bloque jamais.
  const deferredQuery = useDeferredValue(q ?? "");

  const types = useMemo(() => parseTypes(type), [type]);

  const entries = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();

    return index.entries.filter((entry) => {
      if (!types.every((identifier) => entry.types.includes(identifier))) return false;
      if (!needle) return true;

      return (
        entry.name.toLowerCase().includes(needle) ||
        String(entry.dexNumber).padStart(4, "0").includes(needle)
      );
    });
  }, [index.entries, deferredQuery, types]);

  // La liste compte 1 000+ entrées : seules les lignes visibles (et quelques-unes
  // de marge) existent dans le DOM, le reste n'est qu'une hauteur réservée.
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => viewport,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => entries[index]?.id ?? index,
    paddingStart: LIST_PADDING,
    paddingEnd: LIST_PADDING,
    overscan: 8,
    // Côté serveur, aucune mesure n'existe : on rend de quoi remplir un écran.
    initialRect: { width: 0, height: 640 },
  });

  // Un nouveau filtre repart du haut de la liste.
  useEffect(() => {
    viewport?.scrollTo({ top: 0 });
    // Seuls les filtres comptent ici, pas le viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery, type]);

  // Arrivé sur une fiche par son lien, on retrouve sa ligne. Les clics dans la
  // liste ne relancent pas ce centrage : seul le changement de génération le fait.
  useEffect(() => {
    if (!viewport || !pokemonId) return;
    const index = entries.findIndex((entry) => entry.identifier === pokemonId);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, gen]);

  const setFilters = (patch: Partial<PokedexSearch>, replace = true) =>
    navigate({
      to: ".",
      search: (previous: PokedexSearch) => ({ ...previous, ...patch }),
      replace,
      resetScroll: false,
    } as never);

  return (
    <Column mobile={mobile} data-slot="pokemon-column" className={LIST_COLUMN_WIDTH}>
      <ColumnHeader className="flex-col items-stretch">
        <PokemonFilters
          reference={reference}
          type={type}
          gen={gen}
          resultCount={entries.length}
          onChange={setFilters}
        >
          <InputGroup className="min-w-0 flex-1">
            <InputGroupAddon align="inline-start">
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={q ?? ""}
              placeholder="Rechercher un nom ou un numéro"
              aria-label="Rechercher un Pokémon"
              onChange={(event) => setFilters({ q: event.target.value || undefined })}
            />
          </InputGroup>
        </PokemonFilters>
      </ColumnHeader>

      {entries.length === 0 ? (
        <ColumnEmpty>Aucun Pokémon ne correspond à ces filtres.</ColumnEmpty>
      ) : (
        <ColumnBody viewportRef={setViewport}>
          <ColumnList
            size="row-lg"
            selectedIndex={entries.findIndex((entry) => entry.identifier === pokemonId)}
          >
            <ul
              className="relative h-(--list-height)"
              style={{ "--list-height": `${virtualizer.getTotalSize()}px` } as CSSProperties}
            >
              {virtualizer.getVirtualItems().map((row) => {
                const entry = entries[row.index];
                if (!entry) return null;

                return (
                  <li
                    key={row.key}
                    aria-setsize={entries.length}
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
                      selected={pokemonId === entry.identifier}
                      render={
                        <Link
                          to="/pokedex/$pokemonId"
                          params={{ pokemonId: entry.identifier }}
                          // Comparer deux Pokémon garde le même onglet ouvert.
                          search={{ q, type, gen, onglet }}
                          resetScroll={false}
                          // La route précharge ses données au survol ; l'illustration de la fiche suit.
                          onMouseEnter={() => preloadImage(artworkUrl(entry.id))}
                          onFocus={() => preloadImage(artworkUrl(entry.id))}
                        />
                      }
                    >
                      <ItemMedia variant="image" className="size-8">
                        <img
                          src={spriteUrl(entry.id)}
                          alt=""
                          width={48}
                          height={48}
                          decoding="async"
                          className="object-contain"
                        />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{entry.name}</ItemTitle>
                        <ItemDescription>
                          N° {String(entry.dexNumber).padStart(4, "0")}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <span className="flex gap-0.5">
                          {entry.types.map((identifier) => (
                            <TypeBadge key={identifier} identifier={identifier} />
                          ))}
                        </span>
                      </ItemActions>
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
