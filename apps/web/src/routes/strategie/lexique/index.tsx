import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/strategie/lexique/")({
  head: () => ({ meta: [{ title: "Lexique · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/strategie/lexique" />;
}
