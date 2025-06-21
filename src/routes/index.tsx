import { createFileRoute } from "@tanstack/react-router";
import { useGetAllPokemons, useGetSingleRandomPokemon } from "@/data/pokemons";
import FilteredCombobox from "@/components/ui/FilteredCombobox";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { isLoading, isError, data } = useGetAllPokemons();
  const { data: randomPokemon } = useGetSingleRandomPokemon();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <FilteredCombobox />
        {randomPokemon && (
          <div>
            <h2>{randomPokemon.name}</h2>
          </div>
        )}
      </header>

      {data?.results?.map((pokemon: any) => (
        <div key={pokemon.name}>
          <h2>{pokemon.name}</h2>
        </div>
      ))}
    </div>
  );
}
