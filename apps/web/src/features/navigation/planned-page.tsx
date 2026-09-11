import { Link, useParams } from "@tanstack/react-router";
import { exampleParams, pages, sections, type PageDefinition } from "./pages";

export function PlannedPage({ path }: { path: PageDefinition["path"] }) {
  const params = useParams({ strict: false });
  const page = pages.find((entry) => entry.path === path)!;
  const isMap = path === "/plan-du-site";
  const isHome = path === "/";
  const children = pages.filter((entry) => {
    if (entry.path === path) return false;
    if (isMap) return true;
    if (isHome) return sections.some((section) => section.path === entry.path);
    return entry.section === page.section;
  });
  const groups = [...new Set(children.map((entry) => entry.section))];
  return (
    <main id="contenu" className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8">
      <div className="mb-10 max-w-2xl space-y-4">
        <p className="text-sm text-muted-foreground">Pokedata / {page.section}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{page.title}</h1>
        <p className="text-muted-foreground">{page.description}</p>
        <p className="rounded-lg bg-muted p-4 text-sm">
          Aperçu du projet : cette page est prévue, son contenu sera ajouté progressivement.
          {path.includes("$") && " Les liens utilisent des exemples, sans données réelles."}
        </p>
        {Object.keys(params).length > 0 && (
          <dl className="flex flex-wrap gap-4 text-sm">
            {Object.entries(params).map(([key, value]) => (
              <div key={key}>
                <dt className="text-muted-foreground">{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <Link to="/plan-du-site" className="inline-block py-2 underline underline-offset-4">
          Voir toutes les pages prévues
        </Link>
      </div>
      <div className="space-y-10">
        {groups.map((section) => (
          <section key={section} aria-label={section}>
            <h2 className="mb-4 text-xl font-semibold">
              {isHome ? `Découvrir : ${section}` : section}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {children
                .filter((entry) => entry.section === section)
                .map((entry) => (
                  <li key={entry.path}>
                    <Link
                      to={entry.path}
                      params={{ ...exampleParams, ...params }}
                      preload={false}
                      className="flex h-full flex-col gap-2 rounded-xl border p-5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      <span className="font-medium">
                        {entry.title} <span aria-hidden="true">→</span>
                      </span>
                      <span className="text-sm text-muted-foreground">{entry.description}</span>
                      {entry.path.startsWith("/moi") && (
                        <span className="text-xs text-muted-foreground">Connexion requise</span>
                      )}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
