import { Link } from "@tanstack/react-router";
import { ShieldIcon, SwordsIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { TypeBadge } from "@/features/pokedex/type-badge";

type Matchup = { identifier: string; name: string; multiplier: number };

type Relation = { multiplier: number; symbol: string; label: string };

/**
 * Une ligne par multiplicateur possible, vide ou non : d'une fiche à l'autre,
 * la même grille se compare d'un coup d'œil.
 */
const DEFENSE: Relation[] = [
  { multiplier: 4, symbol: "×4", label: "Faiblesse" },
  { multiplier: 2, symbol: "×2", label: "Faiblesse" },
  { multiplier: 1, symbol: "×1", label: "Neutre" },
  { multiplier: 0.5, symbol: "×½", label: "Résistance" },
  { multiplier: 0.25, symbol: "×¼", label: "Résistance" },
  { multiplier: 0, symbol: "×0", label: "Immunité" },
];

/** Contre une cible de type unique, une attaque ne dépasse jamais ×2 ni ne descend à ×¼. */
const OFFENSE: Relation[] = [
  { multiplier: 2, symbol: "×2", label: "Très efficace" },
  { multiplier: 1, symbol: "×1", label: "Neutre" },
  { multiplier: 0.5, symbol: "×½", label: "Peu efficace" },
  { multiplier: 0, symbol: "×0", label: "Sans effet" },
];

/**
 * Les fonds de la table des types : le vert signe l'attaque efficace, le rouge
 * l'attaque freinée, le plein l'immunité. ×4 et ×¼ foncent la même teinte.
 */
const MULTIPLIER_CLASSES: Record<number, string> = {
  4: "bg-success/45 text-foreground",
  2: "bg-success/25 text-foreground",
  1: "bg-foreground/5 text-muted-foreground",
  0.5: "bg-destructive/25 text-foreground",
  0.25: "bg-destructive/45 text-foreground",
  0: "bg-foreground/80 text-background",
};

const typeList = new Intl.ListFormat("fr", { type: "disjunction" });

function TypeList({ entries }: { entries: Matchup[] }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {entries.map((entry) => (
        <li key={entry.identifier}>
          <TypeBadge identifier={entry.identifier} label={entry.name} />
        </li>
      ))}
    </ul>
  );
}

function RelationList({ relations, matchups }: { relations: Relation[]; matchups: Matchup[] }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
      {relations.map((relation) => {
        const entries = matchups.filter((entry) => entry.multiplier === relation.multiplier);
        return (
          <div
            key={relation.multiplier}
            className="col-span-full grid grid-cols-subgrid items-baseline border-b py-2 last:border-b-0"
          >
            {/* Largeur du plus long libellé (« Très efficace ») : les types ne
                sautent pas d'une colonne à l'autre en changeant d'onglet. */}
            <dt className="flex min-w-36 items-baseline gap-2">
              <span
                className={`inline-grid h-6 min-w-8 place-items-center px-1 font-mono text-xs font-semibold ${MULTIPLIER_CLASSES[relation.multiplier]}`}
              >
                {relation.symbol}
              </span>
              <span className="font-mono text-xs tracking-wider whitespace-nowrap text-muted-foreground uppercase">
                {relation.label}
              </span>
            </dt>
            <dd className="min-w-0">
              {entries.length === 0 ? (
                <span className="text-muted-foreground">Aucun</span>
              ) : relation.multiplier === 1 ? (
                // Le neutre est la règle : replié, il laisse lire les exceptions.
                <details className="group">
                  <summary className="cursor-pointer text-muted-foreground marker:text-muted-foreground group-open:mb-2">
                    {entries.length} {entries.length > 1 ? "types" : "type"}
                  </summary>
                  <TypeList entries={entries} />
                </details>
              ) : (
                <TypeList entries={entries} />
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function TypeRelations({
  types,
  defense,
  offense,
  gen,
}: {
  types: { name: string }[];
  defense: Matchup[];
  offense: Matchup[];
  gen: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="defense" variant="segment">
        {/* Sur le fond de la carte, la piste bg-card du segment disparaîtrait. */}
        <TabsList aria-label="Sens des relations" className="bg-muted">
          <TabsTrigger value="defense" className="gap-1.5">
            <ShieldIcon className="size-4" />
            En défense
          </TabsTrigger>
          <TabsTrigger value="offense" className="gap-1.5">
            <SwordsIcon className="size-4" />
            En attaque
          </TabsTrigger>
        </TabsList>
        <TabsContent value="defense">
          <p className="text-muted-foreground">Dégâts reçus selon le type de l’attaque adverse.</p>
          <RelationList relations={DEFENSE} matchups={defense} />
        </TabsContent>
        <TabsContent value="offense">
          <p className="text-muted-foreground">
            {types.length > 1 ? "Meilleur multiplicateur" : "Multiplicateur"} des attaques{" "}
            {typeList.format(types.map((entry) => entry.name))}, contre une cible d’un seul type.
          </p>
          <RelationList relations={OFFENSE} matchups={offense} />
        </TabsContent>
      </Tabs>
      <Link
        to="/encyclopedie/types"
        search={{ gen }}
        className="self-start text-sm underline underline-offset-4"
      >
        Voir la table des types
      </Link>
    </div>
  );
}
