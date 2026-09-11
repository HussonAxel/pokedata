import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/degats/")({
  head: () => ({ meta: [{ title: "Calculateur de dégâts · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/degats" />;
}
