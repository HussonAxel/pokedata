import { definePlugin as defineNitroPlugin } from "nitro";
import { auth } from "@pokedata/auth";
import type { RequestLogger } from "evlog";
import { createAuthIdentifier, type BetterAuthInstance } from "evlog/better-auth";

const identifyRequestUser = createAuthIdentifier(auth as BetterAuthInstance, {
  exclude: ["/api/auth/**"],
  maskEmail: true,
});

export default defineNitroPlugin((nitroApp) => {
  // Nitro v3 events expose the request URL, headers and context on `event.req`,
  // so adapt them to the shape evlog's auth identifier expects.
  nitroApp.hooks.hook("request", (event) => {
    const { pathname } = new URL(event.req.url);
    const context = (event.req.context ??= {}) as { log?: RequestLogger };

    return identifyRequestUser({
      path: pathname,
      headers: event.req.headers,
      context,
    });
  });
});
