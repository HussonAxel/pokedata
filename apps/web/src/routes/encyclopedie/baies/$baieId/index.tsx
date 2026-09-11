import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/encyclopedie/baies/$baieId/")({
  head: () => ({ meta: [{ title: "Détail : Baies · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/encyclopedie/baies/$baieId" />;
}
