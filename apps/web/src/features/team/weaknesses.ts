/** Table d'efficacité d'une génération (voir `pokedex.typeChart`). */
export type TypeChartData = {
  types: { id: number; identifier: string; name: string }[];
  /** `factors[attaque][défense]`, en pourcentage : 200 = ×2, 0 = immunité. */
  factors: number[][];
};

export type TeamAnalysisRow = {
  identifier: string;
  name: string;
  /** Multiplicateur subi par chaque membre, dans l'ordre de l'équipe. */
  multipliers: number[];
  weak: number;
  resist: number;
  immune: number;
};

/**
 * Pour chaque type d'attaque, ce que subit chaque membre de l'équipe (types
 * combinés) et le décompte des faiblesses, résistances et immunités.
 */
export function analyzeTeam(chart: TypeChartData, members: { types: string[] }[]) {
  const column = new Map(chart.types.map((entry, index) => [entry.identifier, index]));

  return chart.types.map((attack, row): TeamAnalysisRow => {
    const multipliers = members.map((member) =>
      member.types.reduce((product, identifier) => {
        const index = column.get(identifier);
        return index === undefined
          ? product
          : (product * (chart.factors[row]?.[index] ?? 100)) / 100;
      }, 1),
    );

    return {
      identifier: attack.identifier,
      name: attack.name,
      multipliers,
      weak: multipliers.filter((value) => value > 1).length,
      resist: multipliers.filter((value) => value > 0 && value < 1).length,
      immune: multipliers.filter((value) => value === 0).length,
    };
  });
}

/** Types d'attaque qui touchent au moins la moitié de l'équipe sans qu'elle ne résiste. */
export function threats(rows: TeamAnalysisRow[], size: number) {
  return rows.filter(
    (row) => size > 0 && row.weak >= Math.ceil(size / 2) && row.resist + row.immune < row.weak,
  );
}
