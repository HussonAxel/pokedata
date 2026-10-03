import { Item } from "@pokedata/ui/components/item";
import { ScrollArea } from "@pokedata/ui/components/scroll-area";
import { cn } from "@pokedata/ui/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";

import { SPRING_LAYOUT } from "@/lib/ease";

/**
 * Panneau à colonnes façon « Miller » : une liste mène à la suivante, puis à un
 * détail. Les colonnes sont côte à côte à partir de `xl` ; en dessous, seules
 * celles marquées `mobile` restent affichées, une à la fois.
 */
export function ColumnsPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="columns-panel"
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

export function ColumnsPanelHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="columns-panel-header"
      className={cn(
        "flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

export function Columns({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="columns" className={cn("flex min-h-0 flex-1", className)} {...props} />;
}

export function Column({
  mobile = false,
  animate = true,
  className,
  ...props
}: ComponentProps<"section"> & {
  /** Reste visible sous `xl`, où une seule colonne s'affiche à la fois. */
  mobile?: boolean;
  /** Fondu à l'apparition de la colonne ; à couper pour un squelette qu'une vraie colonne remplace. */
  animate?: boolean;
}) {
  return (
    <section
      data-slot="column"
      className={cn(
        "min-h-0 min-w-0 flex-col border-r last:border-r-0",
        animate &&
          "animate-in fade-in-0 slide-in-from-left-2 duration-200 motion-reduce:animate-none",
        mobile ? "flex flex-1" : "hidden xl:flex",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Largeur d'une colonne de liste à partir de `xl` : sans détail ouvert (`mobile`),
 * elle partage l'espace libre avec le contenu ; à l'ouverture d'un détail, elle
 * se resserre en glissant jusqu'à 20rem. Seul `flex-grow` change, ce qui
 * s'interpole, contrairement à un passage de `flex-1` à une largeur fixe.
 */
export const LIST_COLUMN_WIDTH =
  "w-full xl:shrink-0 xl:basis-80 transition-[flex-grow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

export function ColumnHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="column-header"
      className={cn("flex shrink-0 items-center gap-2 border-b p-3", className)}
      {...props}
    />
  );
}

export function ColumnBody({ className, children, ...props }: ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea className={cn("min-h-0 flex-1", className)} {...props}>
      {children}
    </ScrollArea>
  );
}

/** Hauteur de chaque taille de ligne (voir les variantes `row` dans `item.tsx`). */
const ROW_HEIGHT = { row: 40, "row-lg": 48, "row-xl": 80 } as const;

type RowSize = keyof typeof ROW_HEIGHT;

/** Vrai sous un `ColumnList` : le surlignage est alors porté par l'indicateur partagé. */
const ColumnListContext = createContext(false);

/**
 * Liste de lignes de même taille avec un indicateur de sélection unique qui
 * glisse d'une ligne à l'autre. Les hauteurs étant fixes, sa position se
 * calcule sans mesure du DOM, donc fonctionne aussi pour les lignes que
 * `content-visibility` ne met pas en page. À placer autour du `nav`/`ul` des lignes.
 */
export function ColumnList({
  selectedIndex,
  size = "row",
  gap = 0,
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  /** Index de la ligne sélectionnée ; `-1` s'il n'y en a pas. */
  selectedIndex: number;
  size?: RowSize;
  /** Espacement entre les lignes, y compris virtualisées. */
  gap?: number;
}) {
  const reduceMotion = useReducedMotion();
  const height = ROW_HEIGHT[size];
  const visible = selectedIndex >= 0;
  // Sans sélection précédente, l'indicateur apparaît sur place plutôt que de descendre depuis le haut.
  // Le ref est mis à jour après le rendu : le muter pendant le rendu fausserait `jump` en mode strict.
  const hadSelection = useRef(visible);
  const jump = reduceMotion || !hadSelection.current;
  useEffect(() => {
    hadSelection.current = visible;
  }, [visible]);

  return (
    <ColumnListContext.Provider value>
      <div data-slot="column-list" className={cn("relative", className)} {...props}>
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ y: Math.max(selectedIndex, 0) * (height + gap), opacity: visible ? 1 : 0 }}
          transition={jump ? { duration: 0 } : SPRING_LAYOUT}
          style={{ "--row-height": `${height}px` } as CSSProperties}
          className={cn(
            "pointer-events-none absolute inset-x-2 top-2 h-(--row-height) rounded-lg bg-foreground",
            size === "row-xl" && "rounded-xl",
          )}
        />
        {children}
      </div>
    </ColumnListContext.Provider>
  );
}

/** Ligne d'une colonne ; l'élément sélectionné s'inverse comme dans catalog.design. */
export function ColumnItem({
  selected = false,
  chevron = true,
  className,
  children,
  ...props
}: ComponentProps<typeof Item> & { selected?: boolean; chevron?: boolean }) {
  const inList = useContext(ColumnListContext);

  return (
    <Item
      variant={inList ? "column-indicator" : "column"}
      size="row"
      data-selected={selected || undefined}
      aria-current={selected ? "true" : undefined}
      className={className}
      {...props}
    >
      {children}
      {chevron ? (
        <ChevronRightIcon aria-hidden="true" className="ml-auto size-4 shrink-0 opacity-50" />
      ) : null}
    </Item>
  );
}

export function ColumnEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="m-auto max-w-56 p-6 text-center text-sm text-balance text-muted-foreground">
      {children}
    </p>
  );
}
