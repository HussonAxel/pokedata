import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/competition/replays/$replayId/")({
  head: () => ({ meta: [{ title: "Détail du replay · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/competition/replays/$replayId" />;
}
