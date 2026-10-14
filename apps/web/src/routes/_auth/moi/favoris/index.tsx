import { Button } from "@pokedata/ui/components/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { CardGrid, CardGridItem } from "@/components/card-grid";
import { ListPlaceholder } from "@/components/list-placeholder";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import { favoritesOptions } from "@/features/member/queries";
import { formatVarietyName } from "@/features/pokedex/detail-format";
import { PokemonLinkCard } from "@/features/pokedex/pokemon-link-card";
import { LATEST_GENERATION } from "@/features/pokedex/search";

export const Route = createFileRoute("/_auth/moi/favoris/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(favoritesOptions());
  },
  head: () => ({ meta: [{ title: "Mes favoris · Pokedata" }] }),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(favoritesOptions());

  if (!data.length) {
    return (
      <ListPlaceholder title="Mes favoris">
        Aucun favori pour l’instant. Depuis la fiche d’un Pokémon, ajoutez-le à vos favoris.{" "}
        <Link to="/pokedex">Ouvrir le Pokédex</Link>
      </ListPlaceholder>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader>
          <PageEyebrow>favoris ( {data.length} )</PageEyebrow>
          <PageTitle>Mes favoris</PageTitle>
        </PageHeader>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/pokedex" />}>
          Ouvrir le Pokédex
        </Button>
      </div>
      <CardGrid>
        {data.map((entry) => (
          <CardGridItem key={entry.id}>
            <PokemonLinkCard
              pokemonId={entry.id}
              identifier={entry.identifier}
              dexNumber={entry.dexNumber}
              name={formatVarietyName(entry.name, entry.formSuffix)}
              gen={LATEST_GENERATION}
            />
          </CardGridItem>
        ))}
      </CardGrid>
    </PageContainer>
  );
}
