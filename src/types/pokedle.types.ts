export type Pokemon = {
  name: string;
  url: string;
};

export type PokemonItem = {
  value: string;
  label: string;
  artwork: string;
  id: string;
  height: number;
  weight: number;
  types: string[];
  habitat?: string;
  color?: string;
  evolutionChain?: string[];
};
