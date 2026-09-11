import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/guides/")({
  head: () => ({ meta: [{ title: "Tous les guides · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/guides" />;
}
