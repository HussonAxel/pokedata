import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/encyclopedie/attaques/$attaqueId/")({
  head: () => ({ meta: [{ title: "Détail : Attaques · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/encyclopedie/attaques/$attaqueId" />;
}
