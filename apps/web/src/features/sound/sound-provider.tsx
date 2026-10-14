import { bind, setEnabled, unlock } from "cuelume";
import { createContext, use, useEffect, useState, type ReactNode } from "react";

/** Préférence du visiteur ; cuelume ne la conserve pas lui-même. */
const STORAGE_KEY = "pokedata:sons";

type SoundContextValue = {
  state: { enabled: boolean };
  actions: { toggle: () => void };
};

const SoundContext = createContext<SoundContextValue | null>(null);

/**
 * Sons d'interface (cuelume). Les éléments marqués `data-cuelume-*` sont reliés
 * une fois pour tout le document ; le visiteur peut couper le son, et ce choix
 * est retenu. Les navigateurs bloquent l'audio avant la première interaction :
 * rien ne sonne au chargement.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  // La préférence n'existe que dans le navigateur : lue après l'hydratation.
  useEffect(() => {
    setEnabledState(localStorage.getItem(STORAGE_KEY) !== "off");
  }, []);

  useEffect(() => {
    setEnabled(enabled);
  }, [enabled]);

  // `bind()` renvoie sa propre fonction de nettoyage.
  useEffect(() => bind(), []);

  const toggle = () => {
    const next = !enabled;
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    setEnabledState(next);
    // Le clic qui réactive le son est le geste qui autorise l'audio.
    if (next) void unlock();
  };

  return (
    <SoundContext value={{ state: { enabled }, actions: { toggle } }}>{children}</SoundContext>
  );
}

export function useSound() {
  const context = use(SoundContext);
  if (!context) throw new Error("useSound s'utilise sous un <SoundProvider>.");
  return context;
}
