import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@pokedata/ui/components/card";
import { talentDetailOptions } from "@/features/pokedex/talent-queries";

export const Route = createFileRoute("/encyclopedie/talents/$talentId/")({
  validateSearch: z.object({ gen: z.coerce.number().int().min(1).max(9).default(9) }),
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, params, deps }) => {
    const detail = await context.queryClient.ensureQueryData(
      talentDetailOptions({ identifier: params.talentId, locale: "fr", generationId: deps.gen }),
    );
    if (!detail) throw notFound();
    return { name: detail.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} · Talents · Pokedata` : "Talent · Pokedata" }],
  }),
  component: Page,
});

function Page() {
  const { talentId } = Route.useParams();
  const { gen } = Route.useSearch();
  const { data } = useSuspenseQuery(
    talentDetailOptions({ identifier: talentId, locale: "fr", generationId: gen }),
  );
  if (!data) return null;

  return (
    <main id="contenu" className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10 md:px-8">
      <Link
        to="/pokedex"
        search={{ gen }}
        className="self-start py-2 text-sm underline underline-offset-4"
      >
        ← Retour au Pokédex
      </Link>
      <header className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Talent · Génération {gen}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{data.name}</h1>
        <p className="text-sm text-muted-foreground">Apparu en génération {data.introducedIn}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Description</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {data.description ?? "Aucune description française disponible pour cette génération."}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
