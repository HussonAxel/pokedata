import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/competition/tournois/$tournoiId/")({
  head: () => ({ meta: [{ title: "Détail du tournoi · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/competition/tournois/$tournoiId" />;
}
