// store.types.ts
export interface PokemonState {
  currentPokemon: any | null;
  tries: number | null;
}

export interface PokemonActions {
  addPokemon: (newPokemon: any) => void;
  resetSearchedPokemons: () => void;
  triesIncrementation: (length: number) => void;
}
