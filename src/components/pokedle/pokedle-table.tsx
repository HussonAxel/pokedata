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
    <>
      <Table>
        <TableHeader>
          {randomPokemon && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center font-semibold text-green-600"
              >
                Pokémon du jour : {randomPokemon.pokemonResponseData.name} (ID:{" "}
                {randomPokemon.pokemonResponseData.id})
              </TableCell>
            </TableRow>
          )}
          <TableRow className="text-md">
            <TableHead className="font-semibold text-center">Pokémon</TableHead>
            <TableHead className="font-semibold text-center">
              Pokedex number
            </TableHead>
            <TableHead className="font-semibold text-center">Type 1</TableHead>
            <TableHead className="font-semibold text-center">Type 2</TableHead>
            <TableHead className="font-semibold text-center">
              Couleur(s)
            </TableHead>
            <TableHead className="font-semibold text-center">
              Stade d'évolution
            </TableHead>
            <TableHead className="font-semibold text-center">Hauteur</TableHead>
            <TableHead className="font-semibold text-center">Poids</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pokemonDetailedData.map((pokemon) => (
            <TableRow
              key={pokemon.id}
              className="text-center text-md capitalize"
            >
              <TableCell>
                <img
                  src={`/assets/static/sprites/base/${pokemon.id}.webp`}
                  alt={pokemon.label}
                  className="w-16 h-16 object-cover m-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </TableCell>
              <TableCell
                className={`${
                  pokemon.id == randomPokemon?.pokemonResponseData.id
                    ? "bg-[#d7ffdc]"
                    : "bg-[#ffd7d8]"
                }`}
              >
                {pokemon.id}
              </TableCell>
              <TableCell
                className={`${
                  pokemon.types[0] ===
                  randomPokemon?.pokemonResponseData.types[0].type.name
                    ? "bg-[#d7ffdc]"
                    : "bg-[#ffd7d8]"
                }`}
              >
                {pokemon.types[0]}
              </TableCell>
              <TableCell
                className={`${
                  pokemon.types[1] ===
                  randomPokemon?.pokemonResponseData.types[1].type.name
                    ? "bg-[#d7ffdc]"
                    : "bg-[#ffd7d8]"
                }`}
              >
                {pokemon.types[1] || "N/A"}
              </TableCell>
              <TableCell
                className={`${
                  pokemon.color ===
                  randomPokemon?.pokemonSpeciesResponseData.color.name
                    ? "bg-[#d7ffdc]"
                    : "bg-[#ffd7d8]"
                }`}
              >
                {pokemon.color || "N/A"}
              </TableCell>
              <TableCell
                className={`${
                  pokemon.evolutionStage ===
                  randomPokemon?.pokemonSpeciesResponseData.evolution_chain.name
                    ? "bg-[#d7ffdc]"
                    : "bg-[#ffd7d8]"
                }`}
              >
                {pokemon.evolutionStage || "N/A"}
              </TableCell>
              <TableCell
                className={`${
                  pokemon.height === randomPokemon?.pokemonResponseData.height
                    ? "bg-[#d7ffdc]"
                    : "bg-[#ffd7d8]"
                }`}
              >
                {pokemon.height / 10}m
              </TableCell>
              <TableCell
                className={`${
                  pokemon.weight === randomPokemon?.pokemonResponseData.weight
                    ? "bg-[#d7ffdc]"
                    : "bg-[#ffd7d8]"
                }`}
              >
                {pokemon.weight / 10}kg
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
