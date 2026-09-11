import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/shiny/")({
  head: () => ({ meta: [{ title: "Probabilités chromatiques · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/shiny" />;
}
