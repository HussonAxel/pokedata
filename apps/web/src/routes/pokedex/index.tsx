import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/pokedex/")({
  head: () => ({ meta: [{ title: "Pokédex national · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/pokedex" />;
}
