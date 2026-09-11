import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/strategie/")({
  head: () => ({ meta: [{ title: "Stratégie · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/strategie" />;
}
