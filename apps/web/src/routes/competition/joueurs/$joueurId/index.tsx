import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/competition/joueurs/$joueurId/")({
  head: () => ({ meta: [{ title: "Résultats du joueur · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/competition/joueurs/$joueurId" />;
}
