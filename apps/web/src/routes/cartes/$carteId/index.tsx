import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/cartes/$carteId/")({
  head: () => ({ meta: [{ title: "Fiche de carte · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/cartes/$carteId" />;
}
