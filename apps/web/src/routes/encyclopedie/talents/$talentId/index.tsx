import { Badge } from "@pokedata/ui/components/badge";
import { Button } from "@pokedata/ui/components/button";
import { ItemDescription } from "@pokedata/ui/components/item";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon, EyeOffIcon } from "lucide-react";
import { z } from "zod";

import { PageEyebrow, PageHeader, PageMeta, PageTitle } from "@/components/page-header";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { formatAbilitySlot, formatVarietyName } from "@/features/pokedex/detail-format";
import { PokemonLinkCard } from "@/features/pokedex/pokemon-link-card";
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

  const hiddenCount = data.pokemon.filter((entry) => entry.isHidden).length;

  return (
    <main
      id="contenu"
      className="@container mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-6 @2xl:px-8"
    >
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        className="self-start"
        render={<Link to="/pokedex" search={{ gen }} />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Retour au Pokédex
      </Button>
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
            <ul className="grid gap-3 @lg:grid-cols-2">
              {data.pokemon.map((entry) => (
                <li key={entry.id}>
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
                </li>
              ))}
            </ul>
          ) : (
            <SectionEmpty>Aucun Pokémon ne possède ce talent en génération {gen}.</SectionEmpty>
          )}
        </SectionContent>
      </Section>
    </main>
  );
}
