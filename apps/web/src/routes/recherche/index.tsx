import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@pokedata/ui/components/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@pokedata/ui/components/input-group";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { useDeferredValue } from "react";
import { z } from "zod";

import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import { SearchGroup, SearchResultItem } from "@/features/search/search-results";
import { searchQueries, useGlobalSearch } from "@/features/search/use-global-search";

export const Route = createFileRoute("/recherche/")({
  validateSearch: z.object({ q: z.string().trim().max(50).optional() }),
  loader: async ({ context }) => {
    const [pokemon, talents, moves, items, berries] = searchQueries();
    await Promise.all([
      context.queryClient.ensureQueryData(pokemon),
      context.queryClient.ensureQueryData(talents),
      context.queryClient.ensureQueryData(moves),
      context.queryClient.ensureQueryData(items),
      context.queryClient.ensureQueryData(berries),
    ]);
  },
  head: () => ({ meta: [{ title: "Recherche globale · Pokedata" }] }),
  component: Page,
});

function Page() {
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  // La frappe reste fluide : la recherche porte sur une valeur différée.
  const query = useDeferredValue(q);
  const results = useGlobalSearch(query);
  const gen = 9;
  const empty = results !== null && Object.values(results).every((group) => group.total === 0);

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader>
        <PageEyebrow>recherche ( pokémon, talents, attaques, objets, baies )</PageEyebrow>
        <PageTitle>Recherche globale</PageTitle>
      </PageHeader>

      <InputGroup className="h-12">
        <InputGroupAddon align="inline-start">
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          autoFocus
          value={q}
          placeholder="Pikachu, Statik, Tonnerre, Restes…"
          aria-label="Rechercher dans le catalogue"
          onChange={(event) =>
            void navigate({
              search: { q: event.target.value || undefined },
              replace: true,
              resetScroll: false,
            })
          }
        />
      </InputGroup>

      {results === null ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Que cherchez-vous ?</EmptyTitle>
            <EmptyDescription>
              Saisissez au moins deux lettres, ou un numéro de Pokédex.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : empty ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Aucun résultat</EmptyTitle>
            <EmptyDescription>Rien ne correspond à « {query} » dans le catalogue.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div aria-live="polite" className="flex flex-col gap-6">
          <SearchGroup
            id="pokemon"
            title="Pokémon"
            total={results.pokemon.total}
            shown={results.pokemon.results.length}
            allResults={<Link to="/pokedex" search={{ q: query, gen }} />}
          >
            {results.pokemon.results.map((entry) => (
              <SearchResultItem
                key={entry.identifier}
                name={entry.name}
                detail={entry.detail}
                link={
                  <Link
                    to="/pokedex/$pokemonId"
                    params={{ pokemonId: entry.identifier }}
                    search={{ gen }}
                  />
                }
              />
            ))}
          </SearchGroup>
          <SearchGroup
            id="talents"
            title="Talents"
            total={results.talents.total}
            shown={results.talents.results.length}
            allResults={<Link to="/encyclopedie/talents" search={{ q: query, gen }} />}
          >
            {results.talents.results.map((entry) => (
              <SearchResultItem
                key={entry.identifier}
                name={entry.name}
                detail={entry.detail}
                link={
                  <Link
                    to="/encyclopedie/talents/$talentId"
                    params={{ talentId: entry.identifier }}
                    search={{ gen }}
                  />
                }
              />
            ))}
          </SearchGroup>
          <SearchGroup
            id="attaques"
            title="Attaques"
            total={results.moves.total}
            shown={results.moves.results.length}
            allResults={<Link to="/encyclopedie/attaques" search={{ q: query, gen }} />}
          >
            {results.moves.results.map((entry) => (
              <SearchResultItem
                key={entry.identifier}
                name={entry.name}
                detail={entry.detail}
                link={
                  <Link
                    to="/encyclopedie/attaques/$attaqueId"
                    params={{ attaqueId: entry.identifier }}
                    search={{ gen }}
                  />
                }
              />
            ))}
          </SearchGroup>
          <SearchGroup
            id="objets"
            title="Objets"
            total={results.items.total}
            shown={results.items.results.length}
            allResults={<Link to="/encyclopedie/objets" search={{ q: query, gen }} />}
          >
            {results.items.results.map((entry) => (
              <SearchResultItem
                key={entry.identifier}
                name={entry.name}
                detail={entry.detail}
                link={
                  <Link
                    to="/encyclopedie/objets/$objetId"
                    params={{ objetId: entry.identifier }}
                    search={{ gen }}
                  />
                }
              />
            ))}
          </SearchGroup>
          <SearchGroup
            id="baies"
            title="Baies"
            total={results.berries.total}
            shown={results.berries.results.length}
            allResults={<Link to="/encyclopedie/baies" search={{ q: query, gen }} />}
          >
            {results.berries.results.map((entry) => (
              <SearchResultItem
                key={entry.identifier}
                name={entry.name}
                link={
                  <Link
                    to="/encyclopedie/baies/$baieId"
                    params={{ baieId: entry.identifier }}
                    search={{ gen }}
                  />
                }
              />
            ))}
          </SearchGroup>
        </div>
      )}
    </PageContainer>
  );
}
