import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/mini-jeux/quiz/")({
  head: () => ({ meta: [{ title: "Quiz · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/mini-jeux/quiz" />;
}
