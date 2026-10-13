import { createFileRoute } from "@tanstack/react-router";

import { ListPlaceholder } from "@/components/list-placeholder";
import { talentListOptions } from "@/features/encyclopedia/queries";
import { encyclopediaSearchSchema } from "@/features/encyclopedia/search";

export const Route = createFileRoute("/encyclopedie/talents/")({
  validateSearch: encyclopediaSearchSchema,
  staticData: { itemsColumn: "talents" },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      talentListOptions({ locale: "fr", generationId: deps.gen }),
    );
  },
  head: () => ({ meta: [{ title: "Talents · Pokedata" }] }),
  component: Page,
});

function Page() {
  return (
    <ListPlaceholder title="Talents">
      Choisissez un talent dans la liste pour afficher sa fiche.
    </ListPlaceholder>
  );
}
