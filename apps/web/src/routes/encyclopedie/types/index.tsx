import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/features/navigation/planned-page";

export const Route = createFileRoute("/encyclopedie/types/")({
  head: () => ({ meta: [{ title: "Types · Pokedata" }] }),
  component: Page,
});

function Page() {
  return <PlannedPage path="/encyclopedie/types" />;
}
