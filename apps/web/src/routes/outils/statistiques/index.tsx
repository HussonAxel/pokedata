import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/statistiques/")({
  head: () => ({ meta: [{ title: "Calculateur de statistiques · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/statistiques" />;
}
