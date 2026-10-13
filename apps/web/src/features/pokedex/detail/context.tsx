import type { AppRouterOutputs } from "@pokedata/api/routers/index";
import { createContext, use, type ReactNode } from "react";

export type PokemonDetail = NonNullable<AppRouterOutputs["pokedex"]["detail"]>;

type PokemonDetailContextValue = { pokemon: PokemonDetail; gen: number };

const PokemonDetailContext = createContext<PokemonDetailContextValue | null>(null);

/**
 * Fiche ouverte et génération consultée, partagées par toutes les sections :
 * chacune lit ce dont elle a besoin au lieu de tout recevoir en props.
 */
export function PokemonDetailProvider({
  pokemon,
  gen,
  children,
}: PokemonDetailContextValue & { children: ReactNode }) {
  return <PokemonDetailContext value={{ pokemon, gen }}>{children}</PokemonDetailContext>;
}

export function usePokemonDetail() {
  const context = use(PokemonDetailContext);
  if (!context) throw new Error("usePokemonDetail s'utilise sous un <PokemonDetailProvider>.");
  return context;
}
