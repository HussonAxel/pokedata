import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetSinglePokemon } from "@/data/pokemons";
import useStore from "@/store/store";

export function PokedleTable() {
  const currentPokemon = useStore((s) => s.currentPokemon);
  const tries = useStore((s) => s.tries);

  const { data, isLoading, error } = useGetSinglePokemon(currentPokemon?.id || 0);

  if (!currentPokemon) {
    return <div>No Pokémon selected</div>;
  }

  if (isLoading) {
    return <div>Loading…</div>;
  }
  if (error) {
    return <div>Error loading Pokémon</div>;
  }
  if (!data) {
    return null;
  }

  const { height, weight, sprites } = data.pokemonResponseData;
  const { habitat, color } = data.pokemonSpeciesResponseData;
  const types = data.pokemonResponseData.types.map((type: { type: { name: string } }) => type.type.name);
  const officialArtwork = sprites.other['official-artwork'].front_default;
  const pokemonSpeciesRequiredFields = {
    height,
    weight,
    officialArtwork,
    types,
  };
  const pokemonSpeciesOptionalFields = {
    habitat: habitat.name,
    color: color.name,
  };

  const allFields = {
    ...pokemonSpeciesRequiredFields,
    ...pokemonSpeciesOptionalFields,
  };

  let previousEntries: any[] = []
  previousEntries = [...previousEntries, allFields];
  console.log("Current Pokémon data:", previousEntries);
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell colSpan={7}>Number of tries : </TableCell>
            <TableCell>{tries}</TableCell>
          </TableRow>
          <TableRow className="text-md">
            <TableHead className="font-semibold">Pokémon</TableHead>
            <TableHead className="font-semibold">Type 1</TableHead>
            <TableHead className="font-semibold">Type 2</TableHead>
            <TableHead className="font-semibold">Habitat</TableHead>
            <TableHead className="font-semibold">Couleur(s)</TableHead>
            <TableHead className="font-semibold">Stade d'évolution</TableHead>
            <TableHead className="font-semibold">Hauteur</TableHead>
            <TableHead className="font-semibold">Poids</TableHead>
          </TableRow>
        </TableHeader>
        {/* <TableBody>
          {pokemons.map((pokemon) => (
            <TableRow key={pokemon.id}>
              <TableCell>{pokemon.name}</TableCell>
              <TableCell>{pokemon.type1}</TableCell>
              <TableCell>{pokemon.type2}</TableCell>
              <TableCell>{pokemon.habitat}</TableCell>
              <TableCell>{pokemon.color}</TableCell>
              <TableCell>{pokemon.evolutionStage}</TableCell>
              <TableCell>{pokemon.height}</TableCell>
              <TableCell>{pokemon.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody> */}
      </Table>
    </>
  );
}
