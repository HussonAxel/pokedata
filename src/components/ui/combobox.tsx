import * as React from "react";
import { ChevronsUpDown, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetAllPokemons } from "@/data/pokemons";
import type { Pokemon, PokemonItem } from "@/types/pokedle.types";
import useStore from "@/store/store";

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

const CommandContent = ({
  searchQuery,
  setSearchQuery,
  filteredItems,
  handleSelect,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredItems: PokemonItem[];
  handleSelect: (value: string) => void;
}) => (
  <Command shouldFilter={false}>
    <CommandInput
      placeholder="Tapez le nom du Pokémon..."
      value={searchQuery}
      onValueChange={setSearchQuery}
    />
    <CommandList className="max-h-[300px] overflow-y-auto w-full">
      {searchQuery.trim() === "" ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Commencez à taper pour rechercher un Pokémon
        </div>
      ) : filteredItems.length === 0 ? (
        <CommandEmpty>
          Aucun Pokémon trouvé commençant par "{searchQuery}"
        </CommandEmpty>
      ) : (
        <CommandGroup>
          {filteredItems.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={handleSelect}
              className="flex items-center gap-2 justify-between"
            >
              <div className="flex flex-col ml-8">
                <span className="font-medium">{item.label}</span>
              </div>
              <img
                src={`/assets/static/sprites/base/${item.id}.webp`}
                alt={item.label}
                className="rounded w-12 h-12 object-cover self-center mr-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </CommandList>
  </Command>
);

const SelectedPokemonCard = ({ selectedItem }: { selectedItem: PokemonItem }) => (
  <article className="flex flex-row gap-2 bg-muted p-3 rounded-lg justify-between">
    <div>
      <p className="text-sm font-medium">Pokémon sélectionné :</p>
      <p className="text-sm text-muted-foreground">{selectedItem.label}</p>
    </div>
    <img
      src={`/assets/static/sprites/base/${selectedItem.id}.webp`}
      alt={selectedItem.label}
      className="rounded w-16 h-16 object-cover self-center"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  </article>
);

export default function PokemonCombobox() {
  const [open, setOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<PokemonItem | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const addPokemon = useStore((state) => state.addPokemon);
  const incrementTries = useStore((state) => state.triesIncrementation);
  
  const { data: pokemonData, isLoading, error } = useGetAllPokemons();

  const pokemonItems: PokemonItem[] = React.useMemo(() => {
    if (!pokemonData?.results) return [];

    return pokemonData.results.map((pokemon: Pokemon) => {
      const id = pokemon.url.split("/").filter(Boolean).pop() || "0";
      return {
        value: pokemon.name,
        label: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace("-", " "),
        id: id,
      };
    });
  }, [pokemonData]);

  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return pokemonItems
      .filter((item) => item.label.toLowerCase().startsWith(query))
      .slice(0, 50);
  }, [searchQuery, pokemonItems]);

  const handleSubmit = () => {
    if (selectedItem) {
      addPokemon(selectedItem);
      incrementTries(1);
    }
  };

  const handleSelect = (currentValue: string) => {
    const item = pokemonItems.find((item) => item.value === currentValue);
    setSelectedItem(item || null);
    setOpen(false);
    setSearchQuery("");
  };

  const triggerButton = (
    <Button variant="outline" className="w-full justify-between">
      {selectedItem ? (
        <span className="truncate">{selectedItem.label}</span>
      ) : (
        `Choisir parmi ${pokemonItems.length.toLocaleString()} Pokémon(s)`
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const commandProps = {
    searchQuery,
    setSearchQuery,
    filteredItems,
    handleSelect,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement des données Pokémon...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto p-6">
        <p className="text-sm text-red-500">Échec du chargement des données Pokémon</p>
        <p className="text-xs text-muted-foreground">Veuillez réessayer plus tard</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-3/4 mx-auto py-6">
      <div className="space-y-2">
        {isDesktop ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start">
              <CommandContent {...commandProps} />
            </PopoverContent>
          </Popover>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
            <DrawerContent>
              <div className="mt-4 border-t">
                <CommandContent {...commandProps} />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {selectedItem && (
        <>
          <Button onClick={handleSubmit} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Soumettre le Pokémon
          </Button>
          <SelectedPokemonCard selectedItem={selectedItem} />
        </>
      )}
    </div>
  );
}

