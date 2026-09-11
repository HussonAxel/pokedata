import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useMemo } from "react";
import { z } from "zod";

import { pokedexIndexOptions, pokedexReferenceOptions } from "@/features/pokedex/queries";
import { TypeBadge } from "@/features/pokedex/type-badge";

const LATEST_GENERATION = 9;

/** Filtres dans l'URL : une vue se partage et survit au retour arrière. */
const searchSchema = z.object({
  q: z.string().trim().max(50).optional(),
  type: z.string().max(20).optional(),
  gen: z.coerce.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION),
});

export const Route = createFileRoute("/pokedex/")({
  validateSearch: searchSchema,
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

function Page() {
  const { q, type, gen } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const scope = { locale: "fr" as const, generationId: gen };

  const { data: index } = useSuspenseQuery(pokedexIndexOptions(scope));
  const { data: reference } = useSuspenseQuery(pokedexReferenceOptions(scope));

  // La frappe reste fluide même si la liste rendue est longue : le filtrage
  // s'exécute sur une valeur différée, l'input ne bloque jamais.
  const deferredQuery = useDeferredValue(q ?? "");

  const entries = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();

    return index.entries.filter((entry) => {
      if (type && !entry.types.includes(type)) return false;
      if (!needle) return true;

      return (
        entry.name.toLowerCase().includes(needle) ||
        String(entry.dexNumber).padStart(4, "0").includes(needle)
      );
    });
  }, [index.entries, deferredQuery, type]);

  return (
    <main id="contenu" className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Pokédex national</h1>
        <p className="text-muted-foreground">
          {index.entries.length} Pokémon en génération {gen}.
        </p>

        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={q ?? ""}
            placeholder="Rechercher un nom ou un numéro"
            aria-label="Rechercher un Pokémon"
            className="h-10 min-w-64 flex-1 rounded-lg border px-3"
            onChange={(event) => {
              const value = event.target.value;
              navigate({
                search: (previous) => ({ ...previous, q: value || undefined }),
                replace: true,
              });
            }}
          />

          <select
            value={type ?? ""}
            aria-label="Filtrer par type"
            className="h-10 rounded-lg border px-3"
            onChange={(event) => {
              const value = event.target.value;
              navigate({
                search: (previous) => ({ ...previous, type: value || undefined }),
                replace: true,
              });
            }}
          >
            <option value="">Tous les types</option>
            {reference.types.map((entry) => (
              <option key={entry.id} value={entry.identifier}>
                {entry.name}
              </option>
            ))}
          </select>

          <select
            value={gen}
            aria-label="Génération"
            className="h-10 rounded-lg border px-3"
            onChange={(event) => {
              navigate({
                search: (previous) => ({ ...previous, gen: Number(event.target.value) }),
              });
            }}
          >
            {reference.generations.map((entry) => (
              <option key={entry.id} value={entry.id}>
                Génération {entry.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-lg bg-muted p-6 text-sm">
          Aucun Pokémon ne correspond à ces filtres.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {entries.map((entry) => (
            <li
              key={entry.id}
              // Les cartes hors écran ne sont pas mises en page tant qu'elles ne
              // sont pas visibles : la grille complète reste fluide sans
              // virtualisation ni dépendance supplémentaire.
              style={{ contentVisibility: "auto", containIntrinsicSize: "auto 92px" }}
            >
              <Link
                to="/pokedex/$pokemonId"
                params={{ pokemonId: entry.identifier }}
                search={{ gen }}
                className="flex h-full flex-col gap-2 rounded-xl border p-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <span className="text-xs text-muted-foreground">
                  N° {String(entry.dexNumber).padStart(4, "0")}
                </span>
                <span className="font-medium">{entry.name}</span>
                <span className="flex flex-wrap gap-1">
                  {entry.types.map((identifier) => (
                    <TypeBadge key={identifier} identifier={identifier} />
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
