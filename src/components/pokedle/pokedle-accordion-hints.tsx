import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideZap, Volume2, FileText, Play } from "lucide-react";
import { useGetSingleRandomPokemon } from "@/data/pokemons";
import useStore from "@/store/store";
import { useState, useRef } from "react";

export default function PokedleAccordionHints() {
  const tries = useStore((s) => s.tries);
  const { data: randomPokemon } = useGetSingleRandomPokemon();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showAbility, setShowAbility] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

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
    <div className="w-3/4 mx-auto py-6  my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className={`${tries && tries >= 5 ? "cursor-pointer" : "cursor-not-allowed"}`}>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="bg-green-100 rounded-full p-2">
            <LucideZap className="text-green-500 h-6 w-6" />
          </div>
          <div>
            <CardTitle>Indice Capacité</CardTitle>
            <CardDescription>Révèle la capacité du Pokémon</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {showAbility && tries && tries >= 5 ? (
            <div
              className={`capitalize text-center text-lg font-semibold py-2 rounded bg-green-50 hover:bg-green-100 transition`}
              onClick={() => setShowAbility(false)}
              title="Cacher l'indice"
            >
              {randomPokemon?.pokemonResponseData.abilities[0].ability.name}
            </div>
          ) : (
            <Button
              disabled={tries ? tries < 5 : true}
              className="w-full font-semibold"
              onClick={() => setShowAbility(true)}
            >
              Révéler la capacité
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="bg-indigo-100 rounded-full p-2">
            <Volume2 className="text-indigo-500 h-6 w-6" />
          </div>
          <div>
            <CardTitle>Indice Sonore</CardTitle>
            <CardDescription>Écoutez le cri du Pokémon</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {showSound && tries && tries >= 10 ? (
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={() => { playPokemonCry(); }}
                disabled={!randomPokemon?.pokemonResponseData.cries.latest}
                variant="outline"
                className="w-full font-semibold flex items-center justify-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    Lecture...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Réécouter le cri
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground underline" onClick={() => setShowSound(false)}>
                Cacher l'indice
              </span>
            </div>
          ) : (
            <Button
              onClick={() => { setShowSound(true); playPokemonCry(); }}
              disabled={tries ? tries < 10 : true || !randomPokemon?.pokemonResponseData.cries.latest}
              variant="outline"
              className="w-full font-semibold flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4" />
              Révéler le son
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="bg-pink-100 rounded-full p-2">
            <FileText className="text-pink-500 h-6 w-6" />
          </div>
          <div>
            <CardTitle>Indice Description</CardTitle>
            <CardDescription>Lire l'entrée Pokédex</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {showDescription && tries && tries >= 15 ? (
            <div
              className="whitespace-pre-line text-center text-base font-medium bg-pink-50 rounded p-3 hover:bg-pink-100 transition"
              onClick={() => setShowDescription(false)}
              title="Cacher l'indice"
            >
              {randomPokemon?.pokemonSpeciesResponseData.flavor_text_entries[0].flavor_text}
            </div>
          ) : (
            <Button
              disabled={tries ? tries < 15 : true}
              className="w-full font-semibold"
              onClick={() => setShowDescription(true)}
            >
              Révéler la description
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
