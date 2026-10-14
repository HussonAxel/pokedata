import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

/** `/` ou `Ctrl`/`⌘` + `K` ouvrent la recherche, sauf pendant une saisie. */
export function useSearchShortcut() {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      const shortcut =
        (event.key === "/" && !typing) ||
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey));
      if (!shortcut) return;
      event.preventDefault();
      void navigate({ to: "/recherche" });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);
}
