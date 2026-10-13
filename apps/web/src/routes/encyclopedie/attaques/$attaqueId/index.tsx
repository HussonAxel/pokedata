import { Badge } from "@pokedata/ui/components/badge";
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

import { Fact, FactList } from "@/components/fact-list";
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
import { moveDetailOptions, moveListOptions } from "@/features/encyclopedia/queries";
import { encyclopediaSearchSchema } from "@/features/encyclopedia/search";
import { formatMoveMethod, formatVarietyName } from "@/features/pokedex/detail-format";
import { DexNumber } from "@/features/pokedex/dex-number";
import { spriteUrl } from "@/features/pokedex/sprites";
import { TypeBadgeLink } from "@/features/pokedex/type-badge";

export const Route = createFileRoute("/encyclopedie/attaques/$attaqueId/")({
  validateSearch: encyclopediaSearchSchema,
  staticData: { itemsColumn: "attaques", detail: true },
  loaderDeps: ({ search }) => ({ gen: search.gen }),
  loader: async ({ context, params, deps }) => {
    const scope = { locale: "fr" as const, generationId: deps.gen };
    const [detail] = await Promise.all([
      context.queryClient.ensureQueryData(
        moveDetailOptions({ identifier: params.attaqueId, ...scope }),
      ),
      context.queryClient.ensureQueryData(moveListOptions(scope)),
    ]);
    if (!detail) throw notFound();
    return { name: detail.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} · Attaques · Pokedata` : "Attaque · Pokedata" },
    ],
  }),
  component: Page,
});

function Page() {
  const { attaqueId } = Route.useParams();
  const { gen } = Route.useSearch();
  const { data } = useSuspenseQuery(
    moveDetailOptions({ identifier: attaqueId, locale: "fr", generationId: gen }),
  );
  if (!data) return null;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader>
        <PageEyebrow>attaque ( génération {gen} )</PageEyebrow>
        <PageTitle>{data.name}</PageTitle>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <TypeBadgeLink identifier={data.type.identifier} label={data.type.name} />
          <Badge variant="outline">{formatDamageClass(data.damageClass)}</Badge>
        </div>
        <PageMeta>Apparue en génération {data.introducedIn}</PageMeta>
      </PageHeader>

      <Section id="caracteristiques">
        <SectionHeader>
          <SectionTitle>Caractéristiques</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <div className="flex flex-col gap-5">
            {data.description ? (
              <p className="font-heading text-lg/relaxed">{data.description}</p>
            ) : null}
            <FactList className="grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]">
              <Fact label="Type">{data.type.name}</Fact>
              <Fact label="Catégorie">{formatDamageClass(data.damageClass)}</Fact>
              <Fact label="Puissance">{formatValue(data.power)}</Fact>
              <Fact label="Précision">{formatValue(data.accuracy, " %")}</Fact>
              <Fact label="PP">{formatValue(data.pp)}</Fact>
              <Fact label="Priorité">
                {data.priority ? (data.priority > 0 ? `+${data.priority}` : data.priority) : "0"}
              </Fact>
              {data.effectChance ? <Fact label="Chance d’effet">{data.effectChance} %</Fact> : null}
            </FactList>
          </div>
        </SectionContent>
      </Section>

      <Section id="apprentissage">
        <SectionHeader>
          <SectionTitle>Pokémon qui l’apprennent</SectionTitle>
          <SectionDescription>
            {data.learners.length} Pokémon dans les jeux de la génération {gen}. Le niveau indiqué
            est le plus bas niveau d’apprentissage par montée de niveau.
          </SectionDescription>
        </SectionHeader>
        <SectionContent>
          {data.learners.length ? (
            <Table className="min-w-[32rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Pokémon</TableHead>
                  <TableHead>Méthodes</TableHead>
                  <TableHead className="text-right">Niveau</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.learners.map((learner) => (
                  <TableRow key={learner.id}>
                    <TableCell variant="label">
                      <Link
                        to="/pokedex/$pokemonId"
                        params={{ pokemonId: learner.identifier }}
                        search={{ gen }}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <img
                          src={spriteUrl(learner.id)}
                          alt=""
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          className="size-10 object-contain"
                        />
                        <DexNumber value={learner.dexNumber} className="text-muted-foreground" />
                        {formatVarietyName(learner.name, learner.formSuffix)}
                      </Link>
                    </TableCell>
                    <TableCell variant="muted">
                      {learner.methods.map(formatMoveMethod).join(" · ")}
                    </TableCell>
                    <TableCell variant="numeric">{formatValue(learner.level)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <SectionEmpty>Aucun Pokémon n’apprend cette attaque en génération {gen}.</SectionEmpty>
          )}
        </SectionContent>
      </Section>
    </PageContainer>
  );
}
