import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/communaute/")({
  head: () => ({ meta: [{ title: "Communauté · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/communaute" />;
}
