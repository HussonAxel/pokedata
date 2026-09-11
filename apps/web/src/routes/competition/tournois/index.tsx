import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/competition/tournois/")({
  head: () => ({ meta: [{ title: "Tournois · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/competition/tournois" />;
}
