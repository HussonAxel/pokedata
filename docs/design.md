# Pokedata — design.md

Direction visuelle « Nuthing » (flavors.design/f/nuthing), adaptée à une
encyclopédie dense en données. Un objet technique plus qu'un site : papier gris
tramé de points, panneaux givrés crème, chiffres en dot-matrix, libellés en
mono capitales, titres en serif. Un seul accent, rouge signal.

Ce fichier fait référence pour les agents : toute nouvelle interface s'y
conforme, et les valeurs vivent dans `packages/ui/src/styles/globals.css`.

## Ambiance

- Calme, précis, « fiche technique » : on mesure, on numérote, on étiquette.
- Le fond respire (trame de points visible) ; le contenu flotte dessus dans des
  panneaux givrés. Pas d'ombres portées lourdes : filets de 1 px et flou.
- Les Pokémon apportent la couleur (teintes de type, illustrations). L'interface,
  elle, reste en encre et papier, plus le rouge signal.

## Couleurs

| Rôle              | Clair                                      | Sombre                               |
| ----------------- | ------------------------------------------ | ------------------------------------ |
| Papier (fond)     | gris chaud `oklch(0.925 0.006 95)`         | presque noir `oklch(0.17 0.004 95)`  |
| Trame de points   | encre à 18 %                               | papier à 14 %                        |
| Panneau givré     | crème `oklch(0.985 0.014 95 / 82%)` + flou | `oklch(0.215 0.005 95 / 82%)` + flou |
| Encre (texte)     | `oklch(0.18 0.005 95)`                     | crème `oklch(0.95 0.012 95)`         |
| Encre secondaire  | `oklch(0.47 0.01 95)`                      | `oklch(0.68 0.01 95)`                |
| Primaire (bouton) | encre pleine, texte crème                  | crème pleine, texte encre            |
| Signal            | rouge `oklch(0.58 0.22 27)`                | `oklch(0.66 0.21 27)`                |
| Filets            | encre à 12 %                               | papier à 14 %                        |

Le **signal** est rare : sélection active, talent caché, état « en direct ». Jamais
en aplat sur une grande surface.

## Typographie

| Usage                                     | Police                | Style                                       |
| ----------------------------------------- | --------------------- | ------------------------------------------- |
| Logo, numéros de Pokédex, grands chiffres | **Doto** (dot-matrix) | gras, chasse fixe, `tabular-nums`           |
| Libellés, en-têtes de colonnes, méta      | **Geist Mono**        | capitales, 11 px, interlettrage 0.12em      |
| Titres de page et de section              | **Newsreader**        | serif, graisse 400–500, interlettrage serré |
| Texte courant, listes, tableaux           | **Geist**             | 14 px, interligne confortable               |

Motif récurrent pour les sur-titres : `pokémon ( 0012 )`, `talent ( 3 )`, en
mono minuscule avec parenthèses espacées.

## Formes

- Rayon de base 8 px ; panneaux 16 px ; boutons et étiquettes 6 px (pas de
  pilules, sauf les badges de type).
- Filets de 1 px partout ; les séparateurs de liste en pointillés (`border-dashed`).
- Panneaux : `bg-card` + `backdrop-blur` + `ring-1 ring-border`.

## Composants

Les primitives shadcn (`packages/ui`) portent le style ; les pages composent sans
restyler (règle de lint `shadcn/no-restyle`). Un traitement nouveau devient une
variante du composant, pas une classe ajoutée à l'usage.

- **En-tête du site** (`SiteHeader`) : barre givrée flottante, détachée du
  panneau principal. Logo en dot-matrix, fil d'Ariane (`Breadcrumb`) en mono capitales.
- **Panneau à colonnes** (`ColumnsPanel`) : flotte sous l'en-tête ; la trame du
  fond reste visible autour. Ligne sélectionnée : encre pleine, point rouge signal.
- **Section** (`Section` + `SectionHeader`/`SectionTitle`/`SectionContent`) :
  une `Card` nommée par son titre serif (`font-heading`).
- **En-tête de page** (`PageHeader` + `PageEyebrow`/`PageTitle`/`PageMeta`).
- **Étiquette** (`Badge`) : mono capitales ; `variant="signal"` pour ce qui doit
  ressortir (talent caché).
- **Numéro** (`DexNumber`) : toujours en Doto, sur 4 chiffres.
- **Faits** (`FactList` / `Fact`) : libellé en mono capitales, valeur en Geist.
- **Cartes de liste** (`Item variant="outline"`) : Pokémon, talents, lieux.
- **Tableaux** (`Table`) : en-têtes en mono capitales, filets pointillés,
  valeurs chiffrées en `TableCell variant="numeric"`.
- **Boutons** : rayon 6 px ; primaire en encre pleine, secondaire en voile.

## À faire / à éviter

- Faire : aligner sur une grille, numéroter, étiqueter, laisser du vide.
- Faire : réserver la couleur aux données (types, statistiques) et au signal.
- Éviter : dégradés, ombres portées marquées, pilules partout, emoji.
- Éviter : plus d'une police serif par écran au-delà des titres.
