import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/progression/")({
  head: () => ({ meta: [{ title: "Ma progression · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/progression" />;
}
