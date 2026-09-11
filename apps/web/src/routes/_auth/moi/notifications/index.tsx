import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/notifications/")({
  head: () => ({ meta: [{ title: "Notifications · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/notifications" />;
}
