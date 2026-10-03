import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, CompassIcon, LibraryIcon, SwordsIcon } from "lucide-react";

import { Button } from "@pokedata/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@pokedata/ui/components/card";
import { Separator } from "@pokedata/ui/components/separator";
import { sections } from "@/features/navigation/pages";

const featuredSections = [
  {
    path: "/explorer",
    title: "Explorer",
    description: "Découvrez les Pokémon, leurs évolutions et les relations entre les types.",
    icon: CompassIcon,
  },
  {
    path: "/strategie",
    title: "Stratégie",
    description:
      "Un espace prévu pour les formats de combat, les équipes et l’analyse compétitive.",
    icon: SwordsIcon,
  },
  {
    path: "/collection",
    title: "Collection",
    description: "Un espace prévu pour réunir vos Pokémon, vos cartes et suivre votre collection.",
    icon: LibraryIcon,
  },
] as const;

const otherSections = sections.filter(
  (section) => !featuredSections.some((featured) => featured.path === section.path),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pokedata · Explorez l’univers Pokémon" },
      {
        name: "description",
        content:
          "Explorez le Pokédex et la table des types de Pokedata. Découvrez les espaces consacrés à la stratégie et à la collection Pokémon.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main id="contenu" className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 md:px-8">
      <div className="flex max-w-2xl flex-col items-start gap-5">
        <p className="text-sm font-medium text-muted-foreground">
          Explorer. Comprendre. Collectionner.
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">
          Votre compagnon pour explorer l’univers Pokémon.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Du premier Pokémon à votre prochaine équipe, Pokedata rassemble les connaissances pour
          accompagner votre aventure.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" nativeButton={false} render={<Link to="/pokedex" />}>
            Explorer le Pokédex
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link to="/encyclopedie/types" />}
          >
            Consulter la table des types
          </Button>
        </div>
      </div>

      <section aria-labelledby="univers-title" className="flex flex-col gap-4">
        <h2 id="univers-title" className="text-xl font-semibold tracking-tight">
          À chaque passion, son univers
        </h2>
        <ul className="grid gap-4 @2xl:grid-cols-3">
          {featuredSections.map(({ path, title, description, icon: Icon }) => (
            <li key={path}>
              <Link
                to={path}
                preload={false}
                className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <Card className="h-full">
                  <CardHeader>
                    <Icon aria-hidden="true" className="mb-3 size-6 text-muted-foreground" />
                    <CardTitle>
                      <h3>{title}</h3>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto justify-between">
                    <span>
                      Découvrir{" "}
                      {title === "Collection"
                        ? "la collection"
                        : title === "Stratégie"
                          ? "la stratégie"
                          : "l’exploration"}
                    </span>
                    <ArrowRightIcon aria-hidden="true" className="size-4" />
                  </CardFooter>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section aria-labelledby="avancement-title" className="flex flex-col gap-5">
        <div className="flex flex-col items-start gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Projet en cours de développement
          </p>
          <h2 id="avancement-title" className="text-xl font-semibold tracking-tight">
            Pokedata prend forme
          </h2>
          <p className="text-sm text-muted-foreground">
            Les premiers outils sont en place. Les autres espaces s’enrichiront progressivement.
          </p>
        </div>
        <dl className="grid gap-5 @xl:grid-cols-2">
          <div className="flex flex-col gap-2">
            <dt className="text-sm font-medium">À explorer dès maintenant</dt>
            <dd className="text-sm text-muted-foreground">
              Le Pokédex, les fiches Pokémon et la table des types par génération.
            </dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-sm font-medium">Les espaces prévus</dt>
            <dd className="text-sm text-muted-foreground">
              Stratégie, suivi de collection, mini-jeux, communauté et outils pour votre aventure.
            </dd>
          </div>
        </dl>
      </section>

      <footer className="flex flex-col gap-3 pb-2">
        <nav aria-label="Autres univers de Pokedata" className="flex flex-wrap gap-x-5 gap-y-2">
          {otherSections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              preload={false}
              className="py-2 text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {section.title}
            </Link>
          ))}
        </nav>
        <Link
          to="/plan-du-site"
          className="w-fit py-2 text-xs text-muted-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Voir le plan du site
        </Link>
      </footer>
    </main>
  );
}
