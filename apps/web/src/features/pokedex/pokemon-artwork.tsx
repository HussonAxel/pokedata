import { cn } from "@pokedata/ui/lib/utils";
import { useState } from "react";

import { artworkUrl, spriteUrl } from "@/features/pokedex/sprites";
import { typeTint } from "@/features/pokedex/type-badge";

/**
 * Illustration officielle d'un Pokémon sur un fond à la teinte de son type
 * principal. Elle apparaît en fondu une fois chargée, et se replie sur le
 * sprite de jeu quand l'illustration manque (certaines formes).
 */
export function PokemonArtwork({
  pokemonId,
  type,
  className,
}: {
  pokemonId: number;
  type?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid size-40 shrink-0 place-items-center overflow-hidden rounded-2xl @2xl:size-48",
        typeTint(type ?? ""),
        className,
      )}
    >
      <img
        // Rendue côté serveur, l'image peut finir de charger avant l'hydratation :
        // `onLoad` ne se déclencherait jamais, on vérifie donc son état au montage.
        ref={(image) => {
          if (image?.complete && image.naturalWidth > 0) setLoaded(true);
        }}
        src={artworkUrl(pokemonId)}
        alt=""
        width={192}
        height={192}
        fetchPriority="high"
        decoding="async"
        data-loaded={loaded || undefined}
        className="size-full object-contain p-3 opacity-0 drop-shadow-md transition-opacity duration-300 data-loaded:opacity-100 motion-reduce:transition-none"
        onLoad={() => setLoaded(true)}
        onError={(event) => {
          const fallback = spriteUrl(pokemonId);
          if (event.currentTarget.src !== fallback) {
            event.currentTarget.src = fallback;
            // Le sprite est en pixel art : il reste net une fois agrandi.
            event.currentTarget.classList.add("[image-rendering:pixelated]");
          }
        }}
      />
    </div>
  );
}
