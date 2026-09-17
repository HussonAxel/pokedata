import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    jsPlugins: ["@shadcn/lint"],
    ignorePatterns: [
      "node_modules/**",
      "**/node_modules/**",
      "apps/web/dist/**",
      "apps/web/.vinxi/**",
      "apps/web/.tanstack/**",
      "apps/web/src/routeTree.gen.ts",
      "packages/db/dist/**",
      // SQL et snapshots produits par drizzle-kit : artefacts générés.
      "packages/db/src/migrations/**",
    ],
    options: {
      typeAware: false,
      typeCheck: false,
    },
    rules: {
      "shadcn/no-restyle": ["error", { allow: ["layout"] }],
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": ["error", { allow: ["layout"] }],
      "shadcn/no-inline-styles": "error",
      "shadcn/require-static-classes": "error",
      "shadcn/no-unknown-classes": [
        "error",
        {
          allow: [
            "cn-menu-target",
            "cn-menu-translucent",
            "cn-rtl-flip",
            "cn-font-heading",
            "cn-message-scroller",
            "cn-message-scroller-viewport",
            "cn-message-scroller-content",
            "cn-message-scroller-item",
            "cn-message-scroller-button",
            "toaster",
          ],
        },
      ],
    },
    overrides: [
      {
        files: ["packages/ui/src/components/**"],
        rules: {
          "shadcn/no-restyle": "off",
          "shadcn/no-arbitrary-values": "off",
          "shadcn/require-static-classes": "off",
        },
      },
    ],
  },
  fmt: {
    ignorePatterns: [
      "node_modules/**",
      "**/node_modules/**",
      "apps/web/dist/**",
      "apps/web/.vinxi/**",
      "apps/web/.tanstack/**",
      "apps/web/src/routeTree.gen.ts",
      "packages/db/dist/**",
      // SQL et snapshots produits par drizzle-kit : artefacts générés.
      "packages/db/src/migrations/**",
    ],
    singleQuote: false,
    semi: true,
    sortPackageJson: true,
  },
  staged: {
    "*.{js,ts,jsx,tsx,vue,svelte,json,jsonc,css,md}": "vp check --fix",
  },
});
