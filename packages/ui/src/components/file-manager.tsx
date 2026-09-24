"use client";

import { Button } from "@pokedata/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pokedata/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@pokedata/ui/components/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@pokedata/ui/components/empty";
import { Input } from "@pokedata/ui/components/input";
import { cn } from "@pokedata/ui/lib/utils";
import {
  ArrowUpDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  HardDriveIcon,
  LayoutGridIcon,
  ListIcon,
  MoreVerticalIcon,
  PencilIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type FileManagerNodeBase = {
  id: string;
  name: string;
  /** `null` = racine de l'espace. */
  parentId: string | null;
  createdAt: number;
  starred?: boolean;
};

export type FileManagerFolder = FileManagerNodeBase & {
  kind: "folder";
};

export type FileManagerFile = FileManagerNodeBase & {
  kind: "file";
  size: number;
  mimeType: string;
  /** Aperçu textuel, pour les fichiers lisibles en texte. */
  text?: string;
  /** URL d'objet, pour les images importées. */
  url?: string;
};

export type FileManagerNode = FileManagerFolder | FileManagerFile;

export type FileManagerSort = "name-asc" | "name-desc" | "size-desc" | "recent";

type FileManagerView = "grid" | "list";

type FileManagerTab = "all" | "starred" | "recent";

export type FileManagerProps = {
  /** Contenu initial de l'espace (non contrôlé ensuite). */
  initialNodes?: FileManagerNode[];
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Mention affichée dans le pied de l'espace. */
  notice?: string;
  defaultView?: FileManagerView;
  defaultSort?: FileManagerSort;
  /** Appelé après chaque mutation (import, renommage, suppression…). */
  onNodesChange?: (nodes: FileManagerNode[]) => void;
  className?: string;
};

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const TEXT_EXTENSIONS = new Set([
  "csv",
  "json",
  "log",
  "md",
  "svg",
  "ts",
  "tsx",
  "txt",
  "yaml",
  "yml",
]);

const PREVIEW_LENGTH = 4000;

const SORT_LABELS: Record<FileManagerSort, string> = {
  "name-asc": "Nom : A à Z",
  "name-desc": "Nom : Z à A",
  "size-desc": "Taille : décroissante",
  recent: "Ajout : plus récent",
};

const TAB_LABELS: Record<FileManagerTab, string> = {
  all: "Tous les fichiers",
  starred: "Favoris",
  recent: "Récents",
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `node-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function extensionOf(name: string) {
  const index = name.lastIndexOf(".");
  return index > 0 ? name.slice(index + 1).toLowerCase() : "";
}

function isTextFile(file: File) {
  return file.type.startsWith("text/") || TEXT_EXTENSIONS.has(extensionOf(file.name));
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  const units = ["ko", "Mo", "Go"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unitIndex]}`;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(timestamp);
}

function isFolder(node: FileManagerNode): node is FileManagerFolder {
  return node.kind === "folder";
}

function isFile(node: FileManagerNode): node is FileManagerFile {
  return node.kind === "file";
}

/** Identifiants du dossier et de tout son contenu, en profondeur. */
function collectSubtree(nodes: FileManagerNode[], rootId: string) {
  const ids = new Set([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (node.parentId && ids.has(node.parentId) && !ids.has(node.id)) {
        ids.add(node.id);
        changed = true;
      }
    }
  }
  return ids;
}

function folderPath(nodes: FileManagerNode[], folderId: string | null) {
  const path: FileManagerFolder[] = [];
  let current = folderId;
  while (current) {
    const folder = nodes.find((node) => node.id === current && isFolder(node));
    if (!folder || !isFolder(folder)) break;
    path.unshift(folder);
    current = folder.parentId;
  }
  return path;
}

function countChildren(nodes: FileManagerNode[], folderId: string) {
  return nodes.filter((node) => node.parentId === folderId).length;
}

function sortNodes(nodes: FileManagerNode[], sort: FileManagerSort) {
  const sorted = [...nodes];
  sorted.sort((a, b) => {
    switch (sort) {
      case "name-desc":
        return b.name.localeCompare(a.name, "fr");
      case "size-desc":
        return (isFile(b) ? b.size : 0) - (isFile(a) ? a.size : 0);
      case "recent":
        return b.createdAt - a.createdAt;
      default:
        return a.name.localeCompare(b.name, "fr");
    }
  });
  return sorted;
}

async function readUpload(file: File, parentId: string | null): Promise<FileManagerFile> {
  const base: FileManagerFile = {
    id: createId(),
    kind: "file",
    name: file.name,
    parentId,
    createdAt: Date.now(),
    size: file.size,
    mimeType: file.type || "application/octet-stream",
  };

  if (file.type.startsWith("image/")) {
    return { ...base, url: URL.createObjectURL(file) };
  }
  if (isTextFile(file)) {
    const text = await file.text();
    return { ...base, text: text.slice(0, PREVIEW_LENGTH) };
  }
  return base;
}

function nodeIcon(node: FileManagerNode) {
  if (isFolder(node)) return FolderIcon;
  if (node.mimeType.startsWith("image/")) return FileImageIcon;
  if (node.text !== undefined) return FileTextIcon;
  return FileIcon;
}

/* -------------------------------------------------------------------------- */
/*                                 Composant                                  */
/* -------------------------------------------------------------------------- */

export function FileManager({
  initialNodes = [],
  eyebrow = "Votre espace, organisé",
  title = "Fichiers",
  description = "Un endroit pour le travail que vous voulez garder sous la main.",
  notice = "Les fichiers restent dans cette session du navigateur.",
  defaultView = "grid",
  defaultSort = "name-asc",
  onNodesChange,
  className,
}: FileManagerProps) {
  const [nodes, setNodes] = React.useState<FileManagerNode[]>(initialNodes);
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<FileManagerTab>("all");
  const [view, setView] = React.useState<FileManagerView>(defaultView);
  const [sort, setSort] = React.useState<FileManagerSort>(defaultSort);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [isDropping, setIsDropping] = React.useState(false);
  const [newFolderOpen, setNewFolderOpen] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [renameTarget, setRenameTarget] = React.useState<FileManagerNode | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [previewTarget, setPreviewTarget] = React.useState<FileManagerFile | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragDepth = React.useRef(0);
  const objectUrls = React.useRef(new Set<string>());
  const onNodesChangeRef = React.useRef(onNodesChange);
  onNodesChangeRef.current = onNodesChange;

  React.useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  const updateNodes = React.useCallback(
    (updater: (previous: FileManagerNode[]) => FileManagerNode[]) => {
      setNodes((previous) => {
        const next = updater(previous);
        onNodesChangeRef.current?.(next);
        return next;
      });
    },
    [],
  );

  const path = React.useMemo(() => folderPath(nodes, currentFolderId), [nodes, currentFolderId]);

  const visibleNodes = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    // Recherche et onglets filtrés parcourent tout l'espace, pas seulement le dossier courant.
    const scoped =
      search || tab !== "all" ? nodes : nodes.filter((node) => node.parentId === currentFolderId);
    const filtered = scoped.filter((node) => {
      if (tab === "starred" && !node.starred) return false;
      if (tab === "recent" && isFolder(node)) return false;
      if (search && !node.name.toLowerCase().includes(search)) return false;
      return true;
    });
    const sorted = sortNodes(filtered, tab === "recent" ? "recent" : sort);
    return {
      folders: sorted.filter(isFolder),
      files: sorted.filter(isFile),
    };
  }, [nodes, currentFolderId, query, sort, tab]);

  const totals = React.useMemo(() => {
    const files = nodes.filter(isFile);
    return {
      count: files.length,
      size: files.reduce((total, file) => total + file.size, 0),
    };
  }, [nodes]);

  const folderOptions = React.useMemo(() => nodes.filter(isFolder), [nodes]);

  const uploadFiles = React.useCallback(
    async (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      if (incoming.length === 0) return;
      const created = await Promise.all(incoming.map((file) => readUpload(file, currentFolderId)));
      for (const file of created) {
        if (file.url) objectUrls.current.add(file.url);
      }
      updateNodes((previous) => [...previous, ...created]);
      setStatus(
        created.length === 1
          ? `« ${created[0]?.name} » importé.`
          : `${created.length} fichiers importés.`,
      );
    },
    [currentFolderId, updateNodes],
  );

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDropping(false);
    if (event.dataTransfer.files.length > 0) {
      void uploadFiles(event.dataTransfer.files);
    }
  }

  function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes("Files")) return;
    dragDepth.current += 1;
    setIsDropping(true);
  }

  function handleDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDropping(false);
  }

  function openFolder(folder: FileManagerFolder) {
    setCurrentFolderId(folder.id);
    setTab("all");
    setQuery("");
  }

  function createFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    const folder: FileManagerFolder = {
      id: createId(),
      kind: "folder",
      name,
      parentId: currentFolderId,
      createdAt: Date.now(),
    };
    updateNodes((previous) => [...previous, folder]);
    setNewFolderName("");
    setNewFolderOpen(false);
    setStatus(`Dossier « ${name} » créé.`);
  }

  function toggleStar(node: FileManagerNode) {
    updateNodes((previous) =>
      previous.map((item) => (item.id === node.id ? { ...item, starred: !item.starred } : item)),
    );
    setStatus(
      node.starred
        ? `« ${node.name} » retiré des favoris.`
        : `« ${node.name} » ajouté aux favoris.`,
    );
  }

  function applyRename() {
    const name = renameValue.trim();
    if (!renameTarget || !name) return;
    updateNodes((previous) =>
      previous.map((item) => (item.id === renameTarget.id ? { ...item, name } : item)),
    );
    setStatus(`Renommé en « ${name} ».`);
    setRenameTarget(null);
  }

  function moveNode(node: FileManagerNode, parentId: string | null) {
    if (node.parentId === parentId) return;
    if (isFolder(node) && parentId && collectSubtree(nodes, node.id).has(parentId)) return;
    updateNodes((previous) =>
      previous.map((item) => (item.id === node.id ? { ...item, parentId } : item)),
    );
    const destination = parentId
      ? (nodes.find((item) => item.id === parentId)?.name ?? "un dossier")
      : "Mes fichiers";
    setStatus(`« ${node.name} » déplacé vers ${destination}.`);
  }

  function removeNode(node: FileManagerNode) {
    const ids = isFolder(node) ? collectSubtree(nodes, node.id) : new Set([node.id]);
    for (const item of nodes) {
      if (ids.has(item.id) && isFile(item) && item.url) {
        URL.revokeObjectURL(item.url);
        objectUrls.current.delete(item.url);
      }
    }
    updateNodes((previous) => previous.filter((item) => !ids.has(item.id)));
    if (currentFolderId && ids.has(currentFolderId)) setCurrentFolderId(node.parentId);
    if (previewTarget && ids.has(previewTarget.id)) setPreviewTarget(null);
    setStatus(`« ${node.name} » supprimé.`);
  }

  function downloadFile(file: FileManagerFile) {
    const href =
      file.url ??
      (file.text !== undefined
        ? URL.createObjectURL(new Blob([file.text], { type: file.mimeType }))
        : null);
    if (!href) {
      setStatus(`Aucun contenu disponible pour « ${file.name} ».`);
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = file.name;
    anchor.click();
    if (href !== file.url) URL.revokeObjectURL(href);
  }

  const isEmpty = visibleNodes.folders.length === 0 && visibleNodes.files.length === 0;

  function renderActions(node: FileManagerNode) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions pour ${node.name}`}
              className="shrink-0"
            >
              <MoreVerticalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          {isFolder(node) ? (
            <DropdownMenuItem onClick={() => openFolder(node)}>
              <FolderOpenIcon />
              Ouvrir
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setPreviewTarget(node)}>
              <FileTextIcon />
              Aperçu
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => toggleStar(node)}>
            <StarIcon />
            {node.starred ? "Retirer des favoris" : "Ajouter aux favoris"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setRenameTarget(node);
              setRenameValue(node.name);
            }}
          >
            <PencilIcon />
            Renommer
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderIcon />
              Déplacer vers
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuItem
                disabled={node.parentId === null}
                onClick={() => moveNode(node, null)}
              >
                Mes fichiers
              </DropdownMenuItem>
              {folderOptions
                .filter(
                  (folder) => !(isFolder(node) && collectSubtree(nodes, node.id).has(folder.id)),
                )
                .map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    disabled={node.parentId === folder.id}
                    onClick={() => moveNode(node, folder.id)}
                  >
                    {folder.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {isFile(node) ? (
            <DropdownMenuItem onClick={() => downloadFile(node)}>
              <DownloadIcon />
              Télécharger
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => removeNode(node)}>
            <Trash2Icon />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <section
      data-slot="file-manager"
      className={cn("w-full text-xs/relaxed text-foreground", className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{eyebrow}</p>
          <h2 className="cn-font-heading mt-2 text-2xl font-medium tracking-tight">{title}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={() => setNewFolderOpen(true)}>
            <FolderPlusIcon data-icon="inline-start" />
            Nouveau dossier
          </Button>
          <Button size="lg" onClick={() => inputRef.current?.click()}>
            <UploadIcon data-icon="inline-start" />
            Importer des fichiers
          </Button>
        </div>
      </header>

      <input
        ref={inputRef}
        type="file"
        multiple
        aria-label="Importer des fichiers"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) void uploadFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Vues des fichiers"
          className="flex items-center gap-1 border-b border-border"
        >
          {(Object.keys(TAB_LABELS) as FileManagerTab[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              tabIndex={tab === value ? 0 : -1}
              onClick={() => setTab(value)}
              className={cn(
                "relative -mb-px px-2.5 pt-1 pb-2 text-xs font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring",
                tab === value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {TAB_LABELS[value]}
              {tab === value ? (
                <motion.span
                  layoutId="file-manager-tab"
                  className="absolute inset-x-0 -bottom-px h-px bg-primary"
                />
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Rechercher des fichiers"
              placeholder="Rechercher…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-44 pr-7 pl-7"
            />
            {query ? (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
              >
                <XIcon className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex bg-muted/60 p-0.5">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Vue grille"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <LayoutGridIcon />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Vue liste"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <ListIcon />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Chemin du dossier" className="flex min-w-0 flex-wrap items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolderId(null)}
            className={cn(currentFolderId === null && "text-foreground")}
          >
            Mes fichiers
          </Button>
          {path.map((folder) => (
            <React.Fragment key={folder.id}>
              <ChevronRightIcon className="size-3.5 text-muted-foreground" />
              <Button variant="ghost" size="sm" onClick={() => setCurrentFolderId(folder.id)}>
                {folder.name}
              </Button>
            </React.Fragment>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="lg"
                aria-label="Trier les fichiers"
                className="min-w-44 justify-between"
              >
                <span className="truncate">{SORT_LABELS[tab === "recent" ? "recent" : sort]}</span>
                <ArrowUpDownIcon data-icon="inline-end" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(value) => setSort(value as FileManagerSort)}
            >
              {(Object.keys(SORT_LABELS) as FileManagerSort[]).map((value) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {SORT_LABELS[value]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={cn("relative mt-4 min-h-72 transition-colors", isDropping && "ring-1 ring-ring")}
      >
        <AnimatePresence>
          {isDropping ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/80 text-xs font-medium"
            >
              Déposez les fichiers pour les importer
            </motion.div>
          ) : null}
        </AnimatePresence>

        {isEmpty ? (
          <Empty className="border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderIcon />
              </EmptyMedia>
              <EmptyTitle>Rien à afficher</EmptyTitle>
              <EmptyDescription>
                {query
                  ? "Aucun élément ne correspond à cette recherche."
                  : "Importez des fichiers ou créez un dossier pour commencer."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : view === "grid" ? (
          <div className="space-y-6">
            {visibleNodes.folders.length > 0 ? (
              <section aria-label="Dossiers">
                <h3 className="mb-3 text-xs font-medium text-muted-foreground">Dossiers</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <AnimatePresence initial={false}>
                    {visibleNodes.folders.map((folder) => (
                      <GridCard key={folder.id} node={folder} actions={renderActions(folder)}>
                        <button
                          type="button"
                          onClick={() => openFolder(folder)}
                          className="block w-full min-w-0 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <span className="mb-3 flex size-9 items-center justify-center bg-muted">
                            <FolderIcon className="size-4" />
                          </span>
                          <div className="min-w-0 pr-7">
                            <p
                              title={folder.name}
                              className="cn-font-heading truncate text-sm font-medium"
                            >
                              {folder.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {countChildren(nodes, folder.id)} élément
                              {countChildren(nodes, folder.id) > 1 ? "s" : ""}
                            </p>
                          </div>
                        </button>
                      </GridCard>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ) : null}

            {visibleNodes.files.length > 0 ? (
              <section aria-label="Fichiers">
                <h3 className="mb-3 text-xs font-medium text-muted-foreground">Fichiers</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <AnimatePresence initial={false}>
                    {visibleNodes.files.map((file) => (
                      <GridCard key={file.id} node={file} actions={renderActions(file)}>
                        <button
                          type="button"
                          onClick={() => setPreviewTarget(file)}
                          className="block w-full min-w-0 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <FilePreview file={file} />
                          <div className="min-w-0 pr-7">
                            <p
                              title={file.name}
                              className="cn-font-heading truncate text-sm font-medium"
                            >
                              {file.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatBytes(file.size)}
                            </p>
                          </div>
                        </button>
                      </GridCard>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-border border border-border">
            <AnimatePresence initial={false}>
              {[...visibleNodes.folders, ...visibleNodes.files].map((node) => {
                const Icon = nodeIcon(node);
                return (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => (isFolder(node) ? openFolder(node) : setPreviewTarget(node))}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center bg-muted">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">{node.name}</span>
                      <span className="hidden w-20 shrink-0 text-right text-muted-foreground sm:block">
                        {isFile(node) ? formatBytes(node.size) : "—"}
                      </span>
                      <span className="hidden w-28 shrink-0 text-right text-muted-foreground md:block">
                        {formatDate(node.createdAt)}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={
                        node.starred
                          ? `Retirer ${node.name} des favoris`
                          : `Ajouter ${node.name} aux favoris`
                      }
                      aria-pressed={Boolean(node.starred)}
                      onClick={() => toggleStar(node)}
                    >
                      <StarIcon className={cn(node.starred && "fill-current")} />
                    </Button>
                    {renderActions(node)}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <HardDriveIcon className="size-3.5" />
          {totals.count} fichier{totals.count > 1 ? "s" : ""} · {formatBytes(totals.size)}
        </span>
        <span>{notice}</span>
      </footer>
      <output aria-live="polite" className="mt-2 block min-h-4 text-xs text-muted-foreground">
        {status}
      </output>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription>
              Le dossier est créé dans {path.at(-1)?.name ?? "Mes fichiers"}.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            aria-label="Nom du dossier"
            placeholder="Nom du dossier"
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") createFolder();
            }}
          />
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="ghost" size="lg">
                  Annuler
                </Button>
              }
            />
            <Button size="lg" disabled={!newFolderName.trim()} onClick={createFolder}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Renommer</DialogTitle>
            <DialogDescription>{renameTarget?.name}</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            aria-label="Nouveau nom"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyRename();
            }}
          />
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="ghost" size="lg">
                  Annuler
                </Button>
              }
            />
            <Button size="lg" disabled={!renameValue.trim()} onClick={applyRename}>
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={previewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewTarget(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTarget?.name}</DialogTitle>
            <DialogDescription>
              {previewTarget
                ? `${formatBytes(previewTarget.size)} · ${previewTarget.mimeType} · ${formatDate(previewTarget.createdAt)}`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-auto bg-muted/40 p-3">
            {previewTarget?.url ? (
              <img src={previewTarget.url} alt={previewTarget.name} className="mx-auto max-h-80" />
            ) : previewTarget?.text !== undefined ? (
              <pre className="font-mono text-xs whitespace-pre-wrap text-muted-foreground">
                {previewTarget.text}
              </pre>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Aperçu indisponible pour ce format.
              </p>
            )}
          </div>
          <DialogFooter>
            {previewTarget ? (
              <Button variant="outline" size="lg" onClick={() => downloadFile(previewTarget)}>
                <DownloadIcon data-icon="inline-start" />
                Télécharger
              </Button>
            ) : null}
            <DialogClose render={<Button size="lg">Fermer</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Sous-composants                               */
/* -------------------------------------------------------------------------- */

function GridCard({
  node,
  actions,
  children,
}: {
  node: FileManagerNode;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.18 }}
      className="relative min-w-0 bg-card p-3 ring-1 ring-foreground/10"
    >
      {children}
      {node.starred ? (
        <StarIcon className="absolute top-3 right-3 size-3.5 fill-current text-primary" />
      ) : null}
      <span className="absolute right-1.5 bottom-1.5">{actions}</span>
    </motion.article>
  );
}

function FilePreview({ file }: { file: FileManagerFile }) {
  const Icon = nodeIcon(file);
  return (
    <div className="mb-3 flex h-28 items-center justify-center overflow-hidden bg-muted/50">
      {file.url ? (
        <img src={file.url} alt="" className="size-full object-cover" />
      ) : file.text !== undefined ? (
        <div
          aria-hidden="true"
          className="h-24 w-4/5 overflow-hidden bg-background p-2 text-xs leading-4 text-muted-foreground"
        >
          <span className="mb-1.5 block h-0.5 w-8 bg-accent" />
          <p className="font-mono whitespace-pre-wrap">{file.text.slice(0, 220)}</p>
        </div>
      ) : (
        <Icon className="size-6 text-muted-foreground" />
      )}
    </div>
  );
}
