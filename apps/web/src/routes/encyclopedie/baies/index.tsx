import { createFileRoute } from "@tanstack/react-router";

import { ListPlaceholder } from "@/components/list-placeholder";
import { berryListOptions } from "@/features/encyclopedia/queries";
import { encyclopediaSearchSchema } from "@/features/encyclopedia/search";

export const Route = createFileRoute("/encyclopedie/baies/")({
  validateSearch: encyclopediaSearchSchema,
  staticData: { itemsColumn: "baies" },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      berryListOptions({ locale: "fr", generationId: deps.gen }),
    );
  },
  head: () => ({ meta: [{ title: "Baies · Pokedata" }] }),
  component: Page,
});

function Page() {
  return (
    <ListPlaceholder title="Baies">
      Choisissez une baie dans la liste pour afficher sa fiche.
    </ListPlaceholder>
  );
}
