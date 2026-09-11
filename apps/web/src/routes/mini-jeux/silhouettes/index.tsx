import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/mini-jeux/silhouettes/")({
  head: () => ({ meta: [{ title: "Silhouettes · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/mini-jeux/silhouettes" />;
}
