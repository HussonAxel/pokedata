import { FunnelIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@pokedata/ui/components/button";
import {
  LATEST_GENERATION,
  MAX_TYPES,
  parseTypes,
  toggleType,
  type PokedexSearch,
} from "@/features/pokedex/search";

type Reference = {
  types: { identifier: string; name: string }[];
  generations: { id: number }[];
};

type PokemonFiltersProps = {
  reference: Reference;
  type: string | undefined;
  gen: number;
  resultCount: number;
  /** Appelé avec `replace = false` quand le changement doit créer une entrée d'historique. */
  onChange: (patch: Partial<PokedexSearch>, replace?: boolean) => void;
  /** Le champ de recherche, placé à gauche du bouton. */
  children: React.ReactNode;
};

/** Recherche + bouton filtre : le panneau de pastilles se déplie sous la recherche. */
export function PokemonFilters({
  reference,
  type,
  gen,
  resultCount,
  onChange,
  children,
}: PokemonFiltersProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const selectedTypes = parseTypes(type);
  const activeCount = selectedTypes.length + (gen !== LATEST_GENERATION ? 1 : 0);

  return (
    <>
      <div className="flex items-center gap-2">
        {children}
        <Button
          type="button"
          variant={open || activeCount > 0 ? "secondary" : "outline"}
          size="icon-lg"
          aria-label={
            activeCount > 0
              ? `Filtres (${activeCount} actif${activeCount > 1 ? "s" : ""})`
              : "Filtres"
          }
          aria-expanded={open}
          aria-controls={panelId}
          className="relative"
          onClick={() => setOpen((value) => !value)}
        >
          <FunnelIcon aria-hidden="true" />
          {activeCount > 0 ? (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-xs leading-none font-semibold text-primary-foreground"
            >
              {activeCount}
            </span>
          ) : null}
        </Button>
      </div>

      {open ? (
        <div id={panelId} className="max-h-72 space-y-3 overflow-y-auto">
          <FilterSection label="Génération">
            {reference.generations.map((entry) => (
              <Chip
                key={entry.id}
                pressed={gen === entry.id}
                onClick={() => onChange({ gen: entry.id }, false)}
              >
                G{entry.id}
              </Chip>
            ))}
          </FilterSection>

          <FilterSection label={`Type (${MAX_TYPES} maximum)`}>
            <Chip pressed={!type} onClick={() => onChange({ type: undefined })}>
              Tous
            </Chip>
            {reference.types.map((entry) => (
              <Chip
                key={entry.identifier}
                pressed={selectedTypes.includes(entry.identifier)}
                onClick={() => onChange({ type: toggleType(type, entry.identifier) })}
              >
                <img
                  src={`/pokemon-types/${entry.identifier}.svg`}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 object-contain"
                />
                {entry.name}
              </Chip>
            ))}
          </FilterSection>

          {activeCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onChange({ type: undefined, gen: LATEST_GENERATION }, false)}
            >
              Réinitialiser les filtres
            </Button>
          ) : null}
        </div>
      ) : null}

      <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
        {resultCount} Pokémon trouvé{resultCount > 1 ? "s" : ""}
      </p>
    </>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="px-1 text-xs font-medium text-muted-foreground">{label}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </section>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? "default" : "outline"}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
