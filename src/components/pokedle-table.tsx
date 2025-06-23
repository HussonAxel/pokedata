import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const pokemons = [
  {
    id: 1,
    name: "Bulbizarre",
    type1: "Plante",
    type2: "Poison",
    habitat: "Prairie",
    color: "Vert",
    evolutionStage: "1er stade",
    height: "0.7 m",
    weight: "6.9 kg",
  },
  {
    id: 4,
    name: "Salamèche",
    type1: "Feu",
    type2: "-",
    habitat: "Montagne",
    color: "Rouge",
    evolutionStage: "1er stade",
    height: "0.6 m",
    weight: "8.5 kg",
  },
  {
    id: 7,
    name: "Carapuce",
    type1: "Eau",
    type2: "-",
    habitat: "Bord de mer",
    color: "Bleu",
    evolutionStage: "1er stade",
    height: "0.5 m",
    weight: "9.0 kg",
  },
  {
    id: 25,
    name: "Pikachu",
    type1: "Électrik",
    type2: "-",
    habitat: "Forêt",
    color: "Jaune",
    evolutionStage: "1er stade",
    height: "0.4 m",
    weight: "6.0 kg",
  },
  {
    id: 6,
    name: "Dracaufeu",
    type1: "Feu",
    type2: "Vol",
    habitat: "Montagne",
    color: "Rouge",
    evolutionStage: "3e stade",
    height: "1.7 m",
    weight: "90.5 kg",
  },
  {
    id: 150,
    name: "Mewtwo",
    type1: "Psy",
    type2: "-",
    habitat: "Rare",
    color: "Violet",
    evolutionStage: "Unique",
    height: "2.0 m",
    weight: "122.0 kg",
  },
];

export function PokedleTable() {
  console.log("test")
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell colSpan={7}>Number of tries : </TableCell>
          <TableCell>{pokemons.length}</TableCell>
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
      <TableBody>
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
      </TableBody>
    </Table>
  );
}
