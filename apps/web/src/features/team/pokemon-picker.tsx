import { Button } from "@pokedata/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pokedata/ui/components/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@pokedata/ui/components/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@pokedata/ui/components/item";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { normalizeSearch } from "@/features/encyclopedia/search";
import { formatDexNumber } from "@/features/pokedex/dex-number";
import { PokemonSprite } from "@/features/pokedex/pokemon-sprite";

/** Résultats affichés : assez pour choisir, peu pour rester rapide. */
const MAX_RESULTS = 30;

type PickerEntry = { id: number; name: string; dexNumber: number };

/** Choisir un Pokémon dans une fenêtre, par nom ou numéro. */
export function PokemonPicker({
  entries,
  onPick,
  disabled,
}: {
  entries: PickerEntry[];
  onPick: (entry: PickerEntry) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const needle = normalizeSearch(deferred);
    const matches = needle
      ? entries.filter(
          (entry) =>
            normalizeSearch(entry.name).includes(needle) ||
            formatDexNumber(entry.dexNumber).includes(needle),
        )
      : entries;
    return matches.slice(0, MAX_RESULTS);
  }, [entries, deferred]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogTrigger render={<Button variant="outline" disabled={disabled} />}>
        <PlusIcon data-icon="inline-start" />
        Ajouter un Pokémon
      </DialogTrigger>
      <DialogContent className="h-[80svh]">
        <DialogHeader>
          <DialogTitle>Ajouter un Pokémon</DialogTitle>
          <DialogDescription>Recherchez par nom ou par numéro du Pokédex.</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              autoFocus
              value={query}
              placeholder="Rechercher un nom ou un numéro"
              aria-label="Rechercher un Pokémon"
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
          <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {results.map((entry) => (
              <li key={entry.id}>
                <Item
                  render={
                    <button
                      type="button"
                      data-cuelume-select=""
                      onClick={() => {
                        onPick(entry);
                        setOpen(false);
                        setQuery("");
                      }}
                    />
                  }
                >
                  <ItemMedia>
                    <PokemonSprite pokemonId={entry.id} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{entry.name}</ItemTitle>
                    <ItemDescription>N° {formatDexNumber(entry.dexNumber)}</ItemDescription>
                  </ItemContent>
                </Item>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
