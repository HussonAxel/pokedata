import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/parametres/")({
  head: () => ({ meta: [{ title: "Paramètres du compte · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/parametres" />;
}
