import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/encyclopedie/mecaniques/$slug/")({
  head: () => ({ meta: [{ title: "Détail : Mécaniques · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/encyclopedie/mecaniques/$slug" />;
}
