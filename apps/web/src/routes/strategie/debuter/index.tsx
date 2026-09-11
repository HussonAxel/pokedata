import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/strategie/debuter/")({
  head: () => ({ meta: [{ title: "Débuter en stratégie · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/strategie/debuter" />;
}
