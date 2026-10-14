import { expect, it } from "vite-plus/test";

import { safeRedirect } from "./redirect";

it("keeps internal paths, query string included", () => {
  expect(safeRedirect("/moi/equipes?tri=recent")).toBe("/moi/equipes?tri=recent");
});

it("falls back to the member area for missing or external targets", () => {
  expect(safeRedirect(undefined)).toBe("/moi");
  expect(safeRedirect("https://example.com")).toBe("/moi");
  expect(safeRedirect("//example.com/moi")).toBe("/moi");
  expect(safeRedirect("javascript:alert(1)")).toBe("/moi");
});
