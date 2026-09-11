import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/competition/")({
  head: () => ({ meta: [{ title: "Compétition · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/competition" />;
}
