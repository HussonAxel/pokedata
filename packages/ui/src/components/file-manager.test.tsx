import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { FileManager, type FileManagerNode } from "./file-manager";

const nodes: FileManagerNode[] = [
  {
    id: "folder-1",
    kind: "folder",
    name: "Équipes",
    parentId: null,
    createdAt: 1,
  },
  {
    id: "file-1",
    kind: "file",
    name: "Notes.txt",
    parentId: null,
    createdAt: 2,
    size: 12,
    mimeType: "text/plain",
    text: "bonjour",
  },
  {
    id: "file-2",
    kind: "file",
    name: "Équipe VGC.csv",
    parentId: "folder-1",
    createdAt: 3,
    size: 20,
    mimeType: "text/csv",
    starred: true,
    text: "a,b",
  },
];

afterEach(cleanup);

describe("FileManager", () => {
  it("n'affiche que le contenu du dossier courant", () => {
    render(<FileManager initialNodes={nodes} />);

    expect(screen.getByText("Équipes")).toBeTruthy();
    expect(screen.getByText("Notes.txt")).toBeTruthy();
    expect(screen.queryByText("Équipe VGC.csv")).toBeNull();
  });

  it("ouvre un dossier et met à jour le fil d'Ariane", () => {
    render(<FileManager initialNodes={nodes} />);

    fireEvent.click(screen.getByText("Équipes"));

    expect(screen.getByText("Équipe VGC.csv")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Chemin du dossier" }).textContent).toContain(
      "Équipes",
    );
  });

  it("recherche dans tout l'espace, pas seulement le dossier courant", async () => {
    render(<FileManager initialNodes={nodes} />);

    fireEvent.change(screen.getByLabelText("Rechercher des fichiers"), {
      target: { value: "vgc" },
    });

    expect(screen.getByText("Équipe VGC.csv")).toBeTruthy();
    // La sortie de liste est animée : l'élément quitte le DOM après la transition.
    await waitFor(() => expect(screen.queryByText("Notes.txt")).toBeNull());
  });

  it("filtre les favoris", async () => {
    render(<FileManager initialNodes={nodes} />);

    fireEvent.click(screen.getByRole("tab", { name: "Favoris" }));

    expect(screen.getByText("Équipe VGC.csv")).toBeTruthy();
    await waitFor(() => expect(screen.queryByText("Notes.txt")).toBeNull());
  });

  it("importe un fichier texte déposé et l'ajoute au dossier courant", async () => {
    const file = new File(["colonne,valeur"], "import.csv", { type: "text/csv" });
    render(<FileManager initialNodes={[]} />);

    const surface = document.querySelector('[data-slot="file-manager"]')!;
    fireEvent.drop(surface, { dataTransfer: { files: [file], types: ["Files"] } });

    await waitFor(() => expect(screen.getByText("import.csv")).toBeTruthy());
    expect(screen.getByText(/1 fichier/)).toBeTruthy();
  });

  it("bascule en vue liste", () => {
    render(<FileManager initialNodes={nodes} />);

    fireEvent.click(screen.getByLabelText("Vue liste"));

    expect(screen.getByLabelText("Ajouter Notes.txt aux favoris")).toBeTruthy();
  });
});
