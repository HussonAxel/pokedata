import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@pokedata/ui/components/item";

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import {
  capitalize,
  formatEvolutionCondition,
  formatForm,
  formatVarietyName,
} from "@/features/pokedex/detail-format";
import { usePokemonDetail, type PokemonDetail } from "@/features/pokedex/detail/context";
import { EvolutionTree } from "@/features/pokedex/evolution-tree";
import { PokemonLinkCard } from "@/features/pokedex/pokemon-link-card";
import { PokemonSprite } from "@/features/pokedex/pokemon-sprite";

function evolutionStages(pokemon: PokemonDetail) {
  return pokemon.evolutionFamily.map((stage) => ({
    speciesId: stage.speciesId,
    pokemonId: stage.pokemonId,
    identifier: stage.identifier,
    name: formatVarietyName(stage.name, stage.formSuffix),
    evolvesFromSpeciesId: stage.evolvesFromSpeciesId,
    // Plusieurs lignes du catalogue donnent parfois le même texte (lieu ou capacité non détaillés).
    condition: stage.conditions.length
      ? [...new Set(stage.conditions.map(formatEvolutionCondition))].join(" ou ")
      : null,
  }));
}

export function EvolutionSection() {
  const { pokemon, gen } = usePokemonDetail();

  return (
    <Section id="evolutions">
      <SectionHeader>
        <SectionTitle>Évolutions</SectionTitle>
        <SectionDescription>
          Lignée d’évolution de {formatVarietyName(pokemon.name, pokemon.formSuffix)} en génération{" "}
          {gen}.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        <EvolutionTree stages={evolutionStages(pokemon)} currentPokemonId={pokemon.id} gen={gen} />
      </SectionContent>
    </Section>
  );
}

/** Variétés absentes de la lignée affichée (autre forme d'une espèce, Méga-évolutions) et formes. */
export function FormsSection() {
  const { pokemon, gen } = usePokemonDetail();
  const familyPokemonIds = new Set(pokemon.evolutionFamily.map((stage) => stage.pokemonId));
  const formOf = (identifier: string) =>
    identifier.startsWith(`${pokemon.speciesIdentifier}-`)
      ? identifier.slice(pokemon.speciesIdentifier.length + 1)
      : "";
  const varieties = pokemon.varieties.filter((entry) => !familyPokemonIds.has(entry.id));
  const forms = pokemon.forms.filter((form) => !form.isDefault);

  if (!varieties.length && !forms.length) return null;

  return (
    <Section id="formes">
      <SectionHeader>
        <SectionTitle>Autres formes</SectionTitle>
        <SectionDescription>
          Variétés et formes de {pokemon.name} présentes en génération {gen}.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        <ul className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
          {varieties.map((entry) => (
            <li key={entry.id}>
              <PokemonLinkCard
                pokemonId={entry.id}
                identifier={entry.identifier}
                dexNumber={pokemon.speciesId}
                name={formatVarietyName(
                  pokemon.name,
                  entry.isDefault ? "" : formOf(entry.identifier),
                )}
                gen={gen}
              >
                <ItemDescription>
                  {entry.isDefault ? "Variété principale" : `Variété de ${pokemon.name}`}
                </ItemDescription>
              </PokemonLinkCard>
            </li>
          ))}
          {forms.map((form) => (
            <li key={`form-${form.id}`}>
              <Item variant="outline" className="h-full flex-nowrap">
                <ItemMedia>
                  <PokemonSprite pokemonId={pokemon.id} formIdentifier={form.formIdentifier} />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemDescription>Forme de {pokemon.name}</ItemDescription>
                  <ItemTitle>
                    {capitalize(formatForm(form.formIdentifier || form.identifier))}
                  </ItemTitle>
                  <ItemDescription>{formDescription(form)}</ItemDescription>
                </ItemContent>
              </Item>
            </li>
          ))}
        </ul>
      </SectionContent>
    </Section>
  );
}

function formDescription(form: PokemonDetail["forms"][number]) {
  return [
    form.isDefault && form.formIdentifier ? `Forme ${formatForm(form.formIdentifier)}` : null,
    form.isMega ? "Méga-Évolution" : null,
    form.isBattleOnly ? "En combat uniquement" : null,
    form.introducedIn !== null ? `Depuis la génération ${form.introducedIn}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
