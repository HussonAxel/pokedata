import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/pokedex/$pokemonId/attaques/")({
  head: () => ({ meta: [{ title: "Attaques apprises · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/pokedex/$pokemonId/attaques" />;
}
