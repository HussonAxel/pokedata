import { Badge } from "@pokedata/ui/components/badge";
import { ItemDescription } from "@pokedata/ui/components/item";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { EyeOffIcon } from "lucide-react";

import { CardGrid, CardGridItem } from "@/components/card-grid";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageMeta, PageTitle } from "@/components/page-header";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { talentDetailOptions, talentListOptions } from "@/features/encyclopedia/queries";
import { encyclopediaSearchSchema } from "@/features/encyclopedia/search";
import { formatAbilitySlot, formatVarietyName } from "@/features/pokedex/detail-format";
import { PokemonLinkCard } from "@/features/pokedex/pokemon-link-card";

export const Route = createFileRoute("/encyclopedie/talents/$talentId/")({
  validateSearch: encyclopediaSearchSchema,
  staticData: { itemsColumn: "talents", detail: true },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, params, deps }) => {
    const scope = { locale: "fr" as const, generationId: deps.gen };
    const [detail] = await Promise.all([
      context.queryClient.ensureQueryData(
        talentDetailOptions({ identifier: params.talentId, ...scope }),
      ),
      context.queryClient.ensureQueryData(talentListOptions(scope)),
    ]);
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

  const hiddenCount = data.pokemon.filter((entry) => entry.isHidden).length;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader>
        <PageEyebrow>talent ( génération {gen} )</PageEyebrow>
        <PageTitle>{data.name}</PageTitle>
        <PageMeta>Apparu en génération {data.introducedIn}</PageMeta>
      </PageHeader>
      <Section id="description">
        <SectionHeader>
          <SectionTitle>Description</SectionTitle>
        </SectionHeader>
        <SectionContent>
          {data.description ? (
            <p className="font-heading text-lg/relaxed">{data.description}</p>
          ) : (
            <SectionEmpty>
              Aucune description française disponible pour cette génération.
            </SectionEmpty>
          )}
        </SectionContent>
      </Section>
      <Section id="pokemon">
        <SectionHeader>
          <SectionTitle>Pokémon ayant ce talent</SectionTitle>
          <SectionDescription>
            {data.pokemon.length} Pokémon en génération {gen}
            {hiddenCount ? `, dont ${hiddenCount} en talent caché` : ""}.
          </SectionDescription>
        </SectionHeader>
        <SectionContent>
          {data.pokemon.length ? (
            <CardGrid>
              {data.pokemon.map((entry) => (
                <CardGridItem key={entry.id}>
                  <PokemonLinkCard
                    pokemonId={entry.id}
                    identifier={entry.identifier}
                    dexNumber={entry.dexNumber}
                    name={formatVarietyName(entry.name, entry.formSuffix)}
                    gen={gen}
                  >
                    {entry.isHidden ? (
                      <Badge variant="signal">
                        <EyeOffIcon data-icon="inline-start" />
                        {formatAbilitySlot(entry)}
                      </Badge>
                    ) : (
                      <ItemDescription>{formatAbilitySlot(entry)}</ItemDescription>
                    )}
                  </PokemonLinkCard>
                </CardGridItem>
              ))}
            </CardGrid>
          ) : (
            <SectionEmpty>Aucun Pokémon ne possède ce talent en génération {gen}.</SectionEmpty>
          )}
        </SectionContent>
      </Section>
    </PageContainer>
  );
}
