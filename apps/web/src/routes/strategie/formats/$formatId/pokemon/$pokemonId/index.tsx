import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/strategie/formats/$formatId/pokemon/$pokemonId/")({
  head: () => ({ meta: [{ title: "Analyse du Pokémon · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/strategie/formats/$formatId/pokemon/$pokemonId" />;
}
