const SPRITES_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/** Petit sprite de jeu (96 px), lisible dans une liste. */
export const spriteUrl = (pokemonId: number) => `${SPRITES_URL}/${pokemonId}.png`;

/** Illustration officielle (475 px), pour mettre un Pokémon en avant. */
export const artworkUrl = (pokemonId: number) =>
  `${SPRITES_URL}/other/official-artwork/${pokemonId}.png`;

/**
 * Démarre le téléchargement d'une image avant son affichage : au survol d'un
 * lien, l'illustration de la fiche est déjà en cache quand celle-ci s'ouvre.
 */
export function preloadImage(src: string) {
  if (typeof window === "undefined") return;
  new Image().src = src;
}
