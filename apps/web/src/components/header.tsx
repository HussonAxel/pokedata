import { Link } from "@tanstack/react-router";
import { sections } from "@/features/navigation/pages";

export default function Header() {
  return (
    <header className="border-b px-5 py-4 md:px-8">
      <a href="#contenu" className="sr-only focus:not-sr-only">
        Aller au contenu
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Pokedata
        </Link>
        <div className="flex gap-5 text-sm">
          <Link to="/recherche" className="py-2 hover:underline">
            Rechercher
          </Link>
          <Link to="/login" className="py-2 hover:underline">
            Connexion
          </Link>
        </div>
      </div>
      <nav
        aria-label="Navigation principale"
        className="mx-auto mt-3 flex max-w-6xl flex-wrap gap-2"
      >
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            preload={false}
            className="rounded-md px-3 py-2 text-sm hover:bg-muted"
            activeProps={{ className: "bg-muted font-semibold", "aria-current": "page" }}
          >
            {section.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}
