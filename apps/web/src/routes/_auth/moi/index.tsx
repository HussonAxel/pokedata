import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/")({
  head: () => ({ meta: [{ title: "Mon espace · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi" />;
}
