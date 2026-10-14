import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageMeta, PageTitle } from "@/components/page-header";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { progressionOptions } from "@/features/member/queries";

const percent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

export const Route = createFileRoute("/_auth/moi/progression/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(progressionOptions());
  },
  head: () => ({ meta: [{ title: "Ma progression · Pokedata" }] }),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(progressionOptions());
  const total = data.reduce((sum, row) => sum + row.total, 0);
  const caught = data.reduce((sum, row) => sum + row.caught, 0);

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader>
        <PageEyebrow>progression ( pokédex national )</PageEyebrow>
        <PageTitle>
          <span className="font-dot font-black tabular-nums">{caught}</span> / {total}
        </PageTitle>
        <PageMeta>{percent.format(total ? caught / total : 0)} des espèces capturées</PageMeta>
      </PageHeader>

      <Section id="generations">
        <SectionHeader>
          <SectionTitle>Par génération d’apparition</SectionTitle>
          <SectionDescription>
            Marquez un Pokémon comme capturé depuis sa fiche, dans le{" "}
            <Link to="/pokedex" className="underline underline-offset-4">
              Pokédex
            </Link>
            .
          </SectionDescription>
        </SectionHeader>
        <SectionContent>
          <dl className="flex flex-col gap-3">
            {data.map((row) => (
              <div
                key={row.generationId}
                className="grid grid-cols-[minmax(0,8rem)_7ch_minmax(0,1fr)] items-center gap-3"
              >
                <dt className="label-mono text-muted-foreground">Génération {row.generationId}</dt>
                <dd className="text-right font-dot text-base font-black tabular-nums">
                  {row.caught}/{row.total}
                </dd>
                <dd aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full w-(--progress) rounded-full bg-primary"
                    style={
                      {
                        "--progress": `${row.total ? (row.caught / row.total) * 100 : 0}%`,
                      } as CSSProperties
                    }
                  />
                </dd>
              </div>
            ))}
          </dl>
        </SectionContent>
      </Section>
    </PageContainer>
  );
}
