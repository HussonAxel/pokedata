import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/pokedex/regionaux/$pokedexId/")({
  head: () => ({ meta: [{ title: "Détail du Pokédex régional · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/pokedex/regionaux/$pokedexId" />;
}
