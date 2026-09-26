import { Skeleton } from "@pokedata/ui/components/skeleton";
import { cn } from "@pokedata/ui/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import type { ReactElement } from "react";

import {
  PreviewCard,
  PreviewCardPanel,
  PreviewCardTrigger,
} from "@pokedata/ui/components/preview-card";
import { pokedexPreviewOptions } from "@/features/pokedex/queries";
import { TypeBadge, typeTint } from "@/features/pokedex/type-badge";

const artworkUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

/**
 * Donne à un lien (ou à tout autre élément) un aperçu du Pokémon au survol.
 * L'élément enfant devient le déclencheur : il garde son rendu et son rôle.
 */
export function PokemonPreviewCard({
  identifier,
  gen,
  children,
}: {
  identifier: string;
  gen: number;
  children: ReactElement;
}) {
  const queryClient = useQueryClient();
  const options = pokedexPreviewOptions({ identifier, locale: "fr", generationId: gen });

  // Dès l'approche du pointeur ou du focus, bien avant la fin du délai
  // d'ouverture : les données et l'illustration arrivent avec la carte.
  const warm = () => {
    void queryClient.prefetchQuery(options).then(() => {
      const data = queryClient.getQueryData(options.queryKey);
      if (data) new Image().src = artworkUrl(data.id);
    });
  };

  return (
    <PreviewCard followCursor="x">
      <PreviewCardTrigger
        render={children}
        delay={350}
        closeDelay={200}
        onPointerEnter={warm}
        onFocus={warm}
      />
      <PreviewCardPanel variant="flush" side="top" sideOffset={10} className="w-72">
        <PokemonPreview identifier={identifier} gen={gen} />
      </PreviewCardPanel>
    </PreviewCard>
  );
}

function PokemonPreview({ identifier, gen }: { identifier: string; gen: number }) {
  const { data, isPending } = useQuery(
    pokedexPreviewOptions({ identifier, locale: "fr", generationId: gen }),
  );

  if (isPending) return <PreviewSkeleton />;
  if (!data) {
    return <p className="p-4 text-muted-foreground">Aperçu indisponible pour cette génération.</p>;
  }

  const number = String(data.dexNumber).padStart(4, "0");

  return (
    <div className="flex flex-col">
      {/* Bannière à la teinte du type principal, numéro du Pokédex en filigrane. */}
      <div
        className={cn("relative h-16 overflow-hidden", typeTint(data.types[0]?.identifier ?? ""))}
      >
        <span
          aria-hidden="true"
          className="absolute -top-3 right-3 font-mono text-6xl font-bold tabular-nums opacity-15"
        >
          {number}
        </span>
      </div>

      <div className="-mt-10 flex items-end gap-3 px-4">
        <img
          src={artworkUrl(data.id)}
          alt=""
          width={80}
          height={80}
          decoding="async"
          className="size-20 shrink-0 object-contain drop-shadow-md"
        />
        <div className="flex min-w-0 flex-col pb-1">
          <span className="truncate text-sm font-semibold">{data.name}</span>
          {data.genus ? <span className="truncate text-muted-foreground">{data.genus}</span> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {data.types.map((entry) => (
          <TypeBadge key={entry.slot} identifier={entry.identifier} label={entry.name} />
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4 pt-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Talents</span>
          <ul className="flex flex-wrap gap-1.5">
            {data.abilities.map((ability) => (
              <li
                key={ability.id}
                className="rounded-md border px-2 py-1 text-xs"
                title={ability.isHidden ? "Talent caché" : undefined}
              >
                {ability.name}
                {ability.isHidden ? " · caché" : ""}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Couverture défensive</span>
          <div className="flex flex-col gap-2 text-xs">
            {[
              {
                label: "Faiblesses",
                values: data.matchups.filter((matchup) => matchup.multiplier > 1),
              },
              {
                label: "Résistances",
                values: data.matchups.filter(
                  (matchup) => matchup.multiplier > 0 && matchup.multiplier < 1,
                ),
              },
              {
                label: "Immunités",
                values: data.matchups.filter((matchup) => matchup.multiplier === 0),
              },
            ].map((group) => (
              <div key={group.label} className="flex items-start gap-2">
                <span className="w-16 shrink-0 pt-0.5 text-muted-foreground">{group.label}</span>
                {group.values.length ? (
                  <ul className="flex flex-wrap gap-1">
                    {group.values.map((matchup) => (
                      <li key={matchup.identifier}>
                        <TypeBadge
                          identifier={matchup.identifier}
                          label={`${matchup.name} ×${matchup.multiplier}`}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">Aucune</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t px-4 py-2.5">
        <span className="text-xs text-muted-foreground">Données de la génération {gen}</span>
        <Link
          to="/pokedex/$pokemonId"
          params={{ pokemonId: data.identifier }}
          search={{ gen }}
          className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
        >
          Voir la fiche
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-3 p-4">
      <span className="sr-only">Chargement de l’aperçu</span>
      <Skeleton className="h-12 w-full" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-14 shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-2 w-full" />
        ))}
      </div>
    </div>
  );
}
