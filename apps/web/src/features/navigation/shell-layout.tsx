import { createContext, use, useState, type ReactNode } from "react";

type ShellLayoutContextValue = {
  state: { navigationExpanded: boolean; listHidden: boolean };
  actions: { toggleNavigation: () => void; toggleList: () => void };
};

const ShellLayoutContext = createContext<ShellLayoutContextValue | null>(null);

/**
 * État d'affichage de la coquille, partagé entre le rail, les colonnes et la
 * barre d'outils d'une fiche. Seul ce fournisseur sait comment il est stocké.
 */
export function ShellLayoutProvider({ children }: { children: ReactNode }) {
  const [navigationExpanded, setNavigationExpanded] = useState(false);
  const [listHidden, setListHidden] = useState(false);

  return (
    <ShellLayoutContext
      value={{
        state: { navigationExpanded, listHidden },
        actions: {
          toggleNavigation: () => setNavigationExpanded((value) => !value),
          toggleList: () => setListHidden((value) => !value),
        },
      }}
    >
      {children}
    </ShellLayoutContext>
  );
}

export function useShellLayout() {
  const context = use(ShellLayoutContext);
  if (!context) throw new Error("useShellLayout s'utilise sous un <ShellLayoutProvider>.");
  return context;
}
