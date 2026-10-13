import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import {
  EggGroupsSection,
  ReproductionSection,
  TrainingSection,
} from "@/features/pokedex/detail/breeding";
import { PokemonDetailProvider } from "@/features/pokedex/detail/context";
import { EncountersSection } from "@/features/pokedex/detail/encounters";
import { EvolutionSection, FormsSection } from "@/features/pokedex/detail/evolutions";
import { MediaSection } from "@/features/pokedex/detail/media";
import { MovesSection } from "@/features/pokedex/detail/moves";
import {
  AbilitiesSection,
  DescriptionSection,
  IdentitySection,
  StatsSection,
  TypeRelationsSection,
} from "@/features/pokedex/detail/overview";
import { PokemonHero, PokemonPager } from "@/features/pokedex/detail/pokemon-hero";
import {
  pokedexDetailOptions,
  pokedexIndexOptions,
  pokedexReferenceOptions,
} from "@/features/pokedex/queries";
import { DEFAULT_POKEMON_TAB, POKEMON_TABS, pokemonSearchSchema } from "@/features/pokedex/search";

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

function Page() {
  const { pokemonId } = Route.useParams();
  const { gen, onglet = DEFAULT_POKEMON_TAB } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(
    pokedexDetailOptions({ identifier: pokemonId, locale: "fr", generationId: gen }),
  );

  if (!data) return null;

  const selectTab = (value: string) => {
    const tab = POKEMON_TABS.find(([id]) => id === value)?.[0];
    if (!tab) return;
    void navigate({
      search: (previous) => ({ ...previous, onglet: tab }),
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <PokemonDetailProvider pokemon={data} gen={gen}>
      <main
        id="contenu"
        className="@container mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 px-5 py-6 @2xl:px-8"
      >
        <PokemonPager />
        <PokemonHero />

        <Tabs value={onglet} onValueChange={selectTab} className="flex flex-col gap-6">
          <TabsList aria-label="Sections de la fiche">
            {POKEMON_TABS.map(([id, label]) => (
              <TabsTrigger key={id} value={id}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="apercu" className="flex flex-col gap-6">
            <DescriptionSection />
            <div className="grid items-start gap-6 @min-[48rem]:grid-cols-2">
              <StatsSection />
              <TypeRelationsSection />
            </div>
            <AbilitiesSection />
            <IdentitySection />
          </TabsContent>
          <TabsContent value="evolutions" className="flex flex-col gap-6">
            <EvolutionSection />
            <FormsSection />
          </TabsContent>
          <TabsContent value="elevage" className="flex flex-col gap-6">
            <div className="grid items-start gap-6 @3xl:grid-cols-2">
              <TrainingSection />
              <ReproductionSection />
            </div>
            <EggGroupsSection />
          </TabsContent>
          <TabsContent value="attaques" className="flex flex-col gap-6">
            <MovesSection />
          </TabsContent>
          <TabsContent value="rencontres" className="flex flex-col gap-6">
            <EncountersSection />
          </TabsContent>
          <TabsContent value="medias" className="flex flex-col gap-6">
            <MediaSection />
          </TabsContent>
        </Tabs>
      </main>
    </PokemonDetailProvider>
  );
}
