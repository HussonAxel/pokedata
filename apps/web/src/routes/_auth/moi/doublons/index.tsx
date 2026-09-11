import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/doublons/")({
  head: () => ({ meta: [{ title: "Mes doublons · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/doublons" />;
}
