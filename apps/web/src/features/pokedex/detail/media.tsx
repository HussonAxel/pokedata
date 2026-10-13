import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { usePokemonDetail } from "@/features/pokedex/detail/context";
import { artworkUrl, shinySpriteUrl, spriteUrl } from "@/features/pokedex/sprites";

export function MediaSection() {
  const { pokemon } = usePokemonDetail();
  const media = [
    { src: spriteUrl(pokemon.id), alt: `Sprite de ${pokemon.name}`, caption: "Sprite classique" },
    {
      src: artworkUrl(pokemon.id),
      alt: `Illustration officielle de ${pokemon.name}`,
      caption: "Illustration officielle",
    },
    {
      src: shinySpriteUrl(pokemon.id),
      alt: `Sprite chromatique de ${pokemon.name}`,
      caption: "Version chromatique",
    },
  ];

  return (
    <Section id="medias">
      <SectionHeader>
        <SectionTitle>Médias</SectionTitle>
        <SectionDescription>
          Sprites officiels PokeAPI/Sprites. Les illustrations et les cris seront ajoutés avec le
          futur pipeline média.
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        <div className="grid gap-3 @lg:grid-cols-3">
          {media.map((entry) => (
            <figure
              key={entry.caption}
              className="flex flex-col items-center justify-between gap-3 rounded-lg border bg-muted/50 p-4"
            >
              <img
                src={entry.src}
                alt={entry.alt}
                width={200}
                height={200}
                loading="lazy"
                className="size-40 object-contain"
              />
              <figcaption className="label-mono text-muted-foreground">{entry.caption}</figcaption>
            </figure>
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}
