import { Button } from "@pokedata/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pokedata/ui/components/dialog";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { Suspense, useState } from "react";

import { ColumnSkeleton } from "@/features/navigation/column-skeleton";
import { ITEMS_COLUMNS, type ItemsColumnId } from "@/features/navigation/items-columns";
import { useShellLayout } from "@/features/navigation/shell-layout";

/**
 * Au-dessus d'une fiche : masquer la liste à côté (à partir de `xl`) ou, en
 * dessous, choisir un autre élément de la liste dans une fenêtre.
 */
export function DetailToolbar({ column }: { column: ItemsColumnId }) {
  const {
    state: { listHidden },
    actions: { toggleList },
  } = useShellLayout();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { Column, label, pickLabel } = ITEMS_COLUMNS[column];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed px-5 py-2">
      <Button
        variant="ghost"
        size="sm"
        className="hidden xl:inline-flex"
        aria-expanded={!listHidden}
        aria-controls="items-list"
        data-cuelume-toggle=""
        onClick={toggleList}
      >
        {listHidden ? (
          <PanelLeftOpenIcon data-icon="inline-start" />
        ) : (
          <PanelLeftCloseIcon data-icon="inline-start" />
        )}
        {listHidden ? "Afficher la liste" : "Masquer la liste"}
      </Button>
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogTrigger render={<Button variant="secondary" size="sm" className="xl:hidden" />}>
          <PanelLeftOpenIcon data-icon="inline-start" /> {pickLabel}
        </DialogTrigger>
        <DialogContent className="h-[80svh]">
          <DialogHeader>
            <DialogTitle>{pickLabel}</DialogTitle>
            <DialogDescription>Recherchez dans la liste : {label}.</DialogDescription>
          </DialogHeader>
          <Suspense fallback={<ColumnSkeleton />}>
            <Column
              mobile
              className="w-full flex-1 border-r-0 xl:basis-auto"
              onSelect={() => setPickerOpen(false)}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
      <span className="label-mono text-muted-foreground">{label}</span>
    </div>
  );
}
