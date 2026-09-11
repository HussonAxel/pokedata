import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/communaute/discussions/")({
  head: () => ({ meta: [{ title: "Discussions · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/communaute/discussions" />;
}
