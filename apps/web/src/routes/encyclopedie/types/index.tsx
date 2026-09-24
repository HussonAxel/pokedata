import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { TypeChart } from "@/components/charts/type-chart";
import { pokedexReferenceOptions, pokedexTypeChartOptions } from "@/features/pokedex/queries";

const LATEST_GENERATION = 9;

/** La génération vit dans l'URL : une table se partage telle qu'elle est lue. */
const searchSchema = z.object({
  gen: z.coerce.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION),
});

export const Route = createFileRoute("/encyclopedie/types/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, deps }) => {
    const scope = { locale: "fr" as const, generationId: deps.gen };

    await Promise.all([
      context.queryClient.ensureQueryData(pokedexTypeChartOptions(scope)),
      context.queryClient.ensureQueryData(pokedexReferenceOptions(scope)),
    ]);
  },
  head: () => ({ meta: [{ title: "Table des types · Pokedata" }] }),
  component: Page,
});

function Page() {
  const { gen } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const scope = { locale: "fr" as const, generationId: gen };

  const { data: chart } = useSuspenseQuery(pokedexTypeChartOptions(scope));
  const { data: reference } = useSuspenseQuery(pokedexReferenceOptions(scope));

  return (
    <main id="contenu" className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Table des types</h1>
        <p className="text-muted-foreground">
          {chart.types.length} types en génération {gen}. Une ligne par type d'attaque, une colonne
          par type défenseur ; la dernière colonne compte les types touchés ×2.
        </p>

        <select
          value={gen}
          aria-label="Génération"
          className="h-10 rounded-lg border px-3"
          onChange={(event) => {
            navigate({ search: (previous) => ({ ...previous, gen: Number(event.target.value) }) });
          }}
        >
          {reference.generations.map((entry) => (
            <option key={entry.id} value={entry.id}>
              Génération {entry.id}
            </option>
          ))}
        </select>
      </div>

      {/* La table garde une largeur minimale lisible : sur petit écran elle
          défile horizontalement plutôt que d'écraser ses colonnes. */}
      <div className="overflow-x-auto pb-2">
        <TypeChart
          // La clé rejoue la vague d'entrée quand la génération change.
          key={gen}
          types={chart.types}
          factors={chart.factors}
        />
      </div>

      {/* La légende reprend exactement les fonds de la grille : quatre niveaux,
          jamais un dégradé continu. */}
      <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-xs bg-success/25 font-mono text-xs font-semibold text-foreground">
            2
          </span>
          <dt className="sr-only">×2</dt>
          <dd>très efficace</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-xs bg-destructive/25 font-mono text-xs font-semibold text-foreground">
            ½
          </span>
          <dt className="sr-only">×½</dt>
          <dd>peu efficace</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-xs bg-foreground/80 font-mono text-xs font-semibold text-background">
            0
          </span>
          <dt className="sr-only">×0</dt>
          <dd>immunisé</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-5 rounded-xs bg-foreground/5" />
          <dt className="sr-only">×1</dt>
          <dd>neutre</dd>
        </div>
      </dl>
    </main>
  );
}
