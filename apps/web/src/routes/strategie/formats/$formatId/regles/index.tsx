import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/strategie/formats/$formatId/regles/")({
  head: () => ({ meta: [{ title: "Règles et règlement · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/strategie/formats/$formatId/regles" />;
}
