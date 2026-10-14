import { Badge } from "@pokedata/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pokedata/ui/components/table";
import { cn } from "@pokedata/ui/lib/utils";

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { MULTIPLIER_CLASSES, formatMultiplier } from "@/features/pokedex/multiplier";
import { TypeBadge } from "@/features/pokedex/type-badge";
import { analyzeTeam, threats, type TypeChartData } from "@/features/team/weaknesses";

/** Couverture défensive : ce que chaque type d'attaque inflige à chaque membre. */
export function TeamAnalysis({
  chart,
  members,
}: {
  chart: TypeChartData;
  members: { id: number; name: string; types: string[] }[];
}) {
  const rows = analyzeTeam(chart, members);
  const shared = threats(rows, members.length);

  return (
    <Section id="analyse">
      <SectionHeader>
        <SectionTitle>Couverture défensive</SectionTitle>
        <SectionDescription>
          Multiplicateur subi par chaque membre selon le type de l’attaque adverse, hors talents et
          objets.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        {members.length ? (
          <div className="flex flex-col gap-5">
            {shared.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="label-mono text-muted-foreground">Menaces communes</span>
                {shared.map((row) => (
                  <Badge key={row.identifier} variant="signal">
                    {row.name} · {row.weak}/{members.length}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Aucun type d’attaque ne touche la moitié de l’équipe sans qu’elle résiste.
              </p>
            )}
            <Table className="min-w-[36rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Attaque</TableHead>
                  {members.map((member) => (
                    <TableHead key={member.id} className="text-center">
                      <span className="block max-w-20 truncate">{member.name}</span>
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Faibles</TableHead>
                  <TableHead className="text-right">Résistent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.identifier}>
                    <TableCell variant="label">
                      <span className="flex items-center gap-2">
                        <TypeBadge identifier={row.identifier} label={row.name} />
                        {row.name}
                      </span>
                    </TableCell>
                    {row.multipliers.map((multiplier, index) => (
                      <TableCell key={members[index]?.id ?? index}>
                        <span
                          className={cn(
                            "mx-auto grid h-6 w-10 place-items-center font-mono text-xs font-semibold",
                            MULTIPLIER_CLASSES[multiplier],
                          )}
                        >
                          {multiplier === 1 ? "" : formatMultiplier(multiplier)}
                        </span>
                      </TableCell>
                    ))}
                    <TableCell variant="numeric">{row.weak || "—"}</TableCell>
                    <TableCell variant="numeric">{row.resist + row.immune || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <SectionEmpty>Ajoutez des Pokémon pour voir leurs faiblesses communes.</SectionEmpty>
        )}
      </SectionContent>
    </Section>
  );
}
