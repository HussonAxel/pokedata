import { createFileRoute } from "@tanstack/react-router";

import { ListPlaceholder } from "@/components/list-placeholder";
import { moveListOptions } from "@/features/encyclopedia/queries";
import { encyclopediaSearchSchema } from "@/features/encyclopedia/search";

export const Route = createFileRoute("/encyclopedie/attaques/")({
  validateSearch: encyclopediaSearchSchema,
  staticData: { itemsColumn: "attaques" },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      moveListOptions({ locale: "fr", generationId: deps.gen }),
    );
  },
  head: () => ({ meta: [{ title: "Attaques · Pokedata" }] }),
  component: Page,
});

function Page() {
  return (
    <ListPlaceholder title="Attaques">
      Choisissez une attaque dans la liste pour afficher sa fiche.
    </ListPlaceholder>
  );
}
