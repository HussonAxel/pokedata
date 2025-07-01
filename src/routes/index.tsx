import { createFileRoute } from "@tanstack/react-router";
import { useGetAllPokemons } from "@/data/pokemons";
import { PokedleTable } from "@/components/pokedle-table";
import ComboBox from "@/components/ui/combobox";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { isLoading, isError } = useGetAllPokemons();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return (
    <div>
      <header>
        <ComboBox />
        <PokedleTable />
      </header>
    </div>
  );
}
