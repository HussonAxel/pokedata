import { Toaster } from "@pokedata/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createMiddleware } from "@tanstack/react-start";
import { evlogErrorHandler } from "evlog/nitro/v3";
import { ThemeProvider } from "next-themes";
import { AnimateView } from "motion/react-animate-view";
import { useReducedMotion } from "motion/react";

import FloatingDockMenu from "@pokedata/ui/components/ui/FloatingDockMenu";

import type { orpc } from "@/utils/orpc";

import Header from "../components/header";

import appCss from "../index.css?url";
export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  server: {
    middleware: [createMiddleware().server(evlogErrorHandler)],
  },

  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Pokedata",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="" enableSystem>
          <div className="grid min-h-svh grid-rows-[auto_1fr]">
            <Header />
            {prefersReducedMotion ? (
              <Outlet />
            ) : (
              <AnimateView transition={{ duration: 0.2, ease: "easeInOut" }}>
                <Outlet />
              </AnimateView>
            )}
            <FloatingDockMenu />
          </div>
          <Toaster richColors />
          {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
          {import.meta.env.DEV && (
            <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
          )}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
