import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { PokemonPreviewCard } from "@/features/pokedex/pokemon-preview-card";
import { PokemonSprite } from "@/features/pokedex/pokemon-sprite";

/**
 * Carte d'un Pokémon qui mène à sa fiche, avec l'aperçu au survol. Les enfants
 * précisent le lien avec la page qui l'affiche (variété, talent…).
 */
export function PokemonLinkCard({
  pokemonId,
  identifier,
  dexNumber,
  name,
  gen,
  children,
}: {
  pokemonId: number;
  identifier: string;
  dexNumber: number;
  name: string;
  gen: number;
  children?: ReactNode;
}) {
  return (
    <PokemonPreviewCard identifier={identifier} gen={gen}>
      <Link
        to="/pokedex/$pokemonId"
        params={{ pokemonId: identifier }}
        search={{ gen }}
        className="flex h-full items-center gap-3 rounded-lg border p-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <PokemonSprite pokemonId={pokemonId} />
        <span className="flex min-w-0 flex-col items-start gap-1">
          <span className="text-sm text-muted-foreground">
            N° {String(dexNumber).padStart(4, "0")}
          </span>
          <span className="font-semibold">{name}</span>
          {children}
        </span>
      </Link>
    </PokemonPreviewCard>
  );
}
