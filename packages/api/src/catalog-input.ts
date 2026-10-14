import { pokemon, species, speciesName } from "@pokedata/db/schema/catalog";
import { z } from "zod";

import { formSuffix } from "./evolution-family";

/**
 * Génération par défaut du catalogue. À dériver de `select max(id) from generation`
 * le jour où le sélecteur de version sera exposé dans l'interface.
 */
export const LATEST_GENERATION = 9;

/** Les talents cachés apparaissent en génération 5 (Noir et Blanc). */
export const HIDDEN_ABILITY_GENERATION = 5;

export const locale = z.enum(["fr", "en"]).default("fr");
export const generationId = z
  .number()
  .int()
  .min(1)
  .max(LATEST_GENERATION)
  .default(LATEST_GENERATION);

/** Entrée des listes du catalogue : langue et génération consultées. */
export const scopeInput = z.object({ locale, generationId });

/** Entrée des fiches : l'identifiant PokéAPI en plus de la portée. */
export const detailInput = scopeInput.extend({ identifier: z.string().min(1).max(80) });

/** Colonnes d'une variété affichée dans une liste de Pokémon (talent, type, attaque). */
export const pokemonEntryColumns = {
  id: pokemon.id,
  identifier: pokemon.identifier,
  isDefault: pokemon.isDefault,
  speciesIdentifier: species.identifier,
  dexNumber: species.id,
  name: speciesName.name,
};

/** Remplace les colonnes techniques d'une variété par son suffixe de forme. */
export function withFormSuffix<
  T extends { identifier: string; isDefault: boolean; speciesIdentifier: string },
>(rows: T[]) {
  return rows.map(({ isDefault, speciesIdentifier, ...row }) => ({
    ...row,
    formSuffix: formSuffix({ identifier: row.identifier, isDefault, speciesIdentifier }),
  }));
}
