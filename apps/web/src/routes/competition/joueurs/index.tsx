import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/competition/joueurs/")({
  head: () => ({ meta: [{ title: "Joueurs compétitifs · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/competition/joueurs" />;
}
