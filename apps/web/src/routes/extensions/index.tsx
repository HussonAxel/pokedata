import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/extensions/")({
  head: () => ({ meta: [{ title: "Extensions du JCC · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/extensions" />;
}
