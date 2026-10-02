import { describe, expect, it } from "vite-plus/test";

import { resolveEvolutionFamily, type FamilyCandidate } from "./evolution-family";

let nextId = 1;
const variety = (
  speciesId: number,
  speciesIdentifier: string,
  speciesGeneration: number,
  evolvesFromSpeciesId: number | null,
  form?: string,
): FamilyCandidate => ({
  speciesId,
  speciesIdentifier,
  speciesGeneration,
  evolvesFromSpeciesId,
  pokemonId: nextId++,
  identifier: form ? `${speciesIdentifier}-${form}` : speciesIdentifier,
  isDefault: !form,
});

const slowpoke = [
  variety(79, "slowpoke", 1, null),
  variety(79, "slowpoke", 1, null, "galar"),
  variety(80, "slowbro", 1, 79),
  variety(80, "slowbro", 1, 79, "mega"),
  variety(80, "slowbro", 1, 79, "galar"),
  variety(199, "slowking", 2, 79),
  variety(199, "slowking", 2, 79, "galar"),
];

const meowth = [
  variety(52, "meowth", 1, null),
  variety(52, "meowth", 1, null, "galar"),
  variety(53, "persian", 1, 52),
  variety(53, "persian", 1, 52, "alola"),
  variety(863, "perrserker", 8, 52),
];

const identifiers = (family: FamilyCandidate[]) => family.map((entry) => entry.identifier);

describe("resolveEvolutionFamily", () => {
  it("suit la forme de Galar à chaque stade quand elle existe", () => {
    const current = slowpoke[1]!;

    expect(identifiers(resolveEvolutionFamily(slowpoke, current))).toEqual([
      "slowpoke-galar",
      "slowbro-galar",
      "slowking-galar",
    ]);
  });

  it("garde les variétés par défaut depuis la forme par défaut", () => {
    const current = slowpoke[0]!;

    expect(identifiers(resolveEvolutionFamily(slowpoke, current))).toEqual([
      "slowpoke",
      "slowbro",
      "slowking",
    ]);
  });

  it("retombe sur la variété par défaut pour une forme sans équivalent", () => {
    const current = slowpoke[3]!;

    expect(identifiers(resolveEvolutionFamily(slowpoke, current))).toEqual([
      "slowpoke",
      "slowbro-mega",
      "slowking",
    ]);
  });

  it("remplace l'évolution ordinaire par l'évolution propre à la région", () => {
    expect(identifiers(resolveEvolutionFamily(meowth, meowth[1]!))).toEqual([
      "meowth-galar",
      "perrserker",
    ]);
    expect(identifiers(resolveEvolutionFamily(meowth, meowth[0]!))).toEqual(["meowth", "persian"]);
  });

  it("écarte l'évolution propre à une autre région", () => {
    const alola = variety(52, "meowth", 1, null, "alola");
    const family = [...meowth, alola];

    expect(identifiers(resolveEvolutionFamily(family, alola))).toEqual([
      "meowth-alola",
      "persian-alola",
    ]);
  });
});
