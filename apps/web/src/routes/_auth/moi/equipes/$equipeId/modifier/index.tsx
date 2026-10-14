import type { AppRouterOutputs } from "@pokedata/api/routers/index";
import { Button } from "@pokedata/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pokedata/ui/components/dialog";
import { Field, FieldLabel } from "@pokedata/ui/components/field";
import { Input } from "@pokedata/ui/components/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@pokedata/ui/components/item";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CardGrid, CardGridItem } from "@/components/card-grid";
import { PageContainer } from "@/components/page-container";
import { PageEyebrow, PageHeader, PageTitle } from "@/components/page-header";
import { memberKey, teamOptions } from "@/features/member/queries";
import { formatVarietyName } from "@/features/pokedex/detail-format";
import { DexNumber } from "@/features/pokedex/dex-number";
import { PokemonSprite } from "@/features/pokedex/pokemon-sprite";
import { pokedexIndexOptions, pokedexTypeChartOptions } from "@/features/pokedex/queries";
import { TypeBadge } from "@/features/pokedex/type-badge";
import { PokemonPicker } from "@/features/team/pokemon-picker";
import { TeamAnalysis } from "@/features/team/team-analysis";
import { orpc } from "@/utils/orpc";
import { play } from "cuelume";

const TEAM_SIZE = 6;

export const Route = createFileRoute("/_auth/moi/equipes/$equipeId/modifier/")({
  loader: async ({ context, params }) => {
    const team = await context.queryClient
      .ensureQueryData(teamOptions(params.equipeId))
      .catch(() => null);
    if (!team) throw notFound();

    const scope = { locale: "fr" as const, generationId: team.generationId };
    await Promise.all([
      context.queryClient.ensureQueryData(pokedexIndexOptions(scope)),
      context.queryClient.ensureQueryData(pokedexTypeChartOptions(scope)),
    ]);
    return { name: team.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Équipe"} · Mes équipes · Pokedata` }],
  }),
  component: Page,
});

function Page() {
  const { equipeId } = Route.useParams();
  const { data: team } = useSuspenseQuery(teamOptions(equipeId));
  // Clé = équipe enregistrée : après enregistrement, l'éditeur repart des données serveur.
  return <TeamEditor key={`${team.id}-${team.members.map((m) => m.id).join(",")}`} team={team} />;
}

type Team = AppRouterOutputs["member"]["teams"]["get"];

function TeamEditor({ team }: { team: Team }) {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const scope = { locale: "fr" as const, generationId: team.generationId };
  const { data: index } = useSuspenseQuery(pokedexIndexOptions(scope));
  const { data: chart } = useSuspenseQuery(pokedexTypeChartOptions(scope));

  const [name, setName] = useState(team.name);
  const [pokemonIds, setPokemonIds] = useState(team.members.map((member) => member.id));

  // Les Pokémon de l'équipe, décrits par l'index de sa génération ; un membre
  // absent de cette génération garde les données enregistrées.
  const byId = useMemo(() => new Map(index.entries.map((entry) => [entry.id, entry])), [index]);
  const saved = useMemo(() => new Map(team.members.map((member) => [member.id, member])), [team]);
  const members = pokemonIds.map((id) => {
    const entry = byId.get(id);
    const fallback = saved.get(id);
    return {
      id,
      identifier: entry?.identifier ?? fallback?.identifier ?? String(id),
      name: entry?.name ?? (fallback ? formatVarietyName(fallback.name, fallback.formSuffix) : "?"),
      dexNumber: entry?.dexNumber ?? fallback?.dexNumber ?? 0,
      types: entry?.types ?? fallback?.types ?? [],
    };
  });

  const dirty =
    name.trim() !== team.name || pokemonIds.join(",") !== team.members.map((m) => m.id).join(",");

  const onSuccess = () => queryClient.invalidateQueries({ queryKey: memberKey });
  const save = useMutation(
    orpc.member.teams.update.mutationOptions({
      onSuccess: async () => {
        play("success");
        toast.success("Équipe enregistrée.");
        await onSuccess();
      },
      onError: () => {
        play("error");
        toast.error("L’équipe n’a pas pu être enregistrée.");
      },
    }),
  );
  const remove = useMutation(
    orpc.member.teams.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Équipe supprimée.");
        await onSuccess();
        await navigate({ to: "/moi/equipes" });
      },
    }),
  );

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader>
          <PageEyebrow>
            équipe ( génération {team.generationId} · {members.length}/{TEAM_SIZE} )
          </PageEyebrow>
          <PageTitle>{name.trim() || "Sans nom"}</PageTitle>
        </PageHeader>
        <div className="flex flex-wrap gap-2">
          <DeleteTeamButton onConfirm={() => remove.mutate({ id: team.id })} />
          <Button
            disabled={!dirty || !name.trim() || save.isPending}
            onClick={() =>
              save.mutate({
                id: team.id,
                name: name.trim(),
                generationId: team.generationId,
                pokemonIds,
              })
            }
          >
            <SaveIcon data-icon="inline-start" />
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>

      <Field className="max-w-sm">
        <FieldLabel htmlFor="team-name">Nom de l’équipe</FieldLabel>
        <Input
          id="team-name"
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <CardGrid>
        {members.map((member, slot) => (
          <CardGridItem key={`${member.id}-${slot}`}>
            <Item variant="outline" className="h-full flex-nowrap">
              <ItemMedia>
                <PokemonSprite pokemonId={member.id} />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemDescription>
                  <DexNumber value={member.dexNumber} />
                </ItemDescription>
                <ItemTitle>{member.name}</ItemTitle>
                <span className="flex gap-1">
                  {member.types.map((identifier) => (
                    <TypeBadge key={identifier} identifier={identifier} />
                  ))}
                </span>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Retirer ${member.name} de l’équipe`}
                  data-cuelume-close=""
                  onClick={() =>
                    setPokemonIds((current) => current.filter((_, index) => index !== slot))
                  }
                >
                  <XIcon />
                </Button>
              </ItemActions>
            </Item>
          </CardGridItem>
        ))}
        {members.length < TEAM_SIZE ? (
          <CardGridItem className="grid min-h-24 place-items-center rounded-lg border border-dashed">
            <PokemonPicker
              entries={index.entries}
              onPick={(entry) =>
                setPokemonIds((current) =>
                  current.length < TEAM_SIZE ? [...current, entry.id] : current,
                )
              }
            />
          </CardGridItem>
        ) : null}
      </CardGrid>

      <TeamAnalysis chart={chart} members={members} />
    </PageContainer>
  );
}

function DeleteTeamButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon data-icon="inline-start" />
        Supprimer
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer cette équipe ?</DialogTitle>
          <DialogDescription>
            L’équipe et sa composition seront définitivement effacées.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          {/* Action destructive : le seul son « fort » du site. */}
          <Button
            variant="destructive"
            data-cuelume-close=""
            data-cuelume-emphasis="strong"
            onClick={onConfirm}
          >
            Supprimer l’équipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
