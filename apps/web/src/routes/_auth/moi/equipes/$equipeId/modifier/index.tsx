import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/equipes/$equipeId/modifier/")({
  head: () => ({ meta: [{ title: "Modifier mon équipe · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/equipes/$equipeId/modifier" />;
}
