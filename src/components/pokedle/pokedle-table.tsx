import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetSinglePokemon,
  useGetSingleRandomPokemon,
} from "@/data/pokemons";
import useStore from "@/store/store";

export function PokedleTable() {
  const currentPokemon = useStore((s) => s.currentPokemon);
  const pokemonDetailedData = useStore((s) => s.pokemonDetailedData);
  const addPokemonDetailedData = useStore((s) => s.addPokemonDetailedData);

  const { data: randomPokemon } = useGetSingleRandomPokemon();

  const { data, error } = useGetSinglePokemon(currentPokemon?.id || 0);

  if (error) {
    return <div>Error loading Pokémon</div>;
  }
  if (!data) {
    return null;
  }

  const { height, weight, sprites } = data.pokemonResponseData;
  const { color } = data.pokemonSpeciesResponseData;
  const types = data.pokemonResponseData.types.map(
    (type: { type: { name: string } }) => type.type.name
  );
  const officialArtwork = sprites.other["official-artwork"].front_default;
  const pokemonSpeciesRequiredFields = {
    height,
    weight,
    officialArtwork,
    types,
  };
    const pokemonSpeciesOptionalFields = {
    color: color?.name|| "-",
  };

  const allNeededFields = {
    ...pokemonSpeciesRequiredFields,
    ...pokemonSpeciesOptionalFields
  };

  if (
    currentPokemon &&
    !pokemonDetailedData.some((item) => item.id === currentPokemon.id)
  ) {
    addPokemonDetailedData({
      id: currentPokemon.id,
      ...allNeededFields,
    });
  }

  console.log("Pokémon detailed data from store:", pokemonDetailedData);
  console.log("Random Pokémon of the day:", randomPokemon);

  return (
    <section className="bg-white rounded-xl p-6 max-w-full overflow-x-auto border border-gray-200">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="text-md bg-gray-50 border-b border-gray-200">
            <TableHead className="font-semibold text-center py-4 px-2 text-gray-700">Pokémon</TableHead>
            <TableHead className="font-semibold text-center py-4 px-2 text-gray-700">Pokedex number</TableHead>
            <TableHead className="font-semibold text-center py-4 px-2 text-gray-700">Type 1</TableHead>
            <TableHead className="font-semibold text-center py-4 px-2 text-gray-700">Type 2</TableHead>
            <TableHead className="font-semibold text-center py-4 px-2 text-gray-700">Couleur(s)</TableHead>
            <TableHead className="font-semibold text-center py-4 px-2 text-gray-700">Stade d'évolution</TableHead>
            <TableHead className="font-semibold text-center py-4 px-2 text-gray-700">Hauteur</TableHead>
            <TableHead className="font-semibold text-center py-4 px-2 text-gray-700">Poids</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pokemonDetailedData.map((pokemon) => (
            <TableRow
              key={pokemon.id}
              className="text-center text-md capitalize transition-colors duration-150 hover:bg-gray-100 focus-within:bg-gray-100 border-b border-gray-100 last:border-0"
            >
              <TableCell className="py-3 px-2">
                <img
                  src={`/assets/static/sprites/base/${pokemon.id}.webp`}
                  alt={pokemon.label}
                  className="w-16 h-16 object-cover m-auto drop-shadow-md rounded-lg bg-gray-50"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </TableCell>
              <TableCell
                className={`py-3 px-2 font-medium ${
                  pokemon.id == randomPokemon?.pokemonResponseData.id
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                } rounded-lg`}
              >
                {pokemon.id}
              </TableCell>
              <TableCell
                className={`py-3 px-2 ${
                  pokemon.types[0] ===
                  randomPokemon?.pokemonResponseData.types[0].type.name
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                } rounded-lg`}
              >
                {pokemon.types[0]}
              </TableCell>
              <TableCell
                className={`py-3 px-2 ${
                  pokemon.types[1] ===
                  randomPokemon?.pokemonResponseData.types[1]?.type.name
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                } rounded-lg`}
              >
                {pokemon.types[1] || "N/A"}
              </TableCell>
              <TableCell
                className={`py-3 px-2 ${
                  pokemon.color ===
                  randomPokemon?.pokemonSpeciesResponseData.color.name
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                } rounded-lg`}
              >
                {pokemon.color || "N/A"}
              </TableCell>
              <TableCell
                className={`py-3 px-2 ${
                  pokemon.evolutionStage ===
                  randomPokemon?.pokemonSpeciesResponseData.evolution_chain?.name
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                } rounded-lg`}
              >
                {pokemon.evolutionStage || "N/A"}
              </TableCell>
              <TableCell
                className={`py-3 px-2 ${
                  pokemon.height === randomPokemon?.pokemonResponseData.height
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                } rounded-lg`}
              >
                {pokemon.height / 10}m
              </TableCell>
              <TableCell
                className={`py-3 px-2 ${
                  pokemon.weight === randomPokemon?.pokemonResponseData.weight
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                } rounded-lg`}
              >
                {pokemon.weight / 10}kg
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
