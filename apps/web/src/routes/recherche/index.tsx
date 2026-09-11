import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/recherche/")({
  head: () => ({ meta: [{ title: "Recherche globale · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/recherche" />;
}
