import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/encyclopedie/objets/$objetId/")({
  head: () => ({ meta: [{ title: "Détail : Objets · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/encyclopedie/objets/$objetId" />;
}
