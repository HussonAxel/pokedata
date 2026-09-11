import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/evolutions/")({
  head: () => ({ meta: [{ title: "Assistant d’évolution · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/evolutions" />;
}
