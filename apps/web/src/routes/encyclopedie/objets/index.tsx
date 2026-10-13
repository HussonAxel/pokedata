import { createFileRoute } from "@tanstack/react-router";

import { ListPlaceholder } from "@/components/list-placeholder";
import { itemListOptions } from "@/features/encyclopedia/queries";
import { encyclopediaSearchSchema } from "@/features/encyclopedia/search";

export const Route = createFileRoute("/encyclopedie/objets/")({
  validateSearch: encyclopediaSearchSchema,
  staticData: { itemsColumn: "objets" },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      itemListOptions({ locale: "fr", generationId: deps.gen }),
    );
  },
  head: () => ({ meta: [{ title: "Objets · Pokedata" }] }),
  component: Page,
});

function Page() {
  return (
    <ListPlaceholder title="Objets">
      Choisissez un objet dans la liste pour afficher sa fiche.
    </ListPlaceholder>
  );
}
