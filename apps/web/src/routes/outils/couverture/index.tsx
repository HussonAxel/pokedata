import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/couverture/")({
  head: () => ({ meta: [{ title: "Couverture des types · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/couverture" />;
}
