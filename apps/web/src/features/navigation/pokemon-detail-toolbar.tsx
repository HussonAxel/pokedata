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

import { useShellLayout } from "@/features/navigation/shell-layout";
import { ColumnSkeleton } from "@/features/navigation/column-skeleton";
import { PokemonColumn } from "@/features/pokedex/pokemon-column";

/**
 * Au-dessus d'une fiche : masquer la liste à côté (à partir de `xl`) ou, en
 * dessous, en choisir un autre Pokémon dans une fenêtre.
 */
export function PokemonDetailToolbar() {
  const {
    state: { listHidden },
    actions: { toggleList },
  } = useShellLayout();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed px-5 py-2">
      <Button
        variant="ghost"
        size="sm"
        className="hidden xl:inline-flex"
        aria-expanded={!listHidden}
        aria-controls="pokemon-list"
        onClick={toggleList}
      >
        {listHidden ? (
          <PanelLeftOpenIcon data-icon="inline-start" />
        ) : (
          <PanelLeftCloseIcon data-icon="inline-start" />
        )}
        {listHidden ? "Afficher les Pokémon" : "Masquer la liste"}
      </Button>
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogTrigger render={<Button variant="secondary" size="sm" className="xl:hidden" />}>
          <PanelLeftOpenIcon data-icon="inline-start" /> Changer de Pokémon
        </DialogTrigger>
        <DialogContent className="h-[80svh]">
          <DialogHeader>
            <DialogTitle>Changer de Pokémon</DialogTitle>
            <DialogDescription>Recherchez un Pokémon ou filtrez la liste.</DialogDescription>
          </DialogHeader>
          <Suspense fallback={<ColumnSkeleton />}>
            <PokemonColumn
              mobile
              className="w-full flex-1 border-r-0 xl:basis-auto"
              onSelect={() => setPickerOpen(false)}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
      <span className="label-mono text-muted-foreground">Pokédex national</span>
    </div>
  );
}
