import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@pokedata/ui/components/item";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DexNumber } from "@/features/pokedex/dex-number";
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
      <Item
        variant="outline"
        className="h-full flex-nowrap"
        render={
          <Link to="/pokedex/$pokemonId" params={{ pokemonId: identifier }} search={{ gen }} />
        }
      >
        <ItemMedia>
          <PokemonSprite pokemonId={pokemonId} />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemDescription>
            <DexNumber value={dexNumber} className="text-sm" />
          </ItemDescription>
          <ItemTitle>{name}</ItemTitle>
          {children}
        </ItemContent>
      </Item>
    </PokemonPreviewCard>
  );
}
