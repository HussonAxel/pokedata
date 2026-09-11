import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/chasses/")({
  head: () => ({ meta: [{ title: "Mes chasses · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/chasses" />;
}
