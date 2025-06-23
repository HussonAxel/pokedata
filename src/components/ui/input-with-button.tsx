import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useGetSinglePokemon } from "@/data/pokemons";

import { useState } from "react";

export function InputWithButton() {
  const [userEntry, setUserEntry] = useState("");
  const [pokemonToSearch, setPokemonToSearch] = useState("");
  
  const { isLoading } = useGetSinglePokemon(pokemonToSearch);

  const handleSubmit = () => {
    if (userEntry.trim()) {
      setPokemonToSearch(userEntry.toLowerCase());
    }
  };

  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input
        type="text"
        placeholder="Type your pokemon"
        value={userEntry}
        onChange={(e) => setUserEntry(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <Button 
        type="submit" 
        variant="outline" 
        onClick={handleSubmit}
        disabled={isLoading || !userEntry.trim()}
      >
        {isLoading ? "Loading..." : "Submit"}
      </Button>
    </div>
  );
}