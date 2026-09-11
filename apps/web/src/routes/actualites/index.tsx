import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/actualites/")({
  head: () => ({ meta: [{ title: "Actualités · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/actualites" />;
}
