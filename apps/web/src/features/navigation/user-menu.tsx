import { Button } from "@pokedata/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@pokedata/ui/components/dropdown-menu";
import { Skeleton } from "@pokedata/ui/components/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { LogOutIcon, UserIcon } from "lucide-react";

import { memberKey } from "@/features/member/queries";
import { authClient } from "@/lib/auth-client";

/** Compte du visiteur : lien de connexion, ou menu de son espace une fois connecté. */
export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <Skeleton className="h-7 w-24" />;

  if (!session) {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          nativeButton={false}
          className="max-sm:hidden"
          render={<Link to="/login" />}
        >
          Connexion
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Connexion"
          nativeButton={false}
          className="sm:hidden"
          render={<Link to="/login" />}
        >
          <UserIcon />
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>
        <UserIcon data-icon="inline-start" />
        <span className="max-w-32 truncate max-sm:sr-only">{session.user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/moi" />}>Mon espace</DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/moi/equipes" />}>Mes équipes</DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/moi/favoris" />}>Mes favoris</DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/moi/progression" />}>
            Ma progression
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() =>
              void authClient.signOut({
                fetchOptions: {
                  onSuccess: async () => {
                    // Les données du membre ne doivent pas survivre à sa session.
                    queryClient.removeQueries({ queryKey: memberKey });
                    await router.invalidate();
                    await router.navigate({ to: "/" });
                  },
                },
              })
            }
          >
            <LogOutIcon />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
