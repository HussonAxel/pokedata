import { Badge } from "@pokedata/ui/components/badge";

import { Fact, FactList } from "@/components/fact-list";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { STAT_LABELS, formatGender } from "@/features/pokedex/detail-format";
import { usePokemonDetail } from "@/features/pokedex/detail/context";

export function TrainingSection() {
  const { pokemon, gen } = usePokemonDetail();
  const effort = pokemon.stats.filter((line) => line.effort > 0);

  return (
    <Section id="entrainement">
      <SectionHeader>
        <SectionTitle>Capture et entraînement</SectionTitle>
        <SectionDescription>
          Valeurs de référence du catalogue ; elles peuvent varier selon les jeux.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        <div className="flex flex-col gap-5">
          <FactList className="@lg:grid-cols-2">
            <Fact label="Taux de capture">{pokemon.captureRate} / 255</Fact>
            <Fact label="Expérience de base">{pokemon.baseExperience ?? "Non renseignée"}</Fact>
            <Fact label="Bonheur de base">{pokemon.baseHappiness ?? "Non renseigné"}</Fact>
            <Fact label="Points d’effort (EV) gagnés">
              {gen < 3
                ? "Système d’EV moderne absent de cette génération"
                : effort.length
                  ? effort
                      .map(
                        (line) =>
                          `${line.effort} ${STAT_LABELS[line.identifier] ?? line.identifier}`,
                      )
                      .join(" · ")
                  : "Aucun"}
            </Fact>
          </FactList>
          <p className="text-muted-foreground">
            Le taux de capture est un coefficient, pas un pourcentage de réussite. L’expérience
            reçue dépend du jeu et du combat.
          </p>
        </div>
      </SectionContent>
    </Section>
  );
}

export function ReproductionSection() {
  const { pokemon, gen } = usePokemonDetail();

  return (
    <Section id="reproduction">
      <SectionHeader>
        <SectionTitle>Sexe et reproduction</SectionTitle>
        <SectionDescription>
          Caractéristiques de l’espèce. Les cycles d’éclosion sont indiqués sans conversion en pas,
          qui dépend du jeu.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        {gen === 1 ? (
          <SectionEmpty>
            La reproduction et le sexe des Pokémon ne sont pas disponibles en première génération.
          </SectionEmpty>
        ) : (
          <FactList className="@lg:grid-cols-2">
            <Fact label="Répartition des sexes">{formatGender(pokemon.genderRate)}</Fact>
            <Fact label="Cycles d’éclosion">{pokemon.hatchCounter ?? "Non renseignés"}</Fact>
            <Fact label="Différences visuelles selon le sexe">
              {pokemon.hasGenderDifferences
                ? "Oui, selon les jeux et les formes"
                : "Aucune répertoriée"}
            </Fact>
            <Fact label="Bébé Pokémon">{pokemon.isBaby ? "Oui" : "Non"}</Fact>
          </FactList>
        )}
      </SectionContent>
    </Section>
  );
}

export function EggGroupsSection() {
  const { pokemon } = usePokemonDetail();

  return (
    <Section id="reproduction-groupes">
      <SectionHeader>
        <SectionTitle>Groupes d’œufs</SectionTitle>
        <SectionDescription>
          Groupes utilisés pour déterminer la compatibilité à la pension.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        {pokemon.eggGroups.length ? (
          <ul className="flex flex-wrap gap-2">
            {pokemon.eggGroups.map((group) => (
              <li key={group.id}>
                <Badge variant="outline">{group.name}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <SectionEmpty>Aucun groupe d’œufs renseigné.</SectionEmpty>
        )}
      </SectionContent>
    </Section>
  );
}
