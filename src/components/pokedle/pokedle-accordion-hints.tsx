import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Play, Volume2 } from "lucide-react";
import { useGetSingleRandomPokemon } from "@/data/pokemons";
import useStore from "@/store/store";
import { useState, useRef } from "react";

export default function PokedleAccordionHints() {
  const tries = useStore((s) => s.tries);
  const { data: randomPokemon } = useGetSingleRandomPokemon();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playPokemonCry = () => {
    if (!randomPokemon?.pokemonResponseData.cries.latest) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current = new Audio(randomPokemon.pokemonResponseData.cries.latest);
    audioRef.current.play();
    setIsPlaying(true);

    audioRef.current.onended = () => {
      setIsPlaying(false);
    };

    audioRef.current.onerror = () => {
      setIsPlaying(false);
      console.error("Erreur lors de la lecture audio");
    };
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-3/4 mx-auto py-6 px-4 my-12 justify-between border border-gray-200 rounded-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger disabled={tries ? tries < 5 : true}>
          First clue - Ability (5 tries)
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p className="capitalize">
            {randomPokemon?.pokemonResponseData.abilities[0].ability.name}
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger disabled={tries ? tries < 10 : true}>
          Second clue - Sound (10 tries)
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <div className="flex items-center gap-4">
            <p>Écoutez le cri du Pokémon :</p>
            <Button
              onClick={playPokemonCry}
              disabled={!randomPokemon?.pokemonResponseData.cries.latest}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  Lecture...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Jouer le cri
                </>
              )}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger disabled={tries ? tries < 15 : true}>
          Third clue - Description (15 tries)
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            {randomPokemon?.pokemonSpeciesResponseData.flavor_text_entries[0].flavor_text}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
