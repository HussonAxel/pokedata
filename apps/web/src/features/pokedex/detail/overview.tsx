import { Badge } from "@pokedata/ui/components/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@pokedata/ui/components/item";
import {
  PreviewCard,
  PreviewCardPanel,
  PreviewCardTrigger,
} from "@pokedata/ui/components/preview-card";
import { Link } from "@tanstack/react-router";
import { EyeOffIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { Fact, FactList } from "@/components/fact-list";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEmpty,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { STAT_LABELS, formatAbilitySlot } from "@/features/pokedex/detail-format";
import { usePokemonDetail } from "@/features/pokedex/detail/context";
import { TypeRelations } from "@/features/pokedex/type-relations";

/** La dernière version disponible sert d'introduction ; les variantes restent consultables. */
export function DescriptionSection() {
  const { pokemon } = usePokemonDetail();
  const [description, ...others] = [
    ...new Set(
      [...pokemon.descriptions]
        .sort((a, b) => b.versionId - a.versionId)
        .map(({ flavorText }) => flavorText.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    ),
  ];

  return (
    <Section id="descriptions">
      <SectionHeader>
        <SectionTitle>Description du Pokédex</SectionTitle>
      </SectionHeader>
      <SectionContent>
        <div className="flex flex-col gap-4">
          {description ? (
            <>
              <p className="font-heading text-lg/relaxed">{description}</p>
              {others.length ? (
                <details>
                  <summary className="label-mono cursor-pointer text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4">
                    Autres descriptions ({others.length})
                  </summary>
                  <ul className="mt-3 flex flex-col gap-3">
                    {others.map((text) => (
                      <li key={text} className="border-l-2 border-dashed pl-3">
                        {text}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </>
          ) : (
            <SectionEmpty>Aucune description française pour cette espèce.</SectionEmpty>
          )}
        </div>
      </SectionContent>
    </Section>
  );
}

export function StatsSection() {
  const { pokemon, gen } = usePokemonDetail();

  return (
    <Section id="statistiques">
      <SectionHeader>
        <SectionTitle>Statistiques de base</SectionTitle>
        <SectionDescription>
          Génération {gen} · Valeurs de base, avant le niveau, la nature et l’entraînement.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        <dl className="flex flex-col gap-3">
          {pokemon.stats.map((line) => (
            <div
              key={line.identifier}
              className="grid grid-cols-[minmax(0,7rem)_3ch_minmax(0,1fr)] items-center gap-3"
            >
              <dt className="label-mono text-muted-foreground">
                {STAT_LABELS[line.identifier] ?? line.identifier}
              </dt>
              <dd className="text-right font-dot text-base font-black tabular-nums">
                {line.baseStat}
              </dd>
              <dd aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full w-(--stat-width) rounded-full bg-primary"
                  style={
                    {
                      "--stat-width": `${Math.min((line.baseStat / 255) * 100, 100)}%`,
                    } as CSSProperties
                  }
                />
              </dd>
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,7rem)_3ch_minmax(0,1fr)] items-center gap-3 border-t border-dashed pt-3">
            <dt className="label-mono">Total</dt>
            <dd className="text-right font-dot text-base font-black tabular-nums">
              {pokemon.statTotal}
            </dd>
          </div>
        </dl>
      </SectionContent>
    </Section>
  );
}

export function TypeRelationsSection() {
  const { pokemon, gen } = usePokemonDetail();

  return (
    <Section id="relations">
      <SectionHeader>
        <SectionTitle>Relations de types</SectionTitle>
        <SectionDescription>
          Génération {gen} · Multiplicateurs d’efficacité entre types. Hors talents, objets et
          effets de combat.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        <TypeRelations
          types={pokemon.types}
          defense={pokemon.matchups}
          offense={pokemon.offensiveMatchups}
          gen={gen}
        />
      </SectionContent>
    </Section>
  );
}

export function AbilitiesSection() {
  const { pokemon, gen } = usePokemonDetail();

  return (
    <Section id="talents">
      <SectionHeader>
        <SectionTitle>Talents</SectionTitle>
      </SectionHeader>
      <SectionContent>
        {pokemon.abilities.length ? (
          <ul className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
            {pokemon.abilities.map((ability) => (
              <li key={ability.id}>
                <PreviewCard>
                  <PreviewCardTrigger
                    delay={250}
                    closeDelay={200}
                    render={
                      <Item
                        variant="outline"
                        className="h-full"
                        render={
                          <Link
                            to="/encyclopedie/talents/$talentId"
                            params={{ talentId: ability.identifier }}
                            search={{ gen }}
                          />
                        }
                      >
                        <ItemContent>
                          <ItemTitle>{ability.name}</ItemTitle>
                          <ItemDescription>{formatAbilitySlot(ability)}</ItemDescription>
                        </ItemContent>
                        {ability.isHidden ? (
                          <ItemActions>
                            <Badge variant="signal">
                              <EyeOffIcon data-icon="inline-start" />
                              Caché
                            </Badge>
                          </ItemActions>
                        ) : null}
                      </Item>
                    }
                  />
                  <PreviewCardPanel side="top">
                    <p>
                      {ability.description ??
                        "Aucune description française disponible pour cette génération."}
                    </p>
                  </PreviewCardPanel>
                </PreviewCard>
              </li>
            ))}
          </ul>
        ) : (
          <SectionEmpty>Aucun talent renseigné.</SectionEmpty>
        )}
      </SectionContent>
    </Section>
  );
}

export function IdentitySection() {
  const { pokemon } = usePokemonDetail();
  const status =
    [
      pokemon.isBaby ? "Bébé Pokémon" : null,
      pokemon.isLegendary ? "Légendaire" : null,
      pokemon.isMythical ? "Fabuleux" : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Pokémon ordinaire";

  return (
    <Section id="identite">
      <SectionHeader>
        <SectionTitle>Informations complémentaires</SectionTitle>
      </SectionHeader>
      <SectionContent>
        <FactList className="grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
          <Fact label="Statut">{status}</Fact>
          {pokemon.names.map((entry) => (
            <Fact
              key={entry.language}
              label={`Nom ${LANGUAGE_LABELS[entry.language] ?? entry.language}`}
            >
              {entry.name}
            </Fact>
          ))}
        </FactList>
      </SectionContent>
    </Section>
  );
}

const LANGUAGE_LABELS: Record<string, string> = { fr: "français", en: "anglais" };
