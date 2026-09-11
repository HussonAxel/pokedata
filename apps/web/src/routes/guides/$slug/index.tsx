import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/guides/$slug/")({
  head: () => ({ meta: [{ title: "Lire un guide · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/guides/$slug" />;
}
