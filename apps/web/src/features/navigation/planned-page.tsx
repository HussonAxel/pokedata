import { Alert, AlertDescription } from "@pokedata/ui/components/alert";
import { Badge } from "@pokedata/ui/components/badge";
import { Button } from "@pokedata/ui/components/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@pokedata/ui/components/item";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRightIcon, ConstructionIcon } from "lucide-react";

import { Fact, FactList } from "@/components/fact-list";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import { exampleParams, pages, sections, type PageDefinition } from "./pages";

export function PlannedPage({ path }: { path: PageDefinition["path"] }) {
  const params = useParams({ strict: false });
  const page = pages.find((entry) => entry.path === path)!;
  const isMap = path === "/plan-du-site";
  const isHome = path === "/";
  const children = pages.filter((entry) => {
    if (entry.path === path) return false;
    if (isMap) return true;
    if (isHome) return sections.some((section) => section.path === entry.path);
    return entry.section === page.section;
  });
  const groups = [...new Set(children.map((entry) => entry.section))];

  return (
    <main
      id="contenu"
      className="@container mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 @2xl:px-8"
    >
      <div className="flex max-w-2xl flex-col gap-5">
        <PageHeader>
          <PageEyebrow>pokedata ( {page.section} )</PageEyebrow>
          <PageTitle>{page.title}</PageTitle>
          <p className="text-muted-foreground">{page.description}</p>
        </PageHeader>
        <Alert>
          <ConstructionIcon />
          <AlertDescription>
            Aperçu du projet : cette page est prévue, son contenu sera ajouté progressivement.
            {path.includes("$") && " Les liens utilisent des exemples, sans données réelles."}
          </AlertDescription>
        </Alert>
        {Object.keys(params).length > 0 && (
          <FactList className="grid-flow-col justify-start">
            {Object.entries(params).map(([key, value]) => (
              <Fact key={key} label={key}>
                {value}
              </Fact>
            ))}
          </FactList>
        )}
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          className="self-start"
          render={<Link to="/plan-du-site" />}
        >
          Voir toutes les pages prévues
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
      {groups.map((section) => (
        <section key={section} aria-label={section} className="flex flex-col gap-4">
          <h2 className="label-mono text-muted-foreground">
            {isHome ? `Découvrir : ${section}` : section}
          </h2>
          <ul className="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-3">
            {children
              .filter((entry) => entry.section === section)
              .map((entry) => (
                <li key={entry.path}>
                  <Item
                    variant="outline"
                    className="h-full"
                    render={
                      <Link
                        to={entry.path}
                        params={{ ...exampleParams, ...params }}
                        preload={false}
                      />
                    }
                  >
                    <ItemContent>
                      <ItemTitle>{entry.title}</ItemTitle>
                      <ItemDescription>{entry.description}</ItemDescription>
                      {entry.path.startsWith("/moi") && (
                        <Badge variant="outline">Connexion requise</Badge>
                      )}
                    </ItemContent>
                    <ArrowRightIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                  </Item>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
