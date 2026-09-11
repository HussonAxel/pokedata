import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/encyclopedie/types/$typeId/")({
  head: () => ({ meta: [{ title: "Détail : Types · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/encyclopedie/types/$typeId" />;
}
