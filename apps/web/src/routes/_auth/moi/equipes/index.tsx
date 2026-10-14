import { Button } from "@pokedata/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@pokedata/ui/components/field";
import { Input } from "@pokedata/ui/components/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@pokedata/ui/components/item";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CardGrid, CardGridItem } from "@/components/card-grid";
import { GenerationSelect } from "@/components/generation-select";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { memberKey, teamsOptions } from "@/features/member/queries";
import { LATEST_GENERATION } from "@/features/pokedex/search";
import { spriteUrl } from "@/features/pokedex/sprites";
import { orpc } from "@/utils/orpc";

const GENERATIONS = Array.from({ length: LATEST_GENERATION }, (_, index) => index + 1);
const updatedAt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export const Route = createFileRoute("/_auth/moi/equipes/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(teamsOptions());
  },
  head: () => ({ meta: [{ title: "Mes équipes · Pokedata" }] }),
  component: Page,
});

function Page() {
  const { data: teams } = useSuspenseQuery(teamsOptions());

  return (
    <PageContainer>
      <PageHeader>
        <PageEyebrow>équipes ( {teams.length} )</PageEyebrow>
        <PageTitle>Mes équipes</PageTitle>
      </PageHeader>

      <NewTeamForm />

      {teams.length ? (
        <CardGrid>
          {teams.map((team) => (
            <CardGridItem key={team.id}>
              <Item
                variant="outline"
                className="h-full"
                render={
                  <Link to="/moi/equipes/$equipeId/modifier" params={{ equipeId: team.id }} />
                }
              >
                <ItemContent className="min-w-0">
                  <ItemTitle>{team.name}</ItemTitle>
                  <ItemDescription>
                    Génération {team.generationId} · {team.pokemonIds.length}/6 · modifiée le{" "}
                    {updatedAt.format(new Date(team.updatedAt))}
                  </ItemDescription>
                  <span className="flex min-h-10 gap-1">
                    {team.pokemonIds.map((pokemonId, index) => (
                      <img
                        key={`${pokemonId}-${index}`}
                        src={spriteUrl(pokemonId)}
                        alt=""
                        width={40}
                        height={40}
                        loading="lazy"
                        className="size-10 object-contain"
                      />
                    ))}
                  </span>
                </ItemContent>
              </Item>
            </CardGridItem>
          ))}
        </CardGrid>
      ) : null}
    </PageContainer>
  );
}

function NewTeamForm() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [generationId, setGenerationId] = useState(LATEST_GENERATION);
  const create = useMutation(
    orpc.member.teams.create.mutationOptions({
      onSuccess: async ({ id }) => {
        await queryClient.invalidateQueries({ queryKey: memberKey });
        await navigate({ to: "/moi/equipes/$equipeId/modifier", params: { equipeId: id } });
      },
      onError: () => toast.error("L’équipe n’a pas pu être créée."),
    }),
  );

  return (
    <Section id="nouvelle-equipe">
      <SectionHeader>
        <SectionTitle>Nouvelle équipe</SectionTitle>
        <SectionDescription>
          Les types et les faiblesses suivent la génération choisie.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) create.mutate({ name: name.trim(), generationId });
          }}
        >
          <FieldGroup className="@lg:flex-row @lg:items-end">
            <Field>
              <FieldLabel htmlFor="team-name">Nom de l’équipe</FieldLabel>
              <Input
                id="team-name"
                required
                maxLength={60}
                value={name}
                placeholder="Équipe pluie, Ligue Paldea…"
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <GenerationSelect
              label="Génération"
              value={generationId}
              generations={GENERATIONS}
              onValueChange={setGenerationId}
            />
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              <PlusIcon data-icon="inline-start" />
              Créer
            </Button>
          </FieldGroup>
        </form>
      </SectionContent>
    </Section>
  );
}
