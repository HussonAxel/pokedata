import { auth } from "@pokedata/auth";
import { db } from "@pokedata/db";

export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return {
    db,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
