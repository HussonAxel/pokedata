"use client";
// beui.dev/components/motion/tabs
// Adaptations : les styles dynamiques passent par des variables CSS lues par les
// utilitaires `motion-tabs-*` de globals.css (pas de style en ligne), les
// panneaux portent leur rôle tabpanel et les flèches déplacent l'onglet actif.

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  cancelFrame,
  frame,
  motion,
  MotionConfig,
  useReducedMotion,
  type Transition,
} from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@pokedata/ui/lib/utils";

type Variant = "pill" | "underline" | "segment";

type Ctx = {
  value: string;
  setValue: (v: string) => void;
  layoutId: string;
  variant: Variant;
  /** Faux jusqu'au premier choix : le panneau rendu par le serveur ne rejoue pas son entrée. */
  switched: boolean;
};

const TabsCtx = createContext<Ctx | null>(null);

function useTabs() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("Tabs.* must be used inside <Tabs>");
  return ctx;
}

const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

// Settle without overshoot: a scrollable tab list would turn even a small
// overshoot into a transient scrollbar and layout shift.
// Scale stiffness and damping together for a quicker glide with the same feel.
const transition: Transition = {
  type: "spring",
  stiffness: 245,
  damping: 36,
  mass: 1.2,
};

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = "pill",
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const [switched, setSwitched] = useState(false);
  const layoutId = useId();
  const reduce = useReducedMotion();
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const setValue = useCallback(
    (v: string) => {
      setSwitched(true);
      if (!controlled) setInternal(v);
      onValueChange?.(v);
    },
    [controlled, onValueChange],
  );
  const contextValue = useMemo(
    () => ({ value: current, setValue, layoutId, variant, switched }),
    [current, layoutId, setValue, variant, switched],
  );
  return (
    <MotionConfig transition={reduce ? { duration: 0 } : transition}>
      <TabsCtx.Provider value={contextValue}>
        {/* layoutRoot: the indicator's layoutId measures in page coordinates, so
            inside fixed/scrolled containers it would replay scroll offsets as
            movement. The pill only ever travels within the list, so scoping
            projection to the Tabs wrapper is always correct. */}
        <motion.div layoutRoot className={className}>
          {children}
        </motion.div>
      </TabsCtx.Provider>
    </MotionConfig>
  );
}

const listClasses: Record<Variant, string> = {
  pill: "inline-flex items-center gap-1 rounded-full bg-card p-1",
  underline: "inline-flex items-center gap-1 border-b border-border",
  segment: "inline-flex items-center gap-0 rounded-lg bg-card p-0.5",
};

export function TabsList({
  children,
  className,
  wrapperClassName,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  "aria-label"?: string;
}) {
  const { variant, value } = useTabs();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const viewportId = useId();
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });

  const measure = useCallback(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    if (!root || !viewport) return;
    // Overlay controls do not reduce the viewport or change its scroll range.
    const overflow = viewport.scrollWidth > root.clientWidth + 1;
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const rtl = getComputedStyle(viewport).direction === "rtl";
    // Modern browsers expose negative scrollLeft in RTL. Clamp rubber-banding.
    const fromLeft = Math.max(
      0,
      Math.min(max, rtl ? max + viewport.scrollLeft : viewport.scrollLeft),
    );
    const next = { overflow, left: fromLeft > 1, right: fromLeft < max - 1 };
    setEdges((previous) =>
      previous.overflow === next.overflow &&
      previous.left === next.left &&
      previous.right === next.right
        ? previous
        : next,
    );
  }, []);

  const reveal = useCallback(
    (tab: HTMLElement | null) => {
      const viewport = viewportRef.current;
      if (!viewport || !tab) return;
      const frame = viewport.getBoundingClientRect();
      const item = tab.getBoundingClientRect();
      const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const rtl = getComputedStyle(viewport).direction === "rtl";
      const fromLeft = Math.max(
        0,
        Math.min(max, rtl ? max + viewport.scrollLeft : viewport.scrollLeft),
      );
      // Keep the selected/focused label clear of the arrows over the faded edges.
      const left = frame.left + (fromLeft > 1 ? 36 : 0);
      const right = frame.right - (fromLeft < max - 1 ? 36 : 0);
      const delta =
        item.left < left ? item.left - left : item.right > right ? item.right - right : 0;
      // Scroll only this viewport; scrollIntoView can also move the whole page.
      if (delta) viewport.scrollBy({ left: delta, behavior: reduce ? "instant" : "smooth" });
    },
    [reduce],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!root || !viewport || !list) return;
    const update = () => {
      measure();
      reveal(list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]'));
    };
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(viewport);
    observer.observe(list);
    viewport.addEventListener("scroll", measure, { passive: true });
    update();
    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", measure);
    };
  }, [measure, reveal]);

  useLayoutEffect(() => {
    // Children may change without a resize; controlled selection must also reveal.
    void children;
    void value;
    void edges.overflow;
    measure();
    reveal(
      listRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') ?? null,
    );
  }, [children, value, edges.overflow, measure, reveal]);

  useLayoutEffect(() => {
    if (variant === "underline") return;
    const list = listRef.current;
    if (!list) return;
    void children;
    const labels = Array.from(list.querySelectorAll<HTMLElement>("[data-tabs-label]"));
    const indicator = list.querySelector<HTMLElement>("[data-tabs-indicator]");
    const target = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!indicator || !target || target.dataset.tabsValue !== value) {
      for (const label of labels)
        label.style.setProperty("--motion-tabs-clip", "inset(0 100% 0 0)");
      return;
    }
    let frames = 0;
    let stillFrames = 0;
    let previous: { left: number; right: number } | undefined;
    const syncClips = () => {
      const pill = (reduce ? target : indicator).getBoundingClientRect();
      // Read ALL geometry before writing ANY masks. A loop per tab interleaved
      // reads and writes, forcing the browser to flush styles repeatedly.
      const clips = labels.map((label) => {
        const bounds = label.getBoundingClientRect();
        const left = Math.max(0, Math.min(bounds.width, pill.left - bounds.left));
        const right = Math.max(0, Math.min(bounds.width, bounds.right - pill.right));
        return left + right >= bounds.width
          ? "inset(0 100% 0 0)"
          : `inset(0 ${right}px 0 ${left}px)`;
      });
      labels.forEach((label, index) => {
        const clip = clips[index] ?? "inset(0 100% 0 0)";
        if (label.style.getPropertyValue("--motion-tabs-clip") !== clip) {
          label.style.setProperty("--motion-tabs-clip", clip);
        }
      });
      frames += 1;
      stillFrames =
        previous &&
        Math.abs(pill.left - previous.left) < 0.01 &&
        Math.abs(pill.right - previous.right) < 0.01
          ? stillFrames + 1
          : 0;
      previous = { left: pill.left, right: pill.right };
      if (reduce || (frames > 2 && stillFrames >= 2)) cancelFrame(syncClips);
    };
    // One shared pass after Motion paints the projected pill keeps every label
    // in sync, including labels crossed during a long or interrupted glide.
    frame.postRender(syncClips, true);
    return () => cancelFrame(syncClips);
  }, [value, children, variant, reduce]);

  const scroll = (direction: number) => {
    const viewport = viewportRef.current;
    if (viewport)
      viewport.scrollBy({
        left: direction * viewport.clientWidth * 0.8,
        behavior: reduce ? "instant" : "smooth",
      });
  };

  // Motif ARIA des onglets : les flèches parcourent la liste (en boucle),
  // Début et Fin sautent aux extrémités, et l'onglet atteint s'active aussitôt.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
    const index = tabs.indexOf(event.target as HTMLElement);
    if (index === -1) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const targets: Record<string, number> = {
      ArrowRight: rtl ? index - 1 : index + 1,
      ArrowLeft: rtl ? index + 1 : index - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = tabs[(target + tabs.length) % tabs.length];
    next?.focus();
    next?.click();
  };

  const controlClass =
    "absolute inset-y-0 z-20 inline-flex w-9 items-center justify-center text-foreground transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-0";
  const surfaceClass =
    variant === "pill" ? "rounded-full bg-card" : variant === "segment" ? "rounded-lg bg-card" : "";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative isolate flex w-full max-w-full min-w-0 items-center",
        edges.overflow && surfaceClass,
        wrapperClassName,
      )}
    >
      {edges.overflow && (
        <button
          type="button"
          aria-label="Scroll tabs left"
          aria-controls={viewportId}
          disabled={!edges.left}
          onClick={() => scroll(-1)}
          className={cn(controlClass, "left-0 rounded-l-full")}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      )}
      <motion.div
        ref={viewportRef}
        id={viewportId}
        layoutScroll
        className="motion-tabs-viewport no-scrollbar w-full min-w-0 overflow-x-auto"
        style={
          edges.overflow
            ? ({
                "--motion-tabs-mask": `linear-gradient(to right, ${edges.left ? "transparent, black 40px" : "black, black 0px"}, ${edges.right ? "black calc(100% - 40px), transparent" : "black 100%"})`,
              } as CSSProperties)
            : undefined
        }
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLElement && event.target.getAttribute("role") === "tab")
            reveal(event.target);
        }}
      >
        <div
          ref={listRef}
          role="tablist"
          aria-label={ariaLabel}
          onKeyDown={onKeyDown}
          className={cn(listClasses[variant], "w-max", className)}
        >
          {children}
        </div>
      </motion.div>
      {edges.overflow && edges.left && (
        <span
          aria-hidden="true"
          className="motion-tabs-fade-left pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
        />
      )}
      {edges.overflow && edges.right && (
        <span
          aria-hidden="true"
          className="motion-tabs-fade-right pointer-events-none absolute inset-y-0 right-0 z-10 w-10"
        />
      )}
      {edges.overflow && (
        <button
          type="button"
          aria-label="Scroll tabs right"
          aria-controls={viewportId}
          disabled={!edges.right}
          onClick={() => scroll(1)}
          className={cn(controlClass, "right-0 rounded-r-full")}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  indicatorClassName,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  indicatorClassName?: string;
}) {
  const { value: current, setValue, layoutId, variant } = useTabs();
  const active = current === value;
  // React owns the initial mask only; TabsList synchronizes subsequent masks.
  const [initialClip] = useState(() => (active ? "inset(0)" : "inset(0 100% 0 0)"));
  const aria = {
    id: tabId(layoutId, value),
    role: "tab",
    "aria-selected": active,
    "aria-controls": panelId(layoutId, value),
    tabIndex: active ? 0 : -1,
  } as const;

  if (variant === "underline") {
    return (
      <button
        type="button"
        {...aria}
        onClick={() => setValue(value)}
        className={cn(
          "relative isolate -mb-px inline-flex min-h-11 shrink-0 items-center px-3 pt-1 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          className,
        )}
      >
        {children}
        {active ? (
          <motion.span
            layoutId={layoutId}
            layout
            className={cn("absolute right-0 bottom-0 left-0 h-px bg-primary", indicatorClassName)}
          />
        ) : null}
      </button>
    );
  }

  const radius = variant === "pill" ? "rounded-full" : "rounded-md";

  return (
    <div className="relative shrink-0">
      {active ? (
        <motion.span
          data-tabs-indicator=""
          layoutId={layoutId}
          layout
          className={cn("absolute inset-0 bg-primary", radius, indicatorClassName)}
        />
      ) : null}
      <button
        type="button"
        {...aria}
        data-tabs-value={value}
        onClick={() => setValue(value)}
        className={cn(
          "relative z-10 inline-flex items-center justify-center bg-transparent px-3.5 py-1.5 text-sm font-medium whitespace-nowrap outline-none",
          "text-muted-foreground hover:text-foreground",
          radius,
          className,
        )}
      >
        {children}
        <span
          data-tabs-label=""
          aria-hidden="true"
          inert
          className="motion-tabs-label pointer-events-none absolute inset-0 inline-flex items-center justify-center text-primary-foreground"
          style={{ "--motion-tabs-clip": initialClip } as CSSProperties}
        >
          {children}
        </span>
      </button>
    </div>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: current, layoutId, switched } = useTabs();
  const reduce = useReducedMotion();
  const active = current === value;
  const aria = {
    id: panelId(layoutId, value),
    role: "tabpanel",
    "aria-labelledby": tabId(layoutId, value),
  } as const;
  // Inactive panels stay mounted but hidden, so their content (e.g. source
  // code) is present in the server-rendered HTML for crawlers and assistive
  // tech, instead of being dropped from the DOM.
  if (!active) {
    return (
      <div hidden {...aria} className={className}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      key={value}
      {...aria}
      initial={switched ? { opacity: 0, y: reduce ? 0 : 4 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
      className={cn("mt-4", className)}
    >
      {children}
    </motion.div>
  );
}
