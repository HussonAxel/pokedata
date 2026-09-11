import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/competition/classements/")({
  head: () => ({ meta: [{ title: "Classements · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/competition/classements" />;
}
