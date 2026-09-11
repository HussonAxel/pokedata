import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/")({
  head: () => ({ meta: [{ title: "Outils · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils" />;
}
