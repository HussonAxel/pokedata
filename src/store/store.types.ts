// store.types.ts
export interface PokemonState {
  currentPokemon: any | null;
  tries: number | null;
  searchedPokemons: any[];
  pokemonDetailedData: any[];
}

export interface PokemonActions {
  addPokemon: (newPokemon: any) => void;
  addPokemonDetailedData: (detailedData: any) => void;
  resetSearchedPokemons: () => void;
  triesIncrementation: (length: number) => void;
}
