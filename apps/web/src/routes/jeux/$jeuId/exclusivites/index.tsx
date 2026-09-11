import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/jeux/$jeuId/exclusivites/")({
  head: () => ({ meta: [{ title: "Exclusivités · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/jeux/$jeuId/exclusivites" />;
}
