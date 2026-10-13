import { cn } from "@pokedata/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

/** Liste de faits « libellé : valeur », libellés en mono capitales. */
export function FactList({ className, ...props }: ComponentProps<"dl">) {
  return <dl className={cn("grid gap-x-6 gap-y-4", className)} {...props} />;
}

export function Fact({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <dt className="label-mono text-muted-foreground">{label}</dt>
      <dd className="font-medium wrap-anywhere">{children}</dd>
    </div>
  );
}
