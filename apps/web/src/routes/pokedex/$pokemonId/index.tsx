import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { pokedexDetailOptions } from "@/features/pokedex/queries";
import { TypeBadge } from "@/features/pokedex/type-badge";

const LATEST_GENERATION = 9;

const STAT_LABELS: Record<string, string> = {
  hp: "PV",
  attack: "Attaque",
  defense: "Défense",
  "special-attack": "Attaque Spé.",
  "special-defense": "Défense Spé.",
  speed: "Vitesse",
  special: "Spécial",
};

const searchSchema = z.object({
  gen: z.coerce.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION),
});

export const Route = createFileRoute("/pokedex/$pokemonId/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, params, deps }) => {
    const detail = await context.queryClient.ensureQueryData(
      pokedexDetailOptions({
        identifier: params.pokemonId,
        locale: "fr",
        generationId: deps.gen,
      }),
    );

    // Identifiant inconnu, ou variété qui n'existait pas à cette génération.
    if (!detail) throw notFound();

    return { name: detail.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} · Pokedata` : "Fiche Pokémon · Pokedata" }],
  }),
  component: Page,
});

function Page() {
  const { pokemonId } = Route.useParams();
  const { gen } = Route.useSearch();
  const { data } = useSuspenseQuery(
    pokedexDetailOptions({ identifier: pokemonId, locale: "fr", generationId: gen }),
  );

  if (!data) return null;

  const maxStat = Math.max(...data.stats.map((line) => line.baseStat), 1);

  return (
    <main id="contenu" className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8">
      <Link
        to="/pokedex"
        search={{ gen }}
        className="inline-block py-2 text-sm underline underline-offset-4"
      >
        Retour au Pokédex
      </Link>

      <header className="mb-8 space-y-3">
        <p className="text-sm text-muted-foreground">
          N° {String(data.dexNumber).padStart(4, "0")} · génération {data.generationId}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{data.name}</h1>
        {data.genus && <p className="text-muted-foreground">{data.genus}</p>}
        <div className="flex flex-wrap gap-2">
          {data.types.map((entry) => (
            <TypeBadge key={entry.slot} identifier={entry.identifier} label={entry.name} />
          ))}
          {data.isLegendary && <span className="text-xs text-muted-foreground">Légendaire</span>}
          {data.isMythical && <span className="text-xs text-muted-foreground">Fabuleux</span>}
        </div>
      </header>

      <section aria-label="Statistiques de base" className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          Statistiques de base <span className="text-muted-foreground">· {data.statTotal}</span>
        </h2>
        <dl className="space-y-2">
          {data.stats.map((line) => (
            <div
              key={line.identifier}
              className="grid grid-cols-[9rem_3rem_1fr] items-center gap-3"
            >
              <dt className="text-sm text-muted-foreground">
                {STAT_LABELS[line.identifier] ?? line.identifier}
              </dt>
              <dd className="text-sm font-medium tabular-nums">{line.baseStat}</dd>
              <dd aria-hidden="true" className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/70"
                  style={{ width: `${(line.baseStat / maxStat) * 100}%` }}
                />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Caractéristiques">
        <h2 className="mb-4 text-xl font-semibold">Caractéristiques</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">Taille</dt>
            <dd>{data.height ? `${(data.height / 10).toFixed(1)} m` : "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Poids</dt>
            <dd>{data.weight ? `${(data.weight / 10).toFixed(1)} kg` : "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Taux de capture</dt>
            <dd>{data.captureRate}</dd>
          </div>
        </dl>
      </section>

      {data.forms.length > 1 && (
        <section aria-label="Formes" className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Formes</h2>
          <ul className="flex flex-wrap gap-2">
            {data.forms.map((form) => (
              <li key={form.id} className="rounded-lg border px-3 py-1 text-sm">
                {form.formIdentifier ?? form.identifier}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
