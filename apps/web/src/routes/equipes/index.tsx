import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/equipes/")({
  head: () => ({ meta: [{ title: "Équipes publiques · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/equipes" />;
}
