import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Bienvenue sur Pokedata · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/" />;
}
