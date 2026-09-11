import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/mini-jeux/plus-ou-moins/")({
  head: () => ({ meta: [{ title: "Plus ou moins · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/mini-jeux/plus-ou-moins" />;
}
