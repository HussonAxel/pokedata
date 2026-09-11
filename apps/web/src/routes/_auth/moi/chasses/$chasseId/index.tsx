import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/chasses/$chasseId/")({
  head: () => ({ meta: [{ title: "Ma chasse · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/chasses/$chasseId" />;
}
