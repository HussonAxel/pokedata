import { Item, ItemContent, ItemDescription, ItemTitle } from "@pokedata/ui/components/item";

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { usePokemonDetail } from "@/features/pokedex/detail/context";

export function EncountersSection() {
  const { pokemon } = usePokemonDetail();

  return (
    <Section id="rencontres">
      <SectionHeader>
        <SectionTitle>Lieux de rencontre</SectionTitle>
        <SectionDescription>
          Lieux et niveaux connus dans les versions de la génération consultée.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        {pokemon.encounters.length ? (
          <ul className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
            {pokemon.encounters.map((encounter, index) => (
              <li key={`${encounter.locationId}-${encounter.versionId}-${index}`}>
                <Item variant="outline" className="h-full">
                  <ItemContent>
                    <ItemTitle>{encounter.location ?? "Lieu inconnu"}</ItemTitle>
                    <ItemDescription>
                      {encounter.area.replaceAll("-", " ")} · niveaux {encounter.minLevel}–
                      {encounter.maxLevel}
                      {encounter.rarity !== null ? ` · ${encounter.rarity} %` : ""}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </li>
            ))}
          </ul>
        ) : (
          <SectionEmpty>Aucun lieu de rencontre renseigné pour cette génération.</SectionEmpty>
        )}
      </SectionContent>
    </Section>
  );
}
