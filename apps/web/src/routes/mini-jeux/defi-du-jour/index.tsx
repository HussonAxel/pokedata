import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/mini-jeux/defi-du-jour/")({
  head: () => ({ meta: [{ title: "Défi du jour · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/mini-jeux/defi-du-jour" />;
}
