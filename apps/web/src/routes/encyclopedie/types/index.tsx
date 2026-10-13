import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@pokedata/ui/components/button";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { TypeChart } from "@/components/charts/type-chart";
import { GenerationSelect } from "@/components/generation-select";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import { TypeBadge } from "@/features/pokedex/type-badge";
import { pokedexReferenceOptions, pokedexTypeChartOptions } from "@/features/pokedex/queries";
import { LATEST_GENERATION } from "@/features/pokedex/search";

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
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <PageHeader>
          <PageEyebrow>types ( {chart.types.length} )</PageEyebrow>
          <PageTitle>Table des types</PageTitle>
          <p className="max-w-2xl text-muted-foreground">
            Une ligne par type d'attaque, une colonne par type défenseur ; la dernière colonne
            compte les types touchés ×2.
          </p>
        </PageHeader>
        <GenerationSelect
          value={gen}
          generations={reference.generations.map((entry) => entry.id)}
          onValueChange={(next) =>
            void navigate({ search: (previous) => ({ ...previous, gen: next }) })
          }
        />
      </div>

      <nav aria-label="Fiches des types">
        <ul className="flex flex-wrap gap-2">
          {chart.types.map((entry) => (
            <li key={entry.identifier}>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link
                    to="/encyclopedie/types/$typeId"
                    params={{ typeId: entry.identifier }}
                    search={{ gen }}
                  />
                }
              >
                <TypeBadge identifier={entry.identifier} label={entry.name} />
                {entry.name}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

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
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
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
    </PageContainer>
  );
}
