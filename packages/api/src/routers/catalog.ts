import { ability, berry, item, move, pokemonType, type } from "@pokedata/db/schema/catalog";
import { and, count, eq, lte } from "drizzle-orm";

import { scopeInput } from "../catalog-input";
import { publicProcedure } from "../index";

/** Taille du catalogue à une génération : les chiffres de l'accueil. */
const stats = publicProcedure.input(scopeInput).handler(async ({ context, input }) => {
  const [[pokemon], [abilities], [moves], [items], [berries], [types]] = await Promise.all([
    context.db
      .select({ value: count() })
      .from(pokemonType)
      .where(and(eq(pokemonType.generationId, input.generationId), eq(pokemonType.slot, 1))),
    context.db
      .select({ value: count() })
      .from(ability)
      .where(lte(ability.generationId, input.generationId)),
    context.db
      .select({ value: count() })
      .from(move)
      .where(lte(move.generationId, input.generationId)),
    context.db.select({ value: count() }).from(item),
    context.db.select({ value: count() }).from(berry),
    context.db
      .select({ value: count() })
      .from(type)
      .where(lte(type.generationId, input.generationId)),
  ]);

  return {
    generationId: input.generationId,
    pokemon: pokemon?.value ?? 0,
    abilities: abilities?.value ?? 0,
    moves: moves?.value ?? 0,
    items: items?.value ?? 0,
    berries: berries?.value ?? 0,
    types: types?.value ?? 0,
  };
});

export const catalogRouter = { stats };
