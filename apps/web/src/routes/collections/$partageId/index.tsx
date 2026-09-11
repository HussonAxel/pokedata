import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/collections/$partageId/")({
  head: () => ({ meta: [{ title: "Collection partagée · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/collections/$partageId" />;
}
