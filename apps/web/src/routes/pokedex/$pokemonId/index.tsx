import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@pokedata/ui/components/button";
import type { CSSProperties, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pokedata/ui/components/card";
import {
  PreviewCard,
  PreviewCardPanel,
  PreviewCardTrigger,
} from "@pokedata/ui/components/preview-card";
import {
  STAT_LABELS,
  formatForm,
  formatGender,
  formatVarietyName,
  formatEvolutionCondition,
  formatMeasurement,
  formatMoveMethod,
} from "@/features/pokedex/detail-format";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { EvolutionTree } from "@/features/pokedex/evolution-tree";
import { PokemonArtwork } from "@/features/pokedex/pokemon-artwork";
import { PokemonPreviewCard } from "@/features/pokedex/pokemon-preview-card";
import {
  pokedexDetailOptions,
  pokedexIndexOptions,
  pokedexReferenceOptions,
} from "@/features/pokedex/queries";
import {
  DEFAULT_POKEMON_TAB,
  LATEST_GENERATION,
  POKEMON_TABS,
  pokemonSearchSchema,
  type PokemonTab,
} from "@/features/pokedex/search";
import { TypeBadge } from "@/features/pokedex/type-badge";
import { TypeRelations } from "@/features/pokedex/type-relations";

export const Route = createFileRoute("/pokedex/$pokemonId/")({
  validateSearch: pokemonSearchSchema,
  // La liste reste affichée à côté de la fiche : même données que `/pokedex`.
  staticData: { itemsColumn: "pokemon", detail: true },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, params, deps }) => {
    const scope = { locale: "fr" as const, generationId: deps.gen };

    const [detail] = await Promise.all([
      context.queryClient.ensureQueryData(
        pokedexDetailOptions({ identifier: params.pokemonId, ...scope }),
      ),
      context.queryClient.ensureQueryData(pokedexIndexOptions(scope)),
      context.queryClient.ensureQueryData(pokedexReferenceOptions(scope)),
    ]);

    // Identifiant inconnu, ou variété qui n'existait pas à cette génération.
    if (!detail) throw notFound();

    return { name: detail.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} · Pokedata` : "Fiche Pokémon · Pokedata" }],
  }),
  component: Page,
});

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
    <section id={id} aria-labelledby={`${id}-title`} className="min-w-0">
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

function PokemonSprite({
  pokemonId,
  formIdentifier,
}: {
  pokemonId: number;
  formIdentifier?: string | null;
}) {
  const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
  const fallback = `${baseUrl}/${pokemonId}.png`;

  return (
    <img
      src={formIdentifier ? `${baseUrl}/${pokemonId}-${formIdentifier}.png` : fallback}
      alt=""
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
      className="size-16 shrink-0 object-contain"
      onError={(event) => {
        if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
      }}
    />
  );
}

function Page() {
  const { pokemonId } = Route.useParams();
  const { gen, q, type, onglet = DEFAULT_POKEMON_TAB } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const selectTab = (value: string) =>
    navigate({
      search: (previous) => ({ ...previous, onglet: value as PokemonTab }),
      replace: true,
      resetScroll: false,
    });
  const { data } = useSuspenseQuery(
    pokedexDetailOptions({ identifier: pokemonId, locale: "fr", generationId: gen }),
  );

  const { data: index } = useSuspenseQuery(
    pokedexIndexOptions({ locale: "fr", generationId: gen }),
  );
  const position = index.entries.findIndex((entry) => entry.identifier === pokemonId);
  const previous = position > 0 ? index.entries[position - 1] : undefined;
  const next = position >= 0 ? index.entries[position + 1] : undefined;

  if (!data) return null;

  // La dernière version disponible sert d’introduction ; les variantes restent consultables.
  const descriptions = [
    ...new Set(
      [...data.descriptions]
        .sort((a, b) => b.versionId - a.versionId)
        .map(({ flavorText }) => flavorText.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    ),
  ];
  const [description, ...otherDescriptions] = descriptions;
  const effort = data.stats.filter((line) => line.effort > 0);
  const formOf = (identifier: string) =>
    identifier.startsWith(`${data.speciesIdentifier}-`)
      ? identifier.slice(data.speciesIdentifier.length + 1)
      : "";
  const stages = data.evolutionFamily.map((stage) => ({
    speciesId: stage.speciesId,
    pokemonId: stage.pokemonId,
    identifier: stage.identifier,
    name: formatVarietyName(stage.name, stage.formSuffix),
    evolvesFromSpeciesId: stage.evolvesFromSpeciesId,
    // Plusieurs lignes du catalogue donnent parfois le même texte (lieu ou capacité non détaillés).
    condition: stage.conditions.length
      ? [...new Set(stage.conditions.map(formatEvolutionCondition))].join(" ou ")
      : null,
  }));
  const familyPokemonIds = new Set(stages.map((stage) => stage.pokemonId));
  // Les variétés qui ne figurent pas dans la lignée affichée : l'autre forme d'une espèce, les Méga-évolutions.
  const otherVarieties = data.varieties
    .filter((entry) => !familyPokemonIds.has(entry.id))
    .map((entry) => ({
      pokemonId: entry.id,
      speciesId: data.speciesId,
      identifier: entry.identifier,
      name: formatVarietyName(data.name, entry.isDefault ? "" : formOf(entry.identifier)),
      description: entry.isDefault ? "Variété principale" : `Variété de ${data.name}`,
    }));
  const additionalForms = data.forms.filter((form) => !form.isDefault);

  const formDescription = (form: (typeof data.forms)[number]) =>
    [
      form.isDefault && form.formIdentifier ? `Forme ${formatForm(form.formIdentifier)}` : null,
      form.isMega ? "Méga-Évolution" : null,
      form.isBattleOnly ? "En combat uniquement" : null,
      form.introducedIn !== null ? `Depuis la génération ${form.introducedIn}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <main
      id="contenu"
      className="@container mx-auto flex min-w-0 w-full max-w-6xl flex-col gap-6 px-5 py-6 @2xl:px-8"
    >
      <nav
        aria-label="Pokémon précédent et suivant"
        className="flex items-center justify-between gap-3"
      >
        {previous ? (
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/pokedex/$pokemonId"
                params={{ pokemonId: previous.identifier }}
                search={{ gen, q, type, onglet }}
              />
            }
          >
            <ChevronLeftIcon /> {previous.name}
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/pokedex/$pokemonId"
                params={{ pokemonId: next.identifier }}
                search={{ gen, q, type, onglet }}
              />
            }
          >
            {next.name} <ChevronRightIcon />
          </Button>
        ) : (
          <span />
        )}
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 basis-full items-center gap-4 @lg:flex-1 @lg:basis-[24rem] @lg:gap-6">
          <PokemonArtwork
            pokemonId={data.id}
            type={data.types[0]?.identifier}
            className="size-24 @lg:size-36 @2xl:size-40"
          />
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Pokédex national · N° {String(data.dexNumber).padStart(4, "0")}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight wrap-anywhere @lg:text-3xl @2xl:text-4xl">
              {data.name}
            </h1>
            {data.formSuffix ? <p>{formatVarietyName(data.name, data.formSuffix)}</p> : null}
            {data.genus ? <p className="text-muted-foreground">{data.genus}</p> : null}
            <div className="flex flex-wrap gap-2">
              {data.types.map((entry) => (
                <TypeBadge key={entry.slot} identifier={entry.identifier} label={entry.name} />
              ))}
            </div>
            <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Fact label="Taille">{formatMeasurement(data.height, "m")}</Fact>
              <Fact label="Poids">{formatMeasurement(data.weight, "kg")}</Fact>
            </dl>
            <p className="text-xs text-muted-foreground">
              Espèce apparue en génération {data.introducedIn} · Fiche en génération {gen}
            </p>
          </div>
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
              void navigate({
                search: (previous) => ({ ...previous, gen: Number(event.target.value) }),
              });
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

      <Tabs value={onglet} onValueChange={selectTab} className="flex flex-col gap-6">
        <TabsList aria-label="Sections de la fiche">
          {POKEMON_TABS.map(([id, label]) => (
            <TabsTrigger key={id} value={id}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="apercu" className="flex flex-col gap-6">
          <DetailSection id="descriptions" title="Description du Pokédex">
            {description ? (
              <div className="flex flex-col gap-4">
                <p>{description}</p>
                {otherDescriptions.length ? (
                  <details>
                    <summary className="cursor-pointer text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4">
                      Autres descriptions ({otherDescriptions.length})
                    </summary>
                    <ul className="mt-3 flex flex-col gap-3">
                      {otherDescriptions.map((text) => (
                        <li key={text} className="border-l-2 pl-3">
                          {text}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Aucune description française pour cette espèce.
              </p>
            )}
          </DetailSection>
          <div className="grid items-start gap-6 @min-[48rem]:grid-cols-2">
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
          <DetailSection id="talents" title="Talents">
            {data.abilities.length ? (
              <ul className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
                {data.abilities.map((ability) => {
                  const talentType = ability.isHidden ? "Talent caché" : `Talent ${ability.slot}`;

                  return (
                    <li key={ability.id}>
                      <PreviewCard>
                        <PreviewCardTrigger
                          delay={250}
                          closeDelay={200}
                          render={
                            <Link
                              to="/encyclopedie/talents/$talentId"
                              params={{ talentId: ability.identifier }}
                              search={{ gen }}
                              className="flex h-full w-full flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
                            >
                              <span className="font-medium">{ability.name}</span>
                              <span className="text-sm text-muted-foreground">{talentType}</span>
                            </Link>
                          }
                        />
                        <PreviewCardPanel side="top">
                          <div className="flex flex-col gap-3">
                            <p>
                              {ability.description ??
                                "Aucune description française disponible pour cette génération."}
                            </p>
                            <Link
                              to="/encyclopedie/talents/$talentId"
                              params={{ talentId: ability.identifier }}
                              search={{ gen }}
                              className="self-start font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                            >
                              Voir le talent
                            </Link>
                          </div>
                        </PreviewCardPanel>
                      </PreviewCard>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">Aucun talent renseigné.</p>
            )}
          </DetailSection>
          <DetailSection id="identite" title="Informations complémentaires">
            <dl className="flex flex-wrap gap-x-6 gap-y-3 [&>div]:min-w-0 [&>div]:flex-row [&>div]:flex-wrap [&>div]:gap-x-2 [&_dd]:wrap-anywhere">
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
        </TabsContent>
        <TabsContent value="evolutions" className="flex flex-col gap-8">
          <DetailSection
            id="evolutions"
            title="Évolutions"
            description={`Lignée d’évolution de ${formatVarietyName(data.name, data.formSuffix)} en génération ${gen}.`}
          >
            <EvolutionTree stages={stages} currentPokemonId={data.id} gen={gen} />
          </DetailSection>
          {otherVarieties.length || additionalForms.length ? (
            <DetailSection
              id="formes"
              title="Autres formes"
              description={`Variétés et formes de ${data.name} présentes en génération ${gen}.`}
            >
              <ul className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
                {otherVarieties.map((entry) => (
                  <li key={entry.pokemonId}>
                    <PokemonPreviewCard identifier={entry.identifier} gen={gen}>
                      <Link
                        to="/pokedex/$pokemonId"
                        params={{ pokemonId: entry.identifier }}
                        search={{ gen }}
                        className="flex h-full items-center gap-3 rounded-lg border p-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        <PokemonSprite pokemonId={entry.pokemonId} />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="text-sm text-muted-foreground">
                            N° {String(entry.speciesId).padStart(4, "0")}
                          </span>
                          <span className="font-semibold">{entry.name}</span>
                          <span className="text-sm text-muted-foreground">{entry.description}</span>
                        </span>
                      </Link>
                    </PokemonPreviewCard>
                  </li>
                ))}
                {additionalForms.map((form) => (
                  <li
                    key={`form-${form.id}`}
                    className="flex items-center gap-3 rounded-lg border p-4"
                  >
                    <PokemonSprite pokemonId={data.id} formIdentifier={form.formIdentifier} />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Forme de {data.name}</span>
                      <span className="font-semibold capitalize">
                        {formatForm(form.formIdentifier || form.identifier)}
                      </span>
                      <span className="text-sm text-muted-foreground">{formDescription(form)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
        </TabsContent>
        <TabsContent value="elevage" className="flex flex-col gap-8">
          <div className="grid items-start gap-6 @3xl:grid-cols-2">
            <DetailSection
              id="entrainement"
              title="Capture et entraînement"
              description="Valeurs de référence du catalogue ; elles peuvent varier selon les jeux."
            >
              <dl className="grid gap-6 @lg:grid-cols-2">
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
                  La reproduction et le sexe des Pokémon ne sont pas disponibles en première
                  génération.
                </p>
              ) : (
                <dl className="grid gap-6 @lg:grid-cols-2">
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
        </TabsContent>
        <TabsContent value="attaques" className="flex flex-col gap-8">
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
        </TabsContent>
        <TabsContent value="rencontres" className="flex flex-col gap-8">
          <DetailSection
            id="rencontres"
            title="Lieux de rencontre"
            description="Lieux et niveaux connus dans les versions de la génération consultée."
          >
            {data.encounters.length ? (
              <div className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
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
        </TabsContent>
        <TabsContent value="medias" className="flex flex-col gap-8">
          <DetailSection
            id="medias"
            title="Médias"
            description="Sprites officiels PokeAPI/Sprites. Les illustrations et les cris seront ajoutés avec le futur pipeline média."
          >
            <div className="grid gap-4 @lg:grid-cols-3">
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
                <figcaption className="text-sm text-muted-foreground">
                  Version chromatique
                </figcaption>
              </figure>
            </div>
          </DetailSection>
        </TabsContent>
      </Tabs>
    </main>
  );
}
