import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/transferts/")({
  head: () => ({ meta: [{ title: "Compatibilité des transferts · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/transferts" />;
}
