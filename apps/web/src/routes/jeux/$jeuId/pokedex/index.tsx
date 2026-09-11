import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/jeux/$jeuId/pokedex/")({
  head: () => ({ meta: [{ title: "Pokédex du jeu · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/jeux/$jeuId/pokedex" />;
}
