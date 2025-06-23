import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = "https://pokeapi.co/api/v2";

export const useGetAllPokemons = () => {
  return useQuery({
    queryKey: ["pokemons"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/pokemon?limit=100000&offset=0`
      );
      const data = response.data;
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24 * 7,
    gcTime: 1000 * 60 * 60 * 24 * 30,
  });
};

export const useGetSinglePokemon = (id: string) => {
  return useQuery({
    queryKey: ["pokemon", id],
    queryFn: async () => {
      const pokemonResponse = await axios.get(`${BASE_URL}/pokemon/${id}`);
      const pokemonResponseData = pokemonResponse.data;

      const pokemonSpeciesResponse = await axios.get(
        `${BASE_URL}/pokemon-species/${id}`
      );
      const pokemonSpeciesResponseData = pokemonSpeciesResponse.data;
      return {
        pokemonResponseData,
        pokemonSpeciesResponseData,
      };
    },
    enabled: !!id,
  });
};

export const useGetSingleRandomPokemon = () => {
  const { data: pokemonCount } = useGetAllPokemons();
  return useQuery({
    enabled: !!pokemonCount?.count,
    queryKey: ["randomPokemon"],
    queryFn: async () => {
      const today = new Date().toDateString();
      const seed = today
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomId = Math.floor((seed % (pokemonCount?.count ?? 1)) + 1);

      const response = await axios.get(`${BASE_URL}/pokemon/${randomId}`);

      const data = response.data;
      // console.log(`Pokemon du jour (${today}): ${data.name} (ID: ${randomId})`);
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};
