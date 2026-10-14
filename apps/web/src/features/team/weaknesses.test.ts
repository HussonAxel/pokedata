import { expect, it } from "vite-plus/test";

import { analyzeTeam, threats } from "./weaknesses";

const chart = {
  types: [
    { id: 1, identifier: "fire", name: "Feu" },
    { id: 2, identifier: "water", name: "Eau" },
    { id: 3, identifier: "grass", name: "Plante" },
  ],
  // Lignes : attaque ; colonnes : défense.
  factors: [
    [50, 50, 200],
    [200, 50, 50],
    [50, 200, 50],
  ],
};

it("combines both types of a member", () => {
  const [fire] = analyzeTeam(chart, [{ types: ["grass", "grass"] }]);
  expect(fire?.multipliers).toEqual([4]);
});

it("counts weaknesses, resistances and flags shared threats", () => {
  const rows = analyzeTeam(chart, [
    { types: ["grass"] },
    { types: ["grass"] },
    { types: ["water"] },
  ]);
  const fire = rows.find((row) => row.identifier === "fire");
  expect(fire).toMatchObject({ weak: 2, resist: 1, immune: 0 });
  expect(threats(rows, 3).map((row) => row.identifier)).toEqual(["fire"]);
});
