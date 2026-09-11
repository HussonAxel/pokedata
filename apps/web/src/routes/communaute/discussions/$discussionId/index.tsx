import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/communaute/discussions/$discussionId/")({
  head: () => ({ meta: [{ title: "Discussion · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/communaute/discussions/$discussionId" />;
}
