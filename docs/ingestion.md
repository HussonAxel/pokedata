# Ingestion des données PokéAPI

Les données du catalogue (espèces, formes, attaques, talents, objets, baies, types,
lieux, rencontres, traductions) proviennent des CSV du dépôt
[`PokeAPI/pokeapi`](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv),
eux-mêmes issus de [`veekun/pokedex`](https://github.com/veekun/pokedex).

On importe les CSV, pas l'API REST : les fichiers sont déjà relationnels,
pèsent environ 42 Mo au total et s'obtiennent en un téléchargement, là où l'API
demanderait des milliers de requêtes pour la même information.

## Licences et attribution

- `PokeAPI/pokeapi` : BSD 3-clause.
- `veekun/pokedex` : MIT.

Les deux autorisent la redistribution en conservant la notice de copyright. La
clause BSD interdit d'utiliser le nom PokéAPI pour promouvoir le site. Une page
de crédits doit citer les deux projets avec leurs notices, et rappeler que
Pokémon et les noms de personnages sont des marques de Nintendo.

## Les deux couches

```
CSV (185 fichiers, ~42 Mo)
   |  ingest:stage — COPY brut, une table par fichier, tout en text
schéma staging     — miroir du dépôt, détruit et reconstruit à chaque import
   |  ingest:transform — transformations SQL, typage, choix de modélisation
schéma public      — modèle Drizzle interrogé par l'application
```

`staging` est mécanique et ne contient aucune décision métier. Faire évoluer le
modèle domaine ne demande donc que de réécrire une transformation sur des données
déjà locales : aucun retéléchargement, aucun code d'ingestion à retoucher.

## Commandes

```bash
pnpm ingest:fetch       # télécharge les CSV dans packages/ingest/.cache/csv
pnpm ingest:stage       # charge les CSV dans le schéma staging
pnpm ingest:transform   # staging -> modèle métier (schéma public)
```

`ingest:fetch` résout la référence Git en SHA de commit et l'enregistre dans
`.cache/source.json`. Pour rejouer un import à l'identique :

```bash
POKEAPI_REF=<sha> pnpm ingest:fetch
```

## Traçabilité

`ingest:stage` écrit une ligne dans `ingest.import_run` : dépôt, référence, SHA,
date du commit source, durée, statut, nombre de tables et de lignes par table.
Cette table est la version du catalogue ; son identifiant alimentera les clés de
cache TanStack Query côté application, pour qu'une publication de nouvelles
données invalide les caches au lieu de dépendre d'un `staleTime`.

Le chargement s'exécute dans une transaction : en cas d'échec, le schéma
`staging` de l'import précédent reste intact, et l'exécution est tout de même
tracée avec son erreur.

## Données historiques

Les valeurs qui changent d'une époque à l'autre sont résolues **une fois à
l'import**, et matérialisées par génération : `pokemon_type`, `pokemon_stat` et
`type_efficacy` portent toutes une colonne `generation_id`. Une requête
applicative n'a donc jamais à arbitrer entre valeur courante et valeur passée.

Les deux tables historiques de veekun n'ont pas la même sémantique, et les
confondre produit des données fausses :

| Table source         | Sémantique                                             | Résolution                                                         |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| `pokemon_types_past` | typage **complet** d'une génération                    | remplace tous les slots                                            |
| `pokemon_stats_past` | correctif **partiel**, seulement les valeurs modifiées | remplace statistique par statistique, repli sur la valeur courante |

Dans les deux cas, une ligne historique s'applique jusqu'à sa génération incluse.

Deux autres règles sont encodées dans la transformation :

- La première génération n'avait qu'une statistique `special` (id 9), scindée en
  Spéciale Attaque et Spéciale Défense à partir de la deuxième. Le périmètre des
  statistiques dépend donc de la génération.
- Une variété n'existe pas avant l'introduction de sa forme : Raichu d'Alola
  appartient à une espèce de première génération mais n'apparaît qu'en septième.

Contrôles de non-régression utiles après un import :

```sql
-- Mélofée : Normal jusqu'en gen 5, Fée à partir de la gen 6
select generation_id, type_id from pokemon_type where pokemon_id = 35;
-- Spectre -> Psy : immunité en gen 1 (bug d'origine), super efficace ensuite
select generation_id, factor from type_efficacy
 where damage_type_id = 8 and target_type_id = 14;
-- Pikachu : 5 statistiques en gen 1 dont `special`, 6 ensuite
select generation_id, count(*) from pokemon_stat where pokemon_id = 25 group by 1;
```

## Points d'attention

- Les quatre tables `*_flavor_text` représentent plus de la moitié du volume.
  Elles sont chargées entières en staging ; le domaine ne doit remonter que le
  français et l'anglais (`language_id` 5 et 9, voir `languages.csv`).
- `pokemon_moves.csv` fait environ 11 Mo : le chargement passe par
  `COPY ... FROM STDIN`, jamais par des `INSERT`.
- Les sprites, illustrations et cris ne sont pas dans ces CSV. Ils vivent dans le
  dépôt séparé [`PokeAPI/sprites`](https://github.com/PokeAPI/sprites) et feront
  l'objet d'une étape distincte.
