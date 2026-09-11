import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/mini-jeux/classements/")({
  head: () => ({ meta: [{ title: "Classements des mini-jeux · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/mini-jeux/classements" />;
}
