import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { Fact, FactList } from "@/components/fact-list";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { FLAVORS, formatFirmness, formatValue } from "@/features/encyclopedia/format";
import { ItemSprite } from "@/features/encyclopedia/item-sprite";
import { berryDetailOptions, berryListOptions } from "@/features/encyclopedia/queries";
import { encyclopediaSearchSchema } from "@/features/encyclopedia/search";
import { TypeBadgeLink } from "@/features/pokedex/type-badge";

/** Intensité maximale d'une saveur dans le catalogue. */
const MAX_POTENCY = 40;

export const Route = createFileRoute("/encyclopedie/baies/$baieId/")({
  validateSearch: encyclopediaSearchSchema,
  staticData: { itemsColumn: "baies", detail: true },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, params, deps }) => {
    const scope = { locale: "fr" as const, generationId: deps.gen };
    const [detail] = await Promise.all([
      context.queryClient.ensureQueryData(
        berryDetailOptions({ identifier: params.baieId, ...scope }),
      ),
      context.queryClient.ensureQueryData(berryListOptions(scope)),
    ]);
    if (!detail) throw notFound();
    return { name: detail.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} · Baies · Pokedata` : "Baie · Pokedata" }],
  }),
  component: Page,
});

function Page() {
  const { baieId } = Route.useParams();
  const { gen } = Route.useSearch();
  const { data } = useSuspenseQuery(
    berryDetailOptions({ identifier: baieId, locale: "fr", generationId: gen }),
  );
  if (!data) return null;

  const naturalGiftType = data.naturalGiftType?.identifier;
  const potency = new Map(data.flavors.map((entry) => [entry.flavor, entry.potency]));

  return (
    <PageContainer className="max-w-4xl">
      <div className="flex items-end gap-5">
        <div className="grid size-24 shrink-0 place-items-center rounded-xl bg-muted">
          <ItemSprite identifier={data.identifier} className="size-16" />
        </div>
        <PageHeader>
          <PageEyebrow>baie ( n° {data.id} )</PageEyebrow>
          <PageTitle>{data.name}</PageTitle>
        </PageHeader>
      </div>

      <Section id="description">
        <SectionHeader>
          <SectionTitle>Description</SectionTitle>
        </SectionHeader>
        <SectionContent>
          {data.description ? (
            <p className="font-heading text-lg/relaxed">{data.description}</p>
          ) : (
            <SectionEmpty>Aucune description française jusqu’à la génération {gen}.</SectionEmpty>
          )}
        </SectionContent>
      </Section>

      <div className="grid items-start gap-6 @2xl:grid-cols-2">
        <Section id="culture">
          <SectionHeader>
            <SectionTitle>Culture</SectionTitle>
            <SectionDescription>
              Valeurs des jeux de la quatrième génération, où les baies se plantent.
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <FactList className="@lg:grid-cols-2">
              <Fact label="Fermeté">{formatFirmness(data.firmness)}</Fact>
              <Fact label="Taille">{formatValue(data.size ? data.size / 10 : null, " cm")}</Fact>
              <Fact label="Croissance">
                {data.growthTime ? `${data.growthTime * 4} h (4 stades)` : "—"}
              </Fact>
              <Fact label="Récolte maximale">{formatValue(data.maxHarvest)}</Fact>
              <Fact label="Assèchement du sol">{formatValue(data.soilDryness)}</Fact>
              <Fact label="Douceur">{formatValue(data.smoothness)}</Fact>
            </FactList>
          </SectionContent>
        </Section>

        <Section id="saveurs">
          <SectionHeader>
            <SectionTitle>Saveurs</SectionTitle>
            <SectionDescription>
              Intensité de chaque saveur, utilisée pour les Poffins et Pokébloc.
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <dl className="flex flex-col gap-3">
              {FLAVORS.map(([flavor, label]) => {
                const value = potency.get(flavor) ?? 0;
                return (
                  <div
                    key={flavor}
                    className="grid grid-cols-[minmax(0,5rem)_3ch_minmax(0,1fr)] items-center gap-3"
                  >
                    <dt className="label-mono text-muted-foreground">{label}</dt>
                    <dd className="text-right font-dot text-base font-black tabular-nums">
                      {value}
                    </dd>
                    <dd aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full w-(--flavor-width) rounded-full bg-primary"
                        style={
                          {
                            "--flavor-width": `${Math.min((value / MAX_POTENCY) * 100, 100)}%`,
                          } as CSSProperties
                        }
                      />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </SectionContent>
        </Section>
      </div>

      <Section id="don-naturel">
        <SectionHeader>
          <SectionTitle>Don Naturel</SectionTitle>
          <SectionDescription>
            Type et puissance de l’attaque Don Naturel quand le Pokémon tient cette baie.
          </SectionDescription>
        </SectionHeader>
        <SectionContent>
          <FactList className="grid-flow-col justify-start">
            <Fact label="Type">
              {naturalGiftType ? (
                <span className="flex items-center gap-2">
                  <TypeBadgeLink
                    identifier={naturalGiftType}
                    label={data.naturalGiftType?.name ?? undefined}
                  />
                  {data.naturalGiftType?.name}
                </span>
              ) : (
                "—"
              )}
            </Fact>
            <Fact label="Puissance">{formatValue(data.naturalGiftPower)}</Fact>
          </FactList>
        </SectionContent>
      </Section>
    </PageContainer>
  );
}
