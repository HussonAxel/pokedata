import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/jeux/$jeuId/machines/")({
  head: () => ({ meta: [{ title: "CT et machines · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/jeux/$jeuId/machines" />;
}
