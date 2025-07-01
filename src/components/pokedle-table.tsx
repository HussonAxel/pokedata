import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetSinglePokemon, useGetSingleRandomPokemon } from "@/data/pokemons";
import useStore from "@/store/store";

export function PokedleTable() {
  const currentPokemon = useStore((s) => s.currentPokemon);
  const tries = useStore((s) => s.tries);
  const pokemonDetailedData = useStore((s) => s.pokemonDetailedData);
  const addPokemonDetailedData = useStore((s) => s.addPokemonDetailedData);

  const { data: randomPokemon } = useGetSingleRandomPokemon();

  const { data, error } = useGetSinglePokemon(currentPokemon?.id || 0);

  if (!currentPokemon) {
    return <div>No Pokémon selected</div>;
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

  const allNeededFields = {
    ...pokemonSpeciesRequiredFields,
    ...pokemonSpeciesOptionalFields,
  };

  if (currentPokemon && !pokemonDetailedData.some(item => item.id === currentPokemon.id)) {
    addPokemonDetailedData({
      id: currentPokemon.id,
      ...allNeededFields
    });
  }

  console.log("Pokémon detailed data from store:", pokemonDetailedData);
  console.log("Random Pokémon of the day:", randomPokemon);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell colSpan={7}>Number of tries : </TableCell>
            <TableCell>{tries}</TableCell>
          </TableRow>
          {randomPokemon && (
            <TableRow>
              <TableCell colSpan={8} className="text-center font-semibold text-green-600">
                Pokémon du jour : {randomPokemon.pokemonResponseData.name} (ID: {randomPokemon.pokemonResponseData.id})
              </TableCell>
            </TableRow>
          )}
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
        <TableBody>
          {pokemonDetailedData.map((pokemon) => (
            <TableRow key={pokemon.id}>
              <TableCell>
                <img
                  src={`/assets/static/sprites/base/${pokemon.id}.webp`}
                  alt={pokemon.label}
                  className="w-16 h-16 "
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </TableCell>
              <TableCell>{pokemon.types[0]}</TableCell>
              <TableCell>{pokemon.types[1] || "-"}</TableCell>
              <TableCell>{pokemon.habitat}</TableCell>
              <TableCell>{pokemon.color}</TableCell>
              <TableCell>{pokemon.evolutionStage}</TableCell>
              <TableCell>{pokemon.height}</TableCell>
              <TableCell>{pokemon.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
