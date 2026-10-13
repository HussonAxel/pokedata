import type { InferRouterOutputs, RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";

import { pokedexRouter } from "./pokedex";
import { berriesRouter, itemsRouter } from "./items";
import { movesRouter } from "./moves";
import { talentsRouter } from "./talents";
import { typesRouter } from "./types";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  pokedex: pokedexRouter,
  talents: talentsRouter,
  moves: movesRouter,
  items: itemsRouter,
  berries: berriesRouter,
  types: typesRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
export type AppRouterOutputs = InferRouterOutputs<typeof appRouter>;
