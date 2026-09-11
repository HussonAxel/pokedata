import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/mini-jeux/quiz/$quizId/")({
  head: () => ({ meta: [{ title: "Jouer au quiz · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/mini-jeux/quiz/$quizId" />;
}
