import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/comparateur/")({
  head: () => ({ meta: [{ title: "Comparateur de Pokémon · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/comparateur" />;
}
