import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/cartes/")({
  head: () => ({ meta: [{ title: "Catalogue de cartes · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/cartes" />;
}
