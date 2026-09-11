import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/collection/modeles/")({
  head: () => ({ meta: [{ title: "Modèles de collection · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/collection/modeles" />;
}
