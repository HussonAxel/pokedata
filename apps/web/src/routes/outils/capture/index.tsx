import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/capture/")({
  head: () => ({ meta: [{ title: "Calculateur de capture · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/capture" />;
}
