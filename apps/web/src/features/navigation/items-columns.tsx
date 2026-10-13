import type { ComponentType } from "react";

import { BerryColumn, ItemColumn, MoveColumn, TalentColumn } from "@/features/encyclopedia/columns";
import { PokemonColumn } from "@/features/pokedex/pokemon-column";

type ItemsColumnProps = { mobile: boolean; className?: string; onSelect?: () => void };

/**
 * Troisième colonne d'une page : la liste d'éléments dont chaque ligne ouvre un
 * détail. Une route la réclame via `staticData.itemsColumn`.
 */
export const ITEMS_COLUMNS = {
  pokemon: { Column: PokemonColumn, label: "Pokédex national", pickLabel: "Changer de Pokémon" },
  talents: { Column: TalentColumn, label: "Talents", pickLabel: "Changer de talent" },
  attaques: { Column: MoveColumn, label: "Attaques", pickLabel: "Changer d’attaque" },
  objets: { Column: ItemColumn, label: "Objets", pickLabel: "Changer d’objet" },
  baies: { Column: BerryColumn, label: "Baies", pickLabel: "Changer de baie" },
} satisfies Record<
  string,
  { Column: ComponentType<ItemsColumnProps>; label: string; pickLabel: string }
>;

export type ItemsColumnId = keyof typeof ITEMS_COLUMNS;
