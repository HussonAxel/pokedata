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

        addPokemon: (newPokemon) =>
          set((state) => {
            console.log(state.currentPokemon);
            return {
              currentPokemon: newPokemon,
              searchedPokemons: [newPokemon, ...state.searchedPokemons],
            };
          }),
        resetSearchedPokemons: () => set({ currentPokemon: null, searchedPokemons: [] }),
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
