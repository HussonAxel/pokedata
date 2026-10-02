import { createFileRoute } from "@tanstack/react-router";

import { pokedexIndexOptions, pokedexReferenceOptions } from "@/features/pokedex/queries";
import { pokedexSearchSchema } from "@/features/pokedex/search";

export const Route = createFileRoute("/pokedex/")({
  validateSearch: pokedexSearchSchema,
  staticData: { itemsColumn: "pokemon" },
  // Seule la génération déclenche un rechargement : la recherche et le filtre
  // par type sont appliqués dans le navigateur sur l'index déjà chargé.
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, deps }) => {
    const scope = { locale: "fr" as const, generationId: deps.gen };

    await Promise.all([
      context.queryClient.ensureQueryData(pokedexIndexOptions(scope)),
      context.queryClient.ensureQueryData(pokedexReferenceOptions(scope)),
    ]);
  },
  head: () => ({ meta: [{ title: "Pokédex national · Pokedata" }] }),
  component: Page,
});

/** La liste est dans la colonne de gauche (voir `PokemonColumn`) ; ici, rien n'est encore ouvert. */
function Page() {
  return (
    <div id="contenu" className="grid h-full place-items-center p-8 text-center">
      <div className="max-w-xs space-y-2">
        <h1 className="text-lg font-semibold tracking-tight">Pokédex national</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Choisissez un Pokémon dans la liste pour afficher sa fiche.
        </p>
      </div>
    </div>
  );
}
