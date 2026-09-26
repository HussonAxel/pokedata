"use client";
// animate-ui.com/docs/components/base/preview-card
// Adaptations : Base UI publié sous `@base-ui/react`, contexte et état contrôlé
// intégrés au fichier, suivi du curseur passé par variables CSS (utilitaire
// `motion-preview-card-follow` de globals.css) plutôt que par style en ligne,
// entrée réduite à un fondu quand l'utilisateur limite les animations.

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { cn } from "@pokedata/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
  type SpringOptions,
} from "motion/react";
import { createContext, useContext, useState, type ComponentProps, type ReactNode } from "react";

type FollowCursor = boolean | "x" | "y";

type PreviewCardContextValue = {
  isOpen: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
  followCursor: FollowCursor;
  followCursorSpringOptions: SpringOptions;
};

const PreviewCardContext = createContext<PreviewCardContextValue | null>(null);

function usePreviewCard() {
  const ctx = useContext(PreviewCardContext);
  if (!ctx) throw new Error("PreviewCard.* must be used inside <PreviewCard>");
  return ctx;
}

type PreviewCardProps = ComponentProps<typeof PreviewCardPrimitive.Root> & {
  followCursor?: FollowCursor;
  followCursorSpringOptions?: SpringOptions;
};

function PreviewCard({
  followCursor = false,
  followCursorSpringOptions = { stiffness: 200, damping: 17 },
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: PreviewCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <PreviewCardContext.Provider value={{ isOpen, x, y, followCursor, followCursorSpringOptions }}>
      <PreviewCardPrimitive.Root
        {...props}
        open={isOpen}
        onOpenChange={(next, details) => {
          setInternalOpen(next);
          onOpenChange?.(next, details);
        }}
      />
    </PreviewCardContext.Provider>
  );
}

type PreviewCardTriggerProps = ComponentProps<typeof PreviewCardPrimitive.Trigger>;

function PreviewCardTrigger({ onMouseMove, ...props }: PreviewCardTriggerProps) {
  const { x, y, followCursor } = usePreviewCard();

  return (
    <PreviewCardPrimitive.Trigger
      data-slot="preview-card-trigger"
      onMouseMove={(event) => {
        onMouseMove?.(event);
        if (!followCursor) return;
        const target = event.currentTarget.getBoundingClientRect();
        // La carte suit la moitié de l'écart entre le pointeur et le centre du déclencheur.
        if (followCursor !== "y") x.set((event.clientX - target.left - target.width / 2) / 2);
        if (followCursor !== "x") y.set((event.clientY - target.top - target.height / 2) / 2);
      }}
      {...props}
    />
  );
}

type PreviewCardPortalProps = Omit<
  ComponentProps<typeof PreviewCardPrimitive.Portal>,
  "keepMounted"
>;

function PreviewCardPortal(props: PreviewCardPortalProps) {
  const { isOpen } = usePreviewCard();

  // Le portail reste monté le temps que la sortie animée se termine.
  return (
    <AnimatePresence>
      {isOpen && (
        <PreviewCardPrimitive.Portal keepMounted data-slot="preview-card-portal" {...props} />
      )}
    </AnimatePresence>
  );
}

type PreviewCardPopupProps = Omit<ComponentProps<typeof PreviewCardPrimitive.Popup>, "render"> &
  HTMLMotionProps<"div">;

function PreviewCardPopup({
  transition = { type: "spring", stiffness: 300, damping: 25 },
  className,
  style,
  ...props
}: PreviewCardPopupProps) {
  const { x, y, followCursor, followCursorSpringOptions } = usePreviewCard();
  const reduce = useReducedMotion();
  const translateX = useTransform(useSpring(x, followCursorSpringOptions), (v) => `${v}px`);
  const translateY = useTransform(useSpring(y, followCursorSpringOptions), (v) => `${v}px`);
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 };
  // Motion anime aussi les variables CSS ; `MotionStyle` ne les déclare pas.
  const follow: Record<`--${string}`, string | MotionValue<string>> = {
    "--motion-preview-card-x": followCursor !== "y" ? translateX : "0px",
    "--motion-preview-card-y": followCursor !== "x" ? translateY : "0px",
  };

  return (
    <PreviewCardPrimitive.Popup
      render={
        <motion.div
          key="preview-card-popup"
          data-slot="preview-card-popup"
          initial={hidden}
          animate={{ opacity: 1, scale: 1 }}
          exit={hidden}
          transition={transition}
          className={cn(followCursor && !reduce && "motion-preview-card-follow", className)}
          style={{ ...follow, ...style }}
          {...props}
        />
      }
    />
  );
}

const previewCardPanelVariants = cva(
  "w-64 origin-(--transform-origin) rounded-md border bg-popover text-xs/relaxed text-popover-foreground shadow-md outline-hidden",
  {
    variants: {
      variant: {
        default: "p-4",
        /** Contenu bord à bord (bannière, média) : la carte ne rembourre rien. */
        flush: "overflow-hidden p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type PreviewCardPanelProps = Omit<
  ComponentProps<typeof PreviewCardPrimitive.Positioner>,
  "className" | "children"
> &
  VariantProps<typeof previewCardPanelVariants> & {
    /** Classes de la carte elle-même, pas du positionneur. */
    className?: string;
    children?: ReactNode;
  };

function PreviewCardPanel({
  className,
  variant,
  align = "center",
  sideOffset = 4,
  children,
  ...props
}: PreviewCardPanelProps) {
  return (
    <PreviewCardPortal>
      <PreviewCardPrimitive.Positioner
        align={align}
        sideOffset={sideOffset}
        className="z-50"
        {...props}
      >
        <PreviewCardPopup className={cn(previewCardPanelVariants({ variant }), className)}>
          {children}
        </PreviewCardPopup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPortal>
  );
}

export {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPanel,
  previewCardPanelVariants,
  type PreviewCardProps,
  type PreviewCardTriggerProps,
  type PreviewCardPanelProps,
};
