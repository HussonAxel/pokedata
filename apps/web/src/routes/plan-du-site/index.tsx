import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/plan-du-site/")({
  head: () => ({ meta: [{ title: "Plan du site · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/plan-du-site" />;
}
