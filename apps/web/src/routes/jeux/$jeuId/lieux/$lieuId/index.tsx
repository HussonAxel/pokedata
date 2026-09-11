import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/jeux/$jeuId/lieux/$lieuId/")({
  head: () => ({ meta: [{ title: "Détail du lieu · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/jeux/$jeuId/lieux/$lieuId" />;
}
