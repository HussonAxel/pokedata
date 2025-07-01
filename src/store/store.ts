import { create } from "zustand";
import { shared } from "use-broadcast-ts";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PokemonActions, PokemonState,  } from "./store.types";

const initialSearchedPokemon = null;

const useStore = create<PokemonState & PokemonActions>()(
  shared(
    persist<PokemonState & PokemonActions>(
      (set) => ({
        tries: 0,
        currentPokemon: initialSearchedPokemon,
        searchedPokemons: [],
        pokemonDetailedData: [],

        addPokemon: (newPokemon) =>
          set((state) => {
            return {
              currentPokemon: newPokemon,
              searchedPokemons: [newPokemon, ...state.searchedPokemons],
            };
          }),
        addPokemonDetailedData: (detailedData) =>
          set((state) => ({
            pokemonDetailedData: [detailedData, ...state.pokemonDetailedData],
          })),
        resetSearchedPokemons: () => set({ 
          currentPokemon: null, 
          searchedPokemons: [], 
          pokemonDetailedData: [] 
        }),
        triesIncrementation: () =>
          set((state) => ({ tries: (state.tries ?? 0) + 1 })),
        resetTries: () => set({ tries: 0 }),
      }),
      {
        name: "SearchPokemon-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);

export default useStore;
