import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/collections/")({
  head: () => ({ meta: [{ title: "Mes collections · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/collections" />;
}
