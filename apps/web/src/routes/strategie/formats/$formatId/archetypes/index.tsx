import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/strategie/formats/$formatId/archetypes/")({
  head: () => ({ meta: [{ title: "Archétypes · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/strategie/formats/$formatId/archetypes" />;
}
