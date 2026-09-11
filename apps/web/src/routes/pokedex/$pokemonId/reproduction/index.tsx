import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/pokedex/$pokemonId/reproduction/")({
  head: () => ({ meta: [{ title: "Reproduction · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/pokedex/$pokemonId/reproduction" />;
}
