import { orpc } from "@/utils/orpc";

/*
 * Données du membre connecté. Elles changent à chaque action : pas de staleTime
 * long comme pour le catalogue, et chaque mutation invalide la clé `member`.
 */

export const memberKey = orpc.member.key();

export const memberSummaryOptions = () => orpc.member.summary.queryOptions();

export const pokemonStatusOptions = (pokemonId: number) =>
  orpc.member.pokemonStatus.queryOptions({ input: { pokemonId } });

export const favoritesOptions = () =>
  orpc.member.favorites.queryOptions({ input: { locale: "fr" } });

export const progressionOptions = () =>
  orpc.member.progression.queryOptions({ input: { locale: "fr" } });

export const teamsOptions = () => orpc.member.teams.list.queryOptions();

export const teamOptions = (id: string) =>
  orpc.member.teams.get.queryOptions({ input: { id, locale: "fr" } });
