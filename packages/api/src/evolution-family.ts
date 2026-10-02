/** Une variété candidate d'une espèce de la lignée, avec les liens d'évolution de son espèce. */
export type FamilyCandidate = {
  speciesId: number;
  speciesIdentifier: string;
  speciesGeneration: number;
  evolvesFromSpeciesId: number | null;
  pokemonId: number;
  identifier: string;
  isDefault: boolean;
};

/**
 * Génération d'introduction de chaque région : une espèce apparue la même
 * génération que la forme régionale de son parent en est l'évolution propre
 * (Fort-Ivoire pour Canarticho de Galar, Terraiju pour Ptitard de Paldea).
 */
const REGION_GENERATIONS: Record<string, number> = { alola: 7, galar: 8, hisui: 8, paldea: 9 };

/** Suffixe de forme d'une variété (`galar` pour `slowbro-galar`), vide pour la variété par défaut. */
export function formSuffix(
  variety: Pick<FamilyCandidate, "identifier" | "isDefault" | "speciesIdentifier">,
) {
  const prefix = `${variety.speciesIdentifier}-`;

  return !variety.isDefault && variety.identifier.startsWith(prefix)
    ? variety.identifier.slice(prefix.length)
    : "";
}

/**
 * Famille d'évolution vue depuis une variété : pour chaque espèce de la lignée,
 * la variété qui porte la même forme que `current` (Ramoloss de Galar → Flagadoss
 * de Galar), sinon la variété par défaut. Les espèces qui n'appartiennent pas à
 * cette forme sont écartées, avec leurs descendants : Persian pour Miaouss de
 * Galar, Fort-Ivoire pour Canarticho ordinaire.
 *
 * Le catalogue ne relie pas une forme à son évolution : l'heuristique s'appuie
 * sur les identifiants (`espèce-forme`) et la génération d'apparition.
 */
export function resolveEvolutionFamily<T extends FamilyCandidate>(
  candidates: T[],
  current: Pick<FamilyCandidate, "identifier" | "isDefault" | "speciesIdentifier">,
): T[] {
  const suffix = formSuffix(current);

  const speciesIds = [...new Set(candidates.map((entry) => entry.speciesId))];
  const varietiesOf = (speciesId: number) =>
    candidates.filter((entry) => entry.speciesId === speciesId);
  const species = (speciesId: number) => varietiesOf(speciesId)[0];
  const hasForm = (speciesId: number, form: string) =>
    varietiesOf(speciesId).some((entry) => formSuffix(entry) === form);

  /** Région dont cette espèce est l'évolution exclusive, ou `undefined`. */
  const exclusiveRegion = (speciesId: number) => {
    const entry = species(speciesId);
    if (!entry || entry.evolvesFromSpeciesId === null) return undefined;
    const parentId = entry.evolvesFromSpeciesId;

    return Object.keys(REGION_GENERATIONS).find(
      (region) =>
        REGION_GENERATIONS[region] === entry.speciesGeneration &&
        !hasForm(speciesId, region) &&
        hasForm(parentId, region),
    );
  };

  const isIncluded = (speciesId: number): boolean => {
    const entry = species(speciesId);
    if (!entry) return false;

    const parentId = entry.evolvesFromSpeciesId;
    if (parentId !== null && speciesIds.includes(parentId) && !isIncluded(parentId)) return false;

    const region = exclusiveRegion(speciesId);
    if (region) return region === suffix;
    if (!suffix || hasForm(speciesId, suffix) || !(suffix in REGION_GENERATIONS)) return true;

    // Une espèce sans forme régionale reste dans la lignée, sauf si une espèce
    // sœur est l'évolution propre de cette région.
    return !speciesIds.some(
      (sibling) =>
        sibling !== speciesId &&
        species(sibling)?.evolvesFromSpeciesId === parentId &&
        exclusiveRegion(sibling) === suffix,
    );
  };

  return speciesIds.filter(isIncluded).map((speciesId) => {
    const varieties = varietiesOf(speciesId);
    const chosen =
      (suffix ? varieties.find((entry) => formSuffix(entry) === suffix) : undefined) ??
      varieties.find((entry) => entry.isDefault) ??
      varieties[0]!;

    return chosen;
  });
}

export function isRegionalForm(suffix: string) {
  return suffix in REGION_GENERATIONS;
}

/**
 * Conditions qui mènent à une variété. Le catalogue les rattache à l'espèce, pas
 * à la forme : quand une espèce en compte de deux sortes, la forme régionale
 * évolue par objet (Galarica) et la variété ordinaire par niveau ou échange.
 */
export function conditionsForForm<T extends { hasTriggerItem: boolean }>(
  conditions: T[],
  suffix: string,
) {
  if (
    !conditions.some((entry) => entry.hasTriggerItem) ||
    conditions.every((entry) => entry.hasTriggerItem)
  ) {
    return conditions;
  }

  return conditions.filter((entry) => entry.hasTriggerItem === isRegionalForm(suffix));
}
