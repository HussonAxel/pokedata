import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/strategie/formats/$formatId/cores/")({
  head: () => ({ meta: [{ title: "Duos et noyaux d’équipe · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/strategie/formats/$formatId/cores" />;
}
