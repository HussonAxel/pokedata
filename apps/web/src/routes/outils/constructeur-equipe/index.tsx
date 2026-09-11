import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/outils/constructeur-equipe/")({
  head: () => ({ meta: [{ title: "Constructeur d’équipe · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/outils/constructeur-equipe" />;
}
