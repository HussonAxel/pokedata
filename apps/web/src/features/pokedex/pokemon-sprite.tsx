import { spriteUrl } from "@/features/pokedex/sprites";

/** Sprite de jeu d'une variété, ou de l'une de ses formes s'il existe. */
export function PokemonSprite({
  pokemonId,
  formIdentifier,
}: {
  pokemonId: number;
  formIdentifier?: string | null;
}) {
  const fallback = spriteUrl(pokemonId);

  return (
    <img
      src={formIdentifier ? spriteUrl(`${pokemonId}-${formIdentifier}`) : fallback}
      alt=""
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
      className="size-16 shrink-0 object-contain"
      onError={(event) => {
        if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
      }}
    />
  );
}
