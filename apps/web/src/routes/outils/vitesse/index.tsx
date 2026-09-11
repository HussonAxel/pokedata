import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/vitesse/")({
  head: () => ({ meta: [{ title: "Comparateur de vitesse · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/vitesse" />;
}
