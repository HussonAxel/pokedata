import { createFileRoute } from "@tanstack/react-router";
import { useGetAllPokemons, useGetSingleRandomPokemon } from "@/data/pokemons";
import { InputWithButton } from "@/components/ui/input-with-button";
import { PokedleTable } from "@/components/pokedle-table";
import ComboBox from "@/components/ui/combobox";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { isLoading, isError } = useGetAllPokemons();
  const { data: randomPokemon } = useGetSingleRandomPokemon();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;


  return (
    <div>
      <header>
        <ComboBox />
        <PokedleTable />
        {randomPokemon && (
          <div>
            <h2>random pokemon of the day : {randomPokemon.name}</h2>
          </div>
        )}
      </header>
    </div>
  );
}
