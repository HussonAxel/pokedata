import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/equipes/$equipeId/")({
  head: () => ({ meta: [{ title: "Équipe partagée · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/equipes/$equipeId" />;
}
