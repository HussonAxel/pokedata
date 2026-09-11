import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/favoris/")({
  head: () => ({ meta: [{ title: "Mes favoris · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/favoris" />;
}
