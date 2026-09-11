import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/membres/$pseudo/")({
  head: () => ({ meta: [{ title: "Profil public · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/membres/$pseudo" />;
}
