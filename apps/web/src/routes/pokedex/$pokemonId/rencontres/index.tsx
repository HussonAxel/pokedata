import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/pokedex/$pokemonId/rencontres/")({
  head: () => ({ meta: [{ title: "Rencontres · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/pokedex/$pokemonId/rencontres" />;
}
