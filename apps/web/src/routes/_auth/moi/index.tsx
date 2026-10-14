import { Badge } from "@pokedata/ui/components/badge";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@pokedata/ui/components/item";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { CardGrid, CardGridItem } from "@/components/card-grid";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import { StatTile } from "@/components/stat-tile";
import { memberSummaryOptions } from "@/features/member/queries";
import { pages } from "@/features/navigation/pages";

/** Pages de l'espace qui ne sont pas encore construites. */
const READY = new Set(["/moi", "/moi/equipes", "/moi/favoris", "/moi/progression"]);
const PLANNED = pages.filter(
  (page) => page.section === "Mon espace" && !READY.has(page.path) && !page.path.includes("$"),
);

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export const Route = createFileRoute("/_auth/moi/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(memberSummaryOptions());
  },
  head: () => ({ meta: [{ title: "Mon espace · Pokedata" }] }),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(memberSummaryOptions());

  return (
    <PageContainer className="gap-10">
      <PageHeader>
        <PageEyebrow>
          mon espace ( membre depuis {memberSince.format(new Date(data.memberSince))} )
        </PageEyebrow>
        <PageTitle>Bonjour, {data.name}</PageTitle>
        <p className="text-muted-foreground">{data.email}</p>
      </PageHeader>

      <section aria-labelledby="resume-title" className="flex flex-col gap-4">
        <h2 id="resume-title" className="label-mono text-muted-foreground">
          Votre aventure
        </h2>
        <CardGrid>
          <CardGridItem>
            <StatTile value={data.teams} label="équipes" link={<Link to="/moi/equipes" />} />
          </CardGridItem>
          <CardGridItem>
            <StatTile value={data.favorites} label="favoris" link={<Link to="/moi/favoris" />} />
          </CardGridItem>
          <CardGridItem>
            <StatTile
              value={data.caught}
              label="Pokémon capturés"
              link={<Link to="/moi/progression" />}
            />
          </CardGridItem>
        </CardGrid>
      </section>

      <section aria-labelledby="bientot-title" className="flex flex-col gap-4">
        <h2 id="bientot-title" className="label-mono text-muted-foreground">
          Bientôt dans votre espace
        </h2>
        <CardGrid>
          {PLANNED.map((page) => (
            <CardGridItem key={page.path}>
              <Item variant="outline" className="h-full" render={<Link to={page.path} />}>
                <ItemContent>
                  <ItemTitle>{page.title}</ItemTitle>
                  <ItemDescription>{page.description}</ItemDescription>
                </ItemContent>
                <Badge variant="outline">Prévu</Badge>
              </Item>
            </CardGridItem>
          ))}
        </CardGrid>
      </section>
    </PageContainer>
  );
}
