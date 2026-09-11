import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/competition/replays/")({
  head: () => ({ meta: [{ title: "Replays · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/competition/replays" />;
}
