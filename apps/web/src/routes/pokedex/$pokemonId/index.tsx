import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pokedata/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@pokedata/ui/components/empty";
import {
  STAT_LABELS,
  formatForm,
  formatGender,
  formatMeasurement,
  formatNumber,
} from "@/features/pokedex/detail-format";
import { z } from "zod";

import { pokedexDetailOptions } from "@/features/pokedex/queries";
import { TypeBadge } from "@/features/pokedex/type-badge";

const LATEST_GENERATION = 9;

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

const SECTIONS = [
  ["identite", "Identité"],
  ["statistiques", "Statistiques"],
  ["sensibilites", "Sensibilités"],
  ["evolutions", "Évolutions"],
  ["formes", "Formes"],
  ["entrainement", "Entraînement"],
  ["reproduction", "Reproduction"],
] as const;

function DetailSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="min-w-0 scroll-mt-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id={`${id}-title`}>{title}</h2>
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

function Page() {
  const { pokemonId } = Route.useParams();
  const { gen } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data } = useSuspenseQuery(
    pokedexDetailOptions({ identifier: pokemonId, locale: "fr", generationId: gen }),
  );

  if (!data) return null;

  const currentVariety = data.varieties.find((entry) => entry.id === data.id);
  const effort = data.stats.filter((line) => line.effort > 0);
  const familyById = new Map(data.evolutionFamily.map((entry) => [entry.speciesId, entry]));
  const matchupGroups = [
    { title: "Faiblesses", entries: data.matchups.filter((entry) => entry.multiplier > 1) },
    {
      title: "Résistances",
      entries: data.matchups.filter((entry) => entry.multiplier > 0 && entry.multiplier < 1),
    },
    { title: "Immunités", entries: data.matchups.filter((entry) => entry.multiplier === 0) },
    { title: "Dégâts neutres", entries: data.matchups.filter((entry) => entry.multiplier === 1) },
  ];

  return (
    <main id="contenu" className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 md:px-8">
      <Link
        to="/pokedex"
        search={{ gen }}
        className="self-start py-2 text-sm underline underline-offset-4"
      >
        ← Retour au Pokédex
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Pokédex national · N° {String(data.dexNumber).padStart(4, "0")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{data.name}</h1>
          {currentVariety && !currentVariety.isDefault ? (
            <p className="capitalize">{formatForm(data.identifier)}</p>
          ) : null}
          {data.genus ? <p className="text-muted-foreground">{data.genus}</p> : null}
          <div className="flex flex-wrap gap-2">
            {data.types.map((entry) => (
              <TypeBadge key={entry.slot} identifier={entry.identifier} label={entry.name} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Espèce apparue en génération {data.introducedIn} · Fiche en génération {gen}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="detail-generation" className="text-sm font-medium">
            Génération consultée
          </label>
          <select
            id="detail-generation"
            value={gen}
            className="h-10 rounded-lg border bg-background px-3"
            onChange={(event) => {
              void navigate({ search: { gen: Number(event.target.value) } });
            }}
          >
            {data.availableGenerations
              .filter((entry) => entry.id <= LATEST_GENERATION)
              .map((entry) => (
                <option key={entry.id} value={entry.id}>
                  Génération {entry.id}
                </option>
              ))}
          </select>
        </div>
      </header>

      <nav
        aria-label="Sommaire de la fiche"
        className="flex flex-wrap gap-x-5 gap-y-3 border-y py-4 text-sm"
      >
        {SECTIONS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {label}
          </a>
        ))}
      </nav>

      <DetailSection id="identite" title="Identité et caractéristiques">
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Taille">{formatMeasurement(data.height, "m")}</Fact>
          <Fact label="Poids">{formatMeasurement(data.weight, "kg")}</Fact>
          <Fact label="Catégorie">{data.genus ?? "Non renseignée"}</Fact>
          <Fact label="Statut">
            {[
              data.isBaby ? "Bébé Pokémon" : null,
              data.isLegendary ? "Légendaire" : null,
              data.isMythical ? "Fabuleux" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Pokémon ordinaire"}
          </Fact>
          {data.names.map((entry) => (
            <Fact
              key={entry.language}
              label={`Nom ${entry.language === "fr" ? "français" : entry.language === "en" ? "anglais" : entry.language}`}
            >
              {entry.name}
            </Fact>
          ))}
        </dl>
      </DetailSection>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <DetailSection
          id="statistiques"
          title="Statistiques de base"
          description={`Génération ${gen} · Total : ${data.statTotal}. Valeurs de base, avant le niveau, la nature et l’entraînement.`}
        >
          <dl className="flex flex-col gap-4">
            {data.stats.map((line) => (
              <div
                key={line.identifier}
                className="grid grid-cols-[minmax(0,1fr)_3ch] items-center gap-x-3 gap-y-1"
              >
                <dt>{STAT_LABELS[line.identifier] ?? line.identifier}</dt>
                <dd className="text-right font-semibold tabular-nums">{line.baseStat}</dd>
                <dd
                  aria-hidden="true"
                  className="col-span-2 h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min((line.baseStat / 255) * 100, 100)}%` }}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        <DetailSection
          id="sensibilites"
          title="Sensibilités défensives"
          description="Multiplicateurs des dégâts reçus selon les types. Hors talents, objets et effets de combat."
        >
          <div className="flex flex-col gap-5">
            {matchupGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <h3 className="font-medium">{group.title}</h3>
                {group.entries.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {group.entries.map((entry) => (
                      <li key={entry.identifier} className="flex items-center gap-1.5">
                        <TypeBadge identifier={entry.identifier} label={entry.name} />
                        <span className="tabular-nums">×{formatNumber(entry.multiplier)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Aucune</p>
                )}
              </div>
            ))}
          </div>
        </DetailSection>
      </div>

      <DetailSection
        id="evolutions"
        title="Famille d’évolution"
        description={`Espèces de la famille présentes en génération ${gen}. Les conditions d’évolution ne sont pas encore renseignées.`}
      >
        {data.evolutionFamily.length > 1 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.evolutionFamily.map((entry) => {
              const parent =
                entry.evolvesFromSpeciesId === null
                  ? undefined
                  : familyById.get(entry.evolvesFromSpeciesId);
              return (
                <li key={entry.speciesId}>
                  <Link
                    to="/pokedex/$pokemonId"
                    params={{ pokemonId: entry.identifier }}
                    search={{ gen }}
                    aria-current={entry.speciesId === data.speciesId ? "true" : undefined}
                    className="flex h-full flex-col gap-2 rounded-lg border p-4 hover:bg-muted aria-current:border-primary focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    <span className="text-muted-foreground">
                      N° {String(entry.speciesId).padStart(4, "0")}
                    </span>
                    <span className="font-semibold">{entry.name}</span>
                    <span className="text-muted-foreground">
                      {parent ? `Évolution de ${parent.name}` : "Premier stade disponible"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            Aucune autre espèce de cette famille en génération {gen}.
          </p>
        )}
      </DetailSection>

      <DetailSection
        id="formes"
        title="Variétés et formes"
        description="Les variétés possèdent leur propre fiche. Les noms de formes sont ceux de la source lorsqu’aucune traduction n’est disponible."
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-medium">Variétés de {data.name}</h3>
            <ul className="flex flex-wrap gap-2">
              {data.varieties.map((entry) => (
                <li key={entry.id}>
                  <Link
                    to="/pokedex/$pokemonId"
                    params={{ pokemonId: entry.identifier }}
                    search={{ gen }}
                    aria-current={entry.id === data.id ? "page" : undefined}
                    className="inline-flex rounded-lg border px-3 py-2 capitalize hover:bg-muted aria-current:border-primary focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {entry.isDefault
                      ? `${data.name} · variété principale`
                      : formatForm(entry.identifier)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-medium">Formes de cette variété</h3>
            {data.forms.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.forms.map((form) => (
                  <li key={form.id} className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="font-medium capitalize">
                      {form.formIdentifier ? formatForm(form.formIdentifier) : "Forme principale"}
                    </span>
                    <span className="text-muted-foreground">
                      {[
                        form.isDefault ? "Par défaut" : null,
                        form.isMega ? "Méga-Évolution" : null,
                        form.isBattleOnly ? "En combat uniquement" : null,
                        form.introducedIn !== null
                          ? `Depuis la génération ${form.introducedIn}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Aucune forme renseignée pour cette génération.
              </p>
            )}
          </div>
        </div>
      </DetailSection>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <DetailSection
          id="entrainement"
          title="Capture et entraînement"
          description="Valeurs de référence du catalogue ; elles peuvent varier selon les jeux."
        >
          <dl className="grid gap-6 sm:grid-cols-2">
            <Fact label="Taux de capture">{data.captureRate} / 255</Fact>
            <Fact label="Expérience de base">{data.baseExperience ?? "Non renseignée"}</Fact>
            <Fact label="Bonheur de base">{data.baseHappiness ?? "Non renseigné"}</Fact>
            <Fact label="Points d’effort (EV) gagnés">
              {gen < 3
                ? "Système d’EV moderne absent de cette génération"
                : effort.length
                  ? effort
                      .map(
                        (line) =>
                          `${line.effort} ${STAT_LABELS[line.identifier] ?? line.identifier}`,
                      )
                      .join(" · ")
                  : "Aucun"}
            </Fact>
          </dl>
          <p className="mt-5 text-muted-foreground">
            Le taux de capture est un coefficient, pas un pourcentage de réussite. L’expérience
            reçue dépend du jeu et du combat.
          </p>
        </DetailSection>
        <DetailSection
          id="reproduction"
          title="Sexe et reproduction"
          description="Caractéristiques de l’espèce. Les cycles d’éclosion sont indiqués sans conversion en pas, qui dépend du jeu."
        >
          {gen === 1 ? (
            <p className="text-muted-foreground">
              La reproduction et le sexe des Pokémon ne sont pas disponibles en première génération.
            </p>
          ) : (
            <dl className="grid gap-6 sm:grid-cols-2">
              <Fact label="Répartition des sexes">{formatGender(data.genderRate)}</Fact>
              <Fact label="Cycles d’éclosion">{data.hatchCounter ?? "Non renseignés"}</Fact>
              <Fact label="Différences visuelles selon le sexe">
                {data.hasGenderDifferences
                  ? "Oui, selon les jeux et les formes"
                  : "Aucune répertoriée"}
              </Fact>
              <Fact label="Bébé Pokémon">{data.isBaby ? "Oui" : "Non"}</Fact>
            </dl>
          )}
        </DetailSection>
      </div>

      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Informations complémentaires à venir</EmptyTitle>
          <EmptyDescription>
            Les descriptions du Pokédex, talents, attaques, groupes d’œufs, conditions d’évolution,
            lieux de rencontre et médias ne sont pas encore disponibles sur cette fiche.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  );
}
