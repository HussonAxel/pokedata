import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pokedata/ui/components/card";
import { cn } from "@pokedata/ui/lib/utils";
import { createContext, use, useId, type ComponentProps, type ReactNode } from "react";

/** Identifiant du titre, pour que la région soit nommée par lui (`aria-labelledby`). */
const SectionContext = createContext<string | null>(null);

function useSectionTitleId() {
  const titleId = use(SectionContext);
  if (!titleId) throw new Error("Les sous-composants de Section s'utilisent dans une <Section>.");
  return titleId;
}

/**
 * Bloc de contenu d'une page : un panneau givré nommé par son titre.
 *
 * ```tsx
 * <Section id="talents">
 *   <SectionHeader>
 *     <SectionTitle>Talents</SectionTitle>
 *     <SectionDescription>…</SectionDescription>
 *   </SectionHeader>
 *   <SectionContent>…</SectionContent>
 * </Section>
 * ```
 */
export function Section({ id, className, children, ...props }: ComponentProps<"section">) {
  const generatedId = useId();
  const titleId = `${id ?? generatedId}-title`;

  return (
    <SectionContext value={titleId}>
      <section id={id} aria-labelledby={titleId} className={cn("min-w-0", className)} {...props}>
        <Card className="min-w-0">{children}</Card>
      </section>
    </SectionContext>
  );
}

export function SectionHeader(props: ComponentProps<typeof CardHeader>) {
  return <CardHeader {...props} />;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <CardTitle>
      <h2 id={useSectionTitleId()}>{children}</h2>
    </CardTitle>
  );
}

export function SectionDescription(props: ComponentProps<typeof CardDescription>) {
  return <CardDescription {...props} />;
}

export function SectionAction(props: ComponentProps<typeof CardAction>) {
  return <CardAction {...props} />;
}

export function SectionContent({ className, ...props }: ComponentProps<typeof CardContent>) {
  return <CardContent className={cn("min-w-0", className)} {...props} />;
}

/** Message d'une section sans données. */
export function SectionEmpty({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground", className)} {...props} />;
}
