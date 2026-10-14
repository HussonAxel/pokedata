import { Button } from "@pokedata/ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useHydrated, useLocation } from "@tanstack/react-router";
import { CircleCheckIcon, HeartIcon } from "lucide-react";

import { memberKey, pokemonStatusOptions } from "@/features/member/queries";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

/**
 * Favori et capturé, depuis la fiche d'un Pokémon. Sans session, les boutons
 * mènent à la connexion, qui ramène ensuite sur la fiche.
 */
export function PokemonMemberActions({ pokemonId, name }: { pokemonId: number; name: string }) {
  const { data: session, isPending } = authClient.useSession();
  const href = useLocation({ select: (location) => location.href });

  // La session n'est connue du client qu'après l'hydratation : rien avant.
  const hydrated = useHydrated();

  if (!hydrated || isPending) return null;

  if (!session) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/login" search={{ redirect: href }} />}
        >
          <HeartIcon data-icon="inline-start" />
          Se connecter pour suivre {name}
        </Button>
      </div>
    );
  }

  return <MemberToggles pokemonId={pokemonId} name={name} />;
}

function MemberToggles({ pokemonId, name }: { pokemonId: number; name: string }) {
  const queryClient = useQueryClient();
  const { data: status } = useQuery(pokemonStatusOptions(pokemonId));
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: memberKey });
  const favorite = useMutation(orpc.member.setFavorite.mutationOptions({ onSuccess }));
  const caught = useMutation(orpc.member.setCaught.mutationOptions({ onSuccess }));

  // Pendant l'envoi, le bouton montre déjà l'état demandé.
  const isFavorite = favorite.isPending ? favorite.variables.value : (status?.favorite ?? false);
  const isCaught = caught.isPending ? caught.variables.value : (status?.caught ?? false);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={isFavorite ? "default" : "outline"}
        size="sm"
        aria-pressed={isFavorite}
        data-cuelume-toggle=""
        disabled={!status}
        onClick={() => favorite.mutate({ pokemonId, value: !isFavorite })}
      >
        <HeartIcon data-icon="inline-start" />
        {isFavorite ? "Favori" : `Ajouter ${name} aux favoris`}
      </Button>
      <Button
        variant={isCaught ? "default" : "outline"}
        size="sm"
        aria-pressed={isCaught}
        data-cuelume-toggle=""
        disabled={!status}
        onClick={() => caught.mutate({ pokemonId, value: !isCaught })}
      >
        <CircleCheckIcon data-icon="inline-start" />
        {isCaught ? "Capturé" : "Marquer comme capturé"}
      </Button>
    </div>
  );
}
