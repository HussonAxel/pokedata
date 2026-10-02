import { Link } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";

import { PokemonPreviewCard } from "@/features/pokedex/pokemon-preview-card";
import { spriteUrl } from "@/features/pokedex/sprites";

export type EvolutionStage = {
  speciesId: number;
  pokemonId: number;
  identifier: string;
  name: string;
  evolvesFromSpeciesId: number | null;
  /** Ce qui mène à ce stade depuis le précédent, déjà formulé. */
  condition: string | null;
};

type EvolutionTreeProps = {
  stages: EvolutionStage[];
  currentPokemonId: number;
  gen: number;
};

/**
 * Lignée d'évolution tracée de gauche à droite quand la place le permet, et de
 * haut en bas sinon. Les branches (Évoli) partent du même stade.
 */
export function EvolutionTree({ stages, currentPokemonId, gen }: EvolutionTreeProps) {
  const speciesIds = new Set(stages.map((stage) => stage.speciesId));
  const roots = stages.filter(
    (stage) => stage.evolvesFromSpeciesId === null || !speciesIds.has(stage.evolvesFromSpeciesId),
  );

  return (
    <div className="@container overflow-x-auto">
      <div className="flex flex-col items-center gap-6 py-1 @3xl:flex-row @3xl:justify-center">
        {roots.map((root) => (
          <Branch
            key={root.pokemonId}
            stage={root}
            stages={stages}
            currentPokemonId={currentPokemonId}
            gen={gen}
          />
        ))}
      </div>
      {stages.length === 1 ? (
        <p className="pt-3 text-center text-sm text-muted-foreground">
          Ce Pokémon n’a pas d’évolution à cette génération.
        </p>
      ) : null}
    </div>
  );
}

function Branch({
  stage,
  stages,
  currentPokemonId,
  gen,
}: EvolutionTreeProps & { stage: EvolutionStage }) {
  const next = stages.filter((entry) => entry.evolvesFromSpeciesId === stage.speciesId);

  return (
    <div className="flex flex-col items-center gap-3 @3xl:flex-row">
      <StageCard stage={stage} current={stage.pokemonId === currentPokemonId} gen={gen} />
      {next.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {next.map((child) => (
            <li key={child.pokemonId} className="flex flex-col items-center gap-3 @3xl:flex-row">
              <Connector condition={child.condition} />
              <Branch stage={child} stages={stages} currentPokemonId={currentPokemonId} gen={gen} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Connector({ condition }: { condition: string | null }) {
  return (
    <div className="flex max-w-60 flex-col items-center gap-1 text-center text-xs text-muted-foreground @3xl:w-28">
      {condition ? <span>{condition}</span> : null}
      <ArrowDownIcon aria-hidden="true" className="size-4 @3xl:hidden" />
      <ArrowRightIcon aria-hidden="true" className="hidden size-4 @3xl:block" />
    </div>
  );
}

function StageCard({
  stage,
  current,
  gen,
}: {
  stage: EvolutionStage;
  current: boolean;
  gen: number;
}) {
  const link = (
    <Link
      to="/pokedex/$pokemonId"
      params={{ pokemonId: stage.identifier }}
      search={{ gen }}
      aria-current={current ? "page" : undefined}
      className="flex w-full max-w-60 flex-col items-center gap-1 rounded-lg border p-3 text-center hover:bg-muted aria-current:border-primary focus-visible:outline-2 focus-visible:outline-offset-4 @3xl:w-44"
    >
      <img
        src={spriteUrl(stage.pokemonId)}
        alt=""
        width={96}
        height={96}
        loading="lazy"
        decoding="async"
        className="size-24 object-contain"
      />
      <span className="text-sm text-muted-foreground">
        N° {String(stage.speciesId).padStart(4, "0")}
      </span>
      <span className="font-semibold text-balance">{stage.name}</span>
    </Link>
  );

  return current ? (
    link
  ) : (
    <PokemonPreviewCard identifier={stage.identifier} gen={gen}>
      {link}
    </PokemonPreviewCard>
  );
}
