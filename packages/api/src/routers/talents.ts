import { ability, abilityName } from "@pokedata/db/schema/catalog";
import { and, eq, lte } from "drizzle-orm";
import { z } from "zod";

import { abilityDescription } from "../ability-description";
import { publicProcedure } from "../index";
import { LATEST_GENERATION } from "./pokedex";

const detail = publicProcedure
  .input(
    z.object({
      identifier: z.string().min(1).max(80),
      locale: z.enum(["fr", "en"]).default("fr"),
      generationId: z.number().int().min(1).max(LATEST_GENERATION).default(LATEST_GENERATION),
    }),
  )
  .handler(async ({ context, input }) => {
    const [entry] = await context.db
      .select({
        id: ability.id,
        identifier: ability.identifier,
        name: abilityName.name,
        introducedIn: ability.generationId,
        description: abilityDescription(input.locale, input.generationId),
      })
      .from(ability)
      .innerJoin(
        abilityName,
        and(eq(abilityName.abilityId, ability.id), eq(abilityName.language, input.locale)),
      )
      .where(
        and(
          eq(ability.identifier, input.identifier),
          lte(ability.generationId, input.generationId),
        ),
      )
      .limit(1);

    return entry ?? null;
  });

export const talentsRouter = { detail };
