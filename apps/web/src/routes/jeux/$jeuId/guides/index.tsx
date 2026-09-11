import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/jeux/$jeuId/guides/")({
  head: () => ({ meta: [{ title: "Guides du jeu · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/jeux/$jeuId/guides" />;
}
