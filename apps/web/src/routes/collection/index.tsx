import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/collection/")({
  head: () => ({ meta: [{ title: "Collection · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/collection" />;
}
