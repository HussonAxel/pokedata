import { Badge } from "@pokedata/ui/components/badge";
import { Button } from "@pokedata/ui/components/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@pokedata/ui/components/item";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import type { ReactElement } from "react";

import { CardGrid, CardGridItem } from "@/components/card-grid";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import { catalogStatsOptions } from "@/features/encyclopedia/queries";
import { sections } from "@/features/navigation/pages";

const SCOPE = { locale: "fr", generationId: 9 } as const;

/** Sections du site qui n'ont encore que des pages prévues. */
const PLANNED_SECTIONS = sections.filter((section) => section.path !== "/explorer");

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(catalogStatsOptions(SCOPE));
  },
  head: () => ({
    meta: [
      { title: "Pokedata · Explorez l’univers Pokémon" },
      {
        name: "description",
        content:
          "Pokédex, talents, attaques, objets, baies et table des types, génération par génération.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: stats } = useSuspenseQuery(catalogStatsOptions(SCOPE));

  return (
    <PageContainer className="gap-10">
      <div className="flex max-w-3xl flex-col items-start gap-6">
        <PageHeader>
          <PageEyebrow>pokedata ( génération {stats.generationId} )</PageEyebrow>
          <PageTitle>Le catalogue Pokémon, mesuré et numéroté.</PageTitle>
          <p className="max-w-xl text-muted-foreground">
            Fiches, statistiques, talents, attaques et relations de types, consultables pour chaque
            génération. Du premier Pokémon à votre prochaine équipe.
          </p>
        </PageHeader>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" nativeButton={false} render={<Link to="/pokedex" />}>
            Ouvrir le Pokédex
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link to="/recherche" />}
          >
            <SearchIcon data-icon="inline-start" />
            Rechercher
          </Button>
        </div>
      </div>

      <section aria-labelledby="catalogue-title" className="flex flex-col gap-4">
        <h2 id="catalogue-title" className="label-mono text-muted-foreground">
          Le catalogue
        </h2>
        <CardGrid>
          <StatTile
            value={stats.pokemon}
            label="variétés de Pokémon"
            link={<Link to="/pokedex" />}
          />
          <StatTile
            value={stats.moves}
            label="attaques"
            link={<Link to="/encyclopedie/attaques" />}
          />
          <StatTile
            value={stats.abilities}
            label="talents"
            link={<Link to="/encyclopedie/talents" />}
          />
          <StatTile value={stats.items} label="objets" link={<Link to="/encyclopedie/objets" />} />
          <StatTile value={stats.berries} label="baies" link={<Link to="/encyclopedie/baies" />} />
          <StatTile value={stats.types} label="types" link={<Link to="/encyclopedie/types" />} />
        </CardGrid>
      </section>

      <section aria-labelledby="bientot-title" className="flex flex-col gap-4">
        <h2 id="bientot-title" className="label-mono text-muted-foreground">
          En préparation
        </h2>
        <CardGrid>
          {PLANNED_SECTIONS.map((section) => (
            <CardGridItem key={section.path}>
              <Item
                variant="outline"
                className="h-full"
                render={<Link to={section.path} preload={false} />}
              >
                <ItemContent>
                  <ItemTitle>{section.title}</ItemTitle>
                  <ItemDescription>{section.description}</ItemDescription>
                </ItemContent>
                <Badge variant="outline">Prévu</Badge>
              </Item>
            </CardGridItem>
          ))}
        </CardGrid>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          className="self-start"
          render={<Link to="/plan-du-site" />}
        >
          Voir le plan du site
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </section>
    </PageContainer>
  );
}

/** Un chiffre du catalogue en dot-matrix, qui mène à sa liste. */
function StatTile({ value, label, link }: { value: number; label: string; link: ReactElement }) {
  return (
    <CardGridItem>
      <Item variant="outline" className="h-full" render={link}>
        <ItemContent>
          <span className="font-dot text-4xl font-black tabular-nums">
            {value.toLocaleString("fr-FR")}
          </span>
          <ItemDescription>{label}</ItemDescription>
        </ItemContent>
        <ArrowRightIcon aria-hidden="true" className="size-4 text-muted-foreground" />
      </Item>
    </CardGridItem>
  );
}
