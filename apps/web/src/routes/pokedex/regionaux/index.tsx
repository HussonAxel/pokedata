import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/pokedex/regionaux/")({
  head: () => ({ meta: [{ title: "Pokédex régionaux · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/pokedex/regionaux" />;
}
