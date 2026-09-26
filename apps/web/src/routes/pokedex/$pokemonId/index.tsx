import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pokedata/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@pokedata/ui/components/tooltip";
import {
  STAT_LABELS,
  formatForm,
  formatGender,
  formatEvolutionCondition,
  formatMeasurement,
  formatMoveMethod,
} from "@/features/pokedex/detail-format";
import { z } from "zod";

import { PokemonPreviewCard } from "@/features/pokedex/pokemon-preview-card";
import { pokedexDetailOptions } from "@/features/pokedex/queries";
import { TypeBadge } from "@/features/pokedex/type-badge";
import { TypeRelations } from "@/features/pokedex/type-relations";

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
  ["relations", "Relations de types"],
  ["evolutions", "Évolutions"],
  ["formes", "Formes"],
  ["entrainement", "Entraînement"],
  ["reproduction", "Reproduction"],
  ["reproduction-groupes", "Groupes d’œufs"],
  ["conditions-evolution", "Conditions d’évolution"],
  ["descriptions", "Descriptions"],
  ["talents", "Talents"],
  ["attaques", "Attaques"],
  ["rencontres", "Rencontres"],
  ["medias", "Médias"],
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
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>
            <h2 id={`${id}-title`}>{title}</h2>
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="min-w-0">{children}</CardContent>
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

  return (
    <main
      id="contenu"
      className="mx-auto flex min-w-0 w-full max-w-6xl flex-col gap-8 px-5 py-10 md:px-8"
    >
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
                    className="h-full w-(--stat-width) rounded-full bg-primary"
                    style={
                      {
                        "--stat-width": `${Math.min((line.baseStat / 255) * 100, 100)}%`,
                      } as CSSProperties
                    }
                  />
                </dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        <DetailSection
          id="relations"
          title="Relations de types"
          description={`Génération ${gen} · Multiplicateurs d’efficacité entre types. Hors talents, objets et effets de combat.`}
        >
          <TypeRelations
            types={data.types}
            defense={data.matchups}
            offense={data.offensiveMatchups}
            gen={gen}
          />
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
              const isCurrent = entry.speciesId === data.speciesId;
              const link = (
                <Link
                  to="/pokedex/$pokemonId"
                  params={{ pokemonId: entry.identifier }}
                  search={{ gen }}
                  aria-current={isCurrent ? "true" : undefined}
                  className="flex h-full items-center gap-3 rounded-lg border p-4 hover:bg-muted aria-current:border-primary focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.pokemonId}.png`}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    className="size-16 shrink-0 object-contain"
                  />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      N° {String(entry.speciesId).padStart(4, "0")}
                    </span>
                    <span className="font-semibold">{entry.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {parent ? `Évolution de ${parent.name}` : "Premier stade disponible"}
                    </span>
                  </span>
                </Link>
              );
              return (
                <li key={entry.speciesId}>
                  {/* La fiche affichée n'a pas besoin de son propre aperçu. */}
                  {isCurrent ? (
                    link
                  ) : (
                    <PokemonPreviewCard identifier={entry.identifier} gen={gen}>
                      {link}
                    </PokemonPreviewCard>
                  )}
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

      <DetailSection
        id="descriptions"
        title="Descriptions du Pokédex"
        description="Textes officiels par version, nettoyés pour une lecture correcte."
      >
        {data.descriptions.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.descriptions.map((description) => (
              <li key={description.versionId} className="rounded-lg border p-4">
                {description.flavorText}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Aucune description française pour cette espèce.</p>
        )}
      </DetailSection>

      <DetailSection
        id="talents"
        title="Talents"
        description="Les talents cachés sont distingués des talents classiques."
      >
        {data.abilities.length ? (
          <TooltipProvider delay={250}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.abilities.map((ability) => {
                const talentType = ability.isHidden ? "Talent caché" : `Talent ${ability.slot}`;

                return (
                  <li key={ability.id}>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            aria-label={`Détails de ${ability.name} — ${talentType}`}
                            className="flex h-full w-full flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
                          >
                            <span className="font-medium">{ability.name}</span>
                            <span className="text-sm text-muted-foreground">{talentType}</span>
                          </button>
                        }
                      />
                      <TooltipContent
                        className="max-w-64 whitespace-normal rounded-lg border bg-popover p-4 text-left text-sm text-popover-foreground shadow-md [&>svg]:bg-popover [&>svg]:fill-popover"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold leading-tight">{ability.name}</span>
                            <span className="text-xs text-muted-foreground">{talentType}</span>
                          </div>
                          <span className="border-t pt-2 text-muted-foreground">
                            Talent répertorié pour {data.name}.
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        ) : (
          <p className="text-muted-foreground">Aucun talent renseigné.</p>
        )}
      </DetailSection>

      <DetailSection
        id="attaques"
        title="Attaques apprises"
        description="Attaques disponibles dans les groupes de versions de la génération consultée. Le niveau 0 correspond à une attaque apprise autrement qu’en montant de niveau."
      >
        {data.moves.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Attaque</th>
                  <th className="px-2 py-2 font-medium">Méthode</th>
                  <th className="px-2 py-2 font-medium">Niveau</th>
                  <th className="px-2 py-2 font-medium">Puissance</th>
                  <th className="px-2 py-2 font-medium">PP</th>
                  <th className="px-2 py-2 font-medium">Précision</th>
                </tr>
              </thead>
              <tbody>
                {data.moves.map((move) => (
                  <tr
                    key={`${move.id}-${move.versionGroupId}-${move.methodId}`}
                    className="border-b"
                  >
                    <td className="px-2 py-2 font-medium">{move.name}</td>
                    <td className="px-2 py-2 text-muted-foreground">
                      {formatMoveMethod(move.methodId)}
                    </td>
                    <td className="px-2 py-2 tabular-nums">{move.level || "—"}</td>
                    <td className="px-2 py-2 tabular-nums">{move.power ?? "—"}</td>
                    <td className="px-2 py-2 tabular-nums">{move.pp ?? "—"}</td>
                    <td className="px-2 py-2 tabular-nums">{move.accuracy ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">
            {data.isAvailableInGeneration
              ? "Aucune attaque renseignée pour cette génération."
              : `Ce Pokémon n’est répertorié dans aucun jeu de la génération ${gen}. Il ne peut donc pas y être transféré depuis Pokémon HOME.`}
          </p>
        )}
      </DetailSection>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <DetailSection
          id="reproduction-groupes"
          title="Groupes d’œufs"
          description="Groupes utilisés pour déterminer la compatibilité à la pension."
        >
          {data.eggGroups.length ? (
            <ul className="flex flex-wrap gap-2">
              {data.eggGroups.map((group) => (
                <li key={group.id} className="rounded-lg border px-3 py-2">
                  {group.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Aucun groupe d’œufs renseigné.</p>
          )}
        </DetailSection>
        <DetailSection id="conditions-evolution" title="Conditions d’évolution">
          {data.evolutionConditions.length ? (
            <ul className="flex flex-col gap-2">
              {data.evolutionConditions.map((condition) => (
                <li
                  key={`${condition.evolvedSpeciesId}-${condition.triggerId}`}
                  className="rounded-lg border p-3"
                >
                  {formatEvolutionCondition(condition)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              Aucune condition d’évolution directe renseignée.
            </p>
          )}
        </DetailSection>
      </div>

      <DetailSection
        id="rencontres"
        title="Lieux de rencontre"
        description="Lieux et niveaux connus dans les versions de la génération consultée."
      >
        {data.encounters.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.encounters.map((encounter, index) => (
              <div
                key={`${encounter.locationId}-${encounter.versionId}-${index}`}
                className="rounded-lg border p-4"
              >
                <p className="font-medium">{encounter.location ?? "Lieu inconnu"}</p>
                <p className="text-sm text-muted-foreground">
                  {encounter.area.replaceAll("-", " ")} · niveaux {encounter.minLevel}–
                  {encounter.maxLevel}
                  {encounter.rarity !== null ? ` · ${encounter.rarity} %` : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Aucun lieu de rencontre renseigné pour cette génération.
          </p>
        )}
      </DetailSection>

      <DetailSection
        id="medias"
        title="Médias"
        description="Sprites officiels PokeAPI/Sprites. Les illustrations et les cris seront ajoutés avec le futur pipeline média."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <figure className="flex flex-col items-center gap-2 rounded-lg border p-4">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`}
              alt={`Sprite de ${data.name}`}
              width="160"
              height="160"
              loading="lazy"
            />
            <figcaption className="text-sm text-muted-foreground">Sprite classique</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2 rounded-lg border p-4">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`}
              alt={`Illustration officielle de ${data.name}`}
              width="240"
              height="240"
              loading="lazy"
            />
            <figcaption className="text-sm text-muted-foreground">
              Illustration officielle
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2 rounded-lg border p-4">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${data.id}.png`}
              alt={`Sprite chromatique de ${data.name}`}
              width="160"
              height="160"
              loading="lazy"
            />
            <figcaption className="text-sm text-muted-foreground">Version chromatique</figcaption>
          </figure>
        </div>
      </DetailSection>
    </main>
  );
}
