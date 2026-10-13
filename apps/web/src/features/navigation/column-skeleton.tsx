import { Skeleton } from "@pokedata/ui/components/skeleton";

import { Column, LIST_COLUMN_WIDTH } from "@/components/columns-panel";

export function ColumnSkeleton() {
  return (
    <Column mobile animate={false} className={LIST_COLUMN_WIDTH}>
      <div aria-busy="true" className="flex flex-col gap-3 p-3">
        <span className="sr-only">Chargement de la liste</span>
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </Column>
  );
}
