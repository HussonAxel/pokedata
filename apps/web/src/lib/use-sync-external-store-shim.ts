/**
 * Remplace `use-sync-external-store/shim` (importé par Base UI) par le hook
 * natif de React 19. Le shim est un module CommonJS : une fois inliné dans le
 * bundle serveur, il chargeait `react` depuis `node_modules` au lieu de la
 * copie embarquée, et le rendu SSR s'exécutait avec deux instances de React
 * (« Cannot read properties of null (reading 'useSyncExternalStore') »).
 */
export { useSyncExternalStore } from "react";
