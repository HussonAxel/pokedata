import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/strategie/guides/")({
  head: () => ({ meta: [{ title: "Guides stratégiques · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/strategie/guides" />;
}
