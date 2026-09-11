import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/pokedex/$pokemonId/medias/")({
  head: () => ({ meta: [{ title: "Images et cris · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/pokedex/$pokemonId/medias" />;
}
