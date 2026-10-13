import { Button } from "@pokedata/ui/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pokedata/ui/components/select";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useId } from "react";

import { Fact, FactList } from "@/components/fact-list";
import { PageEyebrow, PageHeader, PageMeta, PageTitle } from "@/components/page-header";
import { formatMeasurement, formatVarietyName } from "@/features/pokedex/detail-format";
import { usePokemonDetail } from "@/features/pokedex/detail/context";
import { DexNumber } from "@/features/pokedex/dex-number";
import { PokemonArtwork } from "@/features/pokedex/pokemon-artwork";
import { pokedexIndexOptions } from "@/features/pokedex/queries";
import { LATEST_GENERATION } from "@/features/pokedex/search";
import { TypeBadgeLink } from "@/features/pokedex/type-badge";

const ROUTE = "/pokedex/$pokemonId/";

/** Pokémon précédent et suivant dans l'ordre du Pokédex, filtres conservés. */
export function PokemonPager() {
  const { pokemon, gen } = usePokemonDetail();
  const search = useSearch({ from: ROUTE });
  const { data: index } = useSuspenseQuery(
    pokedexIndexOptions({ locale: "fr", generationId: gen }),
  );
  const position = index.entries.findIndex((entry) => entry.identifier === pokemon.identifier);
  const previous = position > 0 ? index.entries[position - 1] : undefined;
  const next = position >= 0 ? index.entries[position + 1] : undefined;

  return (
    <nav aria-label="Pokémon précédent et suivant" className="flex items-center justify-between">
      {previous ? (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link
              from={ROUTE}
              to="/pokedex/$pokemonId"
              params={{ pokemonId: previous.identifier }}
              search={search}
            />
          }
        >
          <ChevronLeftIcon data-icon="inline-start" /> {previous.name}
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link
              from={ROUTE}
              to="/pokedex/$pokemonId"
              params={{ pokemonId: next.identifier }}
              search={search}
            />
          }
        >
          {next.name} <ChevronRightIcon data-icon="inline-end" />
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** En-tête de la fiche : illustration, identité, types et mensurations. */
export function PokemonHero() {
  const { pokemon, gen } = usePokemonDetail();

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex min-w-0 basis-full flex-col gap-5 @lg:flex-1 @lg:basis-[28rem] @lg:flex-row @lg:items-end">
        <PokemonArtwork
          pokemonId={pokemon.id}
          type={pokemon.types[0]?.identifier}
          className="size-32 @lg:size-44"
        />
        <PageHeader>
          <PageEyebrow>
            pokémon ( <DexNumber value={pokemon.dexNumber} className="text-foreground" /> )
          </PageEyebrow>
          <PageTitle>{formatVarietyName(pokemon.name, pokemon.formSuffix)}</PageTitle>
          {pokemon.genus ? <p className="text-muted-foreground">{pokemon.genus}</p> : null}
          <div className="flex flex-wrap gap-2 pt-1">
            {pokemon.types.map((entry) => (
              <TypeBadgeLink key={entry.slot} identifier={entry.identifier} label={entry.name} />
            ))}
          </div>
          <FactList className="grid-flow-col justify-start pt-2">
            <Fact label="Taille">{formatMeasurement(pokemon.height, "m")}</Fact>
            <Fact label="Poids">{formatMeasurement(pokemon.weight, "kg")}</Fact>
          </FactList>
          <PageMeta>
            Apparu en génération {pokemon.introducedIn} · Fiche en génération {gen}
          </PageMeta>
        </PageHeader>
      </div>
      <GenerationSelect />
    </div>
  );
}

/** Génération consultée : change la fiche entière, l'onglet ouvert est conservé. */
function GenerationSelect() {
  const { pokemon, gen } = usePokemonDetail();
  const navigate = useNavigate({ from: ROUTE });
  const labelId = useId();
  const items = pokemon.availableGenerations
    .filter((entry) => entry.id <= LATEST_GENERATION)
    .map((entry) => ({ value: entry.id, label: `Génération ${entry.id}` }));

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="label-mono text-muted-foreground">
        Génération consultée
      </span>
      <Select
        items={items}
        value={gen}
        onValueChange={(value) => {
          if (value !== null)
            void navigate({ search: (previous) => ({ ...previous, gen: value }) });
        }}
      >
        <SelectTrigger aria-labelledby={labelId} className="min-w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
