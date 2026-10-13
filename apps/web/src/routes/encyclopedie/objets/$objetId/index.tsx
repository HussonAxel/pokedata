import { Button } from "@pokedata/ui/components/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { Fact, FactList } from "@/components/fact-list";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import {
  Section,
  SectionContent,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { ItemSprite } from "@/features/encyclopedia/item-sprite";
import { itemDetailOptions, itemListOptions } from "@/features/encyclopedia/queries";
import { encyclopediaSearchSchema } from "@/features/encyclopedia/search";

export const Route = createFileRoute("/encyclopedie/objets/$objetId/")({
  validateSearch: encyclopediaSearchSchema,
  staticData: { itemsColumn: "objets", detail: true },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, params, deps }) => {
    const scope = { locale: "fr" as const, generationId: deps.gen };
    const [detail] = await Promise.all([
      context.queryClient.ensureQueryData(
        itemDetailOptions({ identifier: params.objetId, ...scope }),
      ),
      context.queryClient.ensureQueryData(itemListOptions(scope)),
    ]);
    if (!detail) throw notFound();
    return { name: detail.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} · Objets · Pokedata` : "Objet · Pokedata" }],
  }),
  component: Page,
});

function Page() {
  const { objetId } = Route.useParams();
  const { gen } = Route.useSearch();
  const { data } = useSuspenseQuery(
    itemDetailOptions({ identifier: objetId, locale: "fr", generationId: gen }),
  );
  if (!data) return null;

  return (
    <PageContainer className="max-w-4xl">
      <div className="flex items-end gap-5">
        <div className="grid size-24 shrink-0 place-items-center rounded-xl bg-muted">
          <ItemSprite identifier={data.identifier} className="size-16" />
        </div>
        <PageHeader>
          <PageEyebrow>objet ( {data.category ?? "sans catégorie"} )</PageEyebrow>
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

      <Section id="informations">
        <SectionHeader>
          <SectionTitle>Informations</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <div className="flex flex-col gap-5">
            <FactList className="grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
              <Fact label="Catégorie">{data.category ?? "Non renseignée"}</Fact>
              <Fact label="Prix en boutique">
                {data.cost ? `${data.cost.toLocaleString("fr-FR")} ₽` : "Non vendu"}
              </Fact>
            </FactList>
            {data.isBerry ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                className="self-start"
                render={
                  <Link
                    to="/encyclopedie/baies/$baieId"
                    params={{ baieId: data.identifier }}
                    search={{ gen }}
                  />
                }
              >
                Voir la fiche de la baie
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : null}
          </div>
        </SectionContent>
      </Section>
    </PageContainer>
  );
}
