import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pokedata/ui/components/table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

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
import { formatDamageClass, formatValue } from "@/features/encyclopedia/format";
import { typeDetailOptions } from "@/features/encyclopedia/queries";
import { formatVarietyName } from "@/features/pokedex/detail-format";
import { PokemonLinkCard } from "@/features/pokedex/pokemon-link-card";
import { LATEST_GENERATION } from "@/features/pokedex/search";
import { TypeBadge, typeTint } from "@/features/pokedex/type-badge";
import { TypeRelations } from "@/features/pokedex/type-relations";
import { ItemDescription } from "@pokedata/ui/components/item";
import { cn } from "@pokedata/ui/lib/utils";

export const Route = createFileRoute("/encyclopedie/types/$typeId/")({
  validateSearch: z.object({
    gen: z.coerce.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION),
  }),
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, params, deps }) => {
    const detail = await context.queryClient.ensureQueryData(
      typeDetailOptions({ identifier: params.typeId, locale: "fr", generationId: deps.gen }),
    );
    if (!detail) throw notFound();
    return { name: detail.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} · Types · Pokedata` : "Type · Pokedata" }],
  }),
  component: Page,
});

function Page() {
  const { typeId } = Route.useParams();
  const { gen } = Route.useSearch();
  const { data } = useSuspenseQuery(
    typeDetailOptions({ identifier: typeId, locale: "fr", generationId: gen }),
  );
  if (!data) return null;

  const pure = data.pokemon.filter((entry) => entry.slot === 1).length;

  return (
    <PageContainer>
      <div className="flex items-end gap-5">
        <div
          className={cn(
            "grid size-24 shrink-0 place-items-center rounded-xl",
            typeTint(data.identifier),
          )}
        >
          <TypeBadge identifier={data.identifier} label={data.name} />
        </div>
        <PageHeader>
          <PageEyebrow>type ( génération {gen} )</PageEyebrow>
          <PageTitle>{data.name}</PageTitle>
          <PageMeta>Apparu en génération {data.introducedIn}</PageMeta>
        </PageHeader>
      </div>

      <Section id="relations">
        <SectionHeader>
          <SectionTitle>Relations de types</SectionTitle>
          <SectionDescription>
            Génération {gen} · Multiplicateurs d’efficacité du type {data.name}, seul.
          </SectionDescription>
        </SectionHeader>
        <SectionContent>
          <TypeRelations
            types={[{ name: data.name }]}
            defense={data.defense}
            offense={data.offense}
            gen={gen}
          />
        </SectionContent>
      </Section>

      <Section id="pokemon">
        <SectionHeader>
          <SectionTitle>Pokémon de type {data.name}</SectionTitle>
          <SectionDescription>
            {data.pokemon.length} variétés en génération {gen}, dont {pure} avec ce type en type
            principal.
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
                    <ItemDescription>
                      {entry.slot === 1 ? "Type principal" : "Type secondaire"}
                    </ItemDescription>
                  </PokemonLinkCard>
                </CardGridItem>
              ))}
            </CardGrid>
          ) : (
            <SectionEmpty>Aucun Pokémon de ce type en génération {gen}.</SectionEmpty>
          )}
        </SectionContent>
      </Section>

      <Section id="attaques">
        <SectionHeader>
          <SectionTitle>Attaques de type {data.name}</SectionTitle>
          <SectionDescription>
            {data.moves.length} attaques connues en génération {gen}.
          </SectionDescription>
        </SectionHeader>
        <SectionContent>
          {data.moves.length ? (
            <Table className="min-w-[32rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Attaque</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Puissance</TableHead>
                  <TableHead className="text-right">Précision</TableHead>
                  <TableHead className="text-right">PP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.moves.map((move) => (
                  <TableRow key={move.id}>
                    <TableCell variant="label">
                      <Link
                        to="/encyclopedie/attaques/$attaqueId"
                        params={{ attaqueId: move.identifier }}
                        search={{ gen }}
                        className="hover:underline"
                      >
                        {move.name}
                      </Link>
                    </TableCell>
                    <TableCell variant="muted">{formatDamageClass(move.damageClass)}</TableCell>
                    <TableCell variant="numeric">{formatValue(move.power)}</TableCell>
                    <TableCell variant="numeric">{formatValue(move.accuracy)}</TableCell>
                    <TableCell variant="numeric">{formatValue(move.pp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <SectionEmpty>Aucune attaque de ce type en génération {gen}.</SectionEmpty>
          )}
        </SectionContent>
      </Section>
    </PageContainer>
  );
}
