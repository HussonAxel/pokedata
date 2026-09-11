import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/mini-jeux/devine-pokemon/")({
  head: () => ({ meta: [{ title: "Devine le Pokémon · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/mini-jeux/devine-pokemon" />;
}
