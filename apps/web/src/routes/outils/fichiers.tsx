import { FileManager, type FileManagerNode } from "@pokedata/ui/components/file-manager";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/outils/fichiers")({
  head: () => ({ meta: [{ title: "Gestionnaire de fichiers · Pokedata" }] }),
  component: Page,
});

/** Contenu de démonstration : l'espace vit ensuite dans la session du navigateur. */
const DEMO_NODES: FileManagerNode[] = [
  {
    id: "demo-folder-equipes",
    kind: "folder",
    name: "Équipes",
    parentId: null,
    createdAt: Date.parse("2026-09-01T09:00:00Z"),
  },
  {
    id: "demo-folder-notes",
    kind: "folder",
    name: "Notes de ligue",
    parentId: null,
    createdAt: Date.parse("2026-09-02T09:00:00Z"),
  },
  {
    id: "demo-folder-captures",
    kind: "folder",
    name: "Captures",
    parentId: null,
    createdAt: Date.parse("2026-09-03T09:00:00Z"),
  },
  {
    id: "demo-file-team",
    kind: "file",
    name: "Équipe VGC.csv",
    parentId: "demo-folder-equipes",
    createdAt: Date.parse("2026-09-04T09:00:00Z"),
    size: 142,
    mimeType: "text/csv",
    text: "Pokemon,Objet,Nature,Talent\nFlutter Mane,Choice Specs,Timid,Protosynthesis\nUrshifu,Focus Sash,Jolly,Unseen Fist\nRillaboom,Assault Vest,Adamant,Grassy Surge\n",
  },
  {
    id: "demo-file-notes",
    kind: "file",
    name: "Notes de match.txt",
    parentId: null,
    createdAt: Date.parse("2026-09-05T09:00:00Z"),
    size: 214,
    mimeType: "text/plain",
    starred: true,
    text: "Tour 1 : protéger et lire le Terrain Herbu.\nTour 2 : forcer le switch avec Poing Invisible.\n\nÀ revoir\n- Gestion du Zénith Éclatant\n- Vitesse sous Distorsion",
  },
  {
    id: "demo-file-brief",
    kind: "file",
    name: "Stratégie.md",
    parentId: null,
    createdAt: Date.parse("2026-09-06T09:00:00Z"),
    size: 248,
    mimeType: "text/markdown",
    text: "# Plan de saison\n\n## Objectifs\n- Stabiliser le noyau offensif\n- Trouver une réponse à l'eau\n- Tester une variante lente\n\n## Prochaines étapes\nRejouer les matchs perdus et noter les ouvertures.",
  },
];

function Page() {
  return (
    <main id="contenu" className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8">
      <FileManager
        initialNodes={DEMO_NODES}
        eyebrow="Pokedata / Outils"
        title="Gestionnaire de fichiers"
        description="Rangez vos exports d'équipes, notes de ligue et captures au même endroit."
      />
    </main>
  );
}
