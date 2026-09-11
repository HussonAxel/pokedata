import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/_auth/moi/classeurs/")({
  head: () => ({ meta: [{ title: "Mes classeurs · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/moi/classeurs" />;
}
