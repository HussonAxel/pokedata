import { expect, it } from "vite-plus/test";

import { normalizeSearch } from "./search";

it("ignores case, accents and surrounding spaces", () => {
  expect(normalizeSearch("  Électrik ")).toBe("electrik");
  expect(normalizeSearch("Œil Composé")).toBe("oeil compose");
});
