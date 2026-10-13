import { cn } from "@pokedata/ui/lib/utils";

import { itemSpriteUrl } from "@/features/pokedex/sprites";

/** Sprite d'objet ; masqué si le dépôt de sprites n'en a pas. */
export function ItemSprite({ identifier, className }: { identifier: string; className?: string }) {
  return (
    <img
      src={itemSpriteUrl(identifier)}
      alt=""
      width={30}
      height={30}
      loading="lazy"
      decoding="async"
      className={cn("size-8 shrink-0 object-contain [image-rendering:pixelated]", className)}
      onError={(event) => {
        event.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}
