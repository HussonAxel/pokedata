import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/jeux/$jeuId/shiny/")({
  head: () => ({ meta: [{ title: "Chasse aux chromatiques · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/jeux/$jeuId/shiny" />;
}
