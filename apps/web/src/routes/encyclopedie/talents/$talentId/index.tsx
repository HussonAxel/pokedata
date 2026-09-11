import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/encyclopedie/talents/$talentId/")({
  head: () => ({ meta: [{ title: "Détail : Talents · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/encyclopedie/talents/$talentId" />;
}
