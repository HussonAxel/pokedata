import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/actualites/$slug/")({
  head: () => ({ meta: [{ title: "Lire une actualité · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/actualites/$slug" />;
}
