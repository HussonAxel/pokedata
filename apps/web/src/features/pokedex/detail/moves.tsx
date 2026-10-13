import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pokedata/ui/components/table";

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { formatMoveMethod } from "@/features/pokedex/detail-format";
import { usePokemonDetail } from "@/features/pokedex/detail/context";

export function MovesSection() {
  const { pokemon, gen } = usePokemonDetail();

  return (
    <Section id="attaques">
      <SectionHeader>
        <SectionTitle>Attaques apprises</SectionTitle>
        <SectionDescription>
          Attaques disponibles dans les groupes de versions de la génération consultée. Le niveau 0
          correspond à une attaque apprise autrement qu’en montant de niveau.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        {pokemon.moves.length ? (
          <Table className="min-w-[40rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Attaque</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead className="text-right">Niveau</TableHead>
                <TableHead className="text-right">Puissance</TableHead>
                <TableHead className="text-right">PP</TableHead>
                <TableHead className="text-right">Précision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pokemon.moves.map((move) => (
                <TableRow key={`${move.id}-${move.versionGroupId}-${move.methodId}`}>
                  <TableCell variant="label">
                    <Link
                      to="/encyclopedie/attaques/$attaqueId"
                      params={{ attaqueId: move.identifier }}
                      search={{ gen }}
                      className="hover:underline"
                    >
                      {move.name}
                    </Link>
                  </TableCell>
                  <TableCell variant="muted">{formatMoveMethod(move.methodId)}</TableCell>
                  <TableCell variant="numeric">{move.level || "—"}</TableCell>
                  <TableCell variant="numeric">{move.power ?? "—"}</TableCell>
                  <TableCell variant="numeric">{move.pp ?? "—"}</TableCell>
                  <TableCell variant="numeric">{move.accuracy ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <SectionEmpty>
            {pokemon.isAvailableInGeneration
              ? "Aucune attaque renseignée pour cette génération."
              : `Ce Pokémon n’est répertorié dans aucun jeu de la génération ${gen}. Il ne peut donc pas y être transféré depuis Pokémon HOME.`}
          </SectionEmpty>
        )}
      </SectionContent>
    </Section>
  );
}
