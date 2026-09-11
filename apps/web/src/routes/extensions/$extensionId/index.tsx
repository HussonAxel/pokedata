import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/extensions/$extensionId/")({
  head: () => ({ meta: [{ title: "Détail de l’extension · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/extensions/$extensionId" />;
}
