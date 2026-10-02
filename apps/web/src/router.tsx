import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { createQueryClient, orpc } from "./utils/orpc";

export const getRouter = () => {
  const queryClient = createQueryClient();

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    // Le contenu défile dans son propre panneau, pas dans la fenêtre.
    scrollToTopSelectors: ['[data-scroll-restoration-id="content"]'],
    // Le chargement d'une destination démarre au survol ou au début d'un appui,
    // avant le clic. Combiné au cache Query, la navigation paraît instantanée.
    defaultPreload: "intent",
    // Laisse TanStack Query arbitrer la fraîcheur : le routeur ne redemande
    // rien de son côté pendant un préchargement.
    defaultPreloadStaleTime: 0,
    context: { orpc, queryClient },
    defaultPendingComponent: () => <Loader />,
    defaultNotFoundComponent: () => <div>Not Found</div>,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  /** Ce qu'une route demande à la coquille de colonnes (voir `SiteShell`). */
  interface StaticDataRouteOption {
    /** Liste d'éléments à afficher en troisième colonne. */
    itemsColumn?: "pokemon";
    /** La route est le détail d'un élément de cette liste. */
    detail?: boolean;
  }
}
