# Pokedata — plan des routes

Squelette de navigation, sans données métier. Les identifiants des liens de démonstration sont fictifs. Les routes /moi sont protégées par le layout _auth existant. /dashboard redirige vers /moi.

Chaque page possède son propre index.tsx. Les dossiers organisent les URL ; ajouter route.tsx et Outlet lorsqu’un layout partagé devient nécessaire. Ne pas modifier routeTree.gen.ts à la main. Le catalogue src/features/navigation/pages.ts sert aux menus et au plan du site.

Les données du site sont versionnées par version de jeu : pas de routes `/jeux/...`, la dernière version sert de référence tant que le sélecteur de version n’existe pas. Les filtres, tris, pagination, source statistique, période et seuil de classement seront des search params validés par domaine, pas des routes supplémentaires.

Les fiches de démonstration ne valident pas encore l’existence des identifiants. Ajouter les loaders et notFound avec les vrais référentiels. Les données privées devront aussi être protégées dans les procédures serveur. Les futures métadonnées SEO et règles d’indexation seront définies avant publication.

| Route                                              | Page                         | Univers    |
| -------------------------------------------------- | ---------------------------- | ---------- |
| `/`                                                | Bienvenue sur Pokedata       | Accueil    |
| `/explorer/`                                       | Explorer                     | Explorer   |
| `/strategie/`                                      | Stratégie                    | Stratégie  |
| `/collection/`                                     | Collection                   | Collection |
| `/mini-jeux/`                                      | Mini-jeux                    | Mini-jeux  |
| `/communaute/`                                     | Communauté                   | Communauté |
| `/outils/`                                         | Outils                       | Outils     |
| `/moi/`                                            | Mon espace                   | Mon espace |
| `/pokedex/`                                        | Pokédex national             | Explorer   |
| `/encyclopedie/`                                   | Encyclopédie                 | Explorer   |
| `/recherche/`                                      | Recherche globale            | Explorer   |
| `/pokedex/regionaux/`                              | Pokédex régionaux            | Explorer   |
| `/pokedex/regionaux/$pokedexId/`                   | Détail du Pokédex régional   | Explorer   |
| `/pokedex/$pokemonId/`                             | Fiche Pokémon                | Explorer   |
| `/pokedex/$pokemonId/formes/`                      | Formes et variétés           | Explorer   |
| `/pokedex/$pokemonId/evolutions/`                  | Évolutions                   | Explorer   |
| `/pokedex/$pokemonId/attaques/`                    | Attaques apprises            | Explorer   |
| `/pokedex/$pokemonId/rencontres/`                  | Rencontres                   | Explorer   |
| `/pokedex/$pokemonId/reproduction/`                | Reproduction                 | Explorer   |
| `/pokedex/$pokemonId/medias/`                      | Images et cris               | Explorer   |
| `/pokedex/$pokemonId/historique/`                  | Données par génération       | Explorer   |
| `/encyclopedie/attaques/`                          | Attaques                     | Explorer   |
| `/encyclopedie/attaques/$attaqueId/`               | Détail : Attaques            | Explorer   |
| `/encyclopedie/talents/`                           | Talents                      | Explorer   |
| `/encyclopedie/talents/$talentId/`                 | Détail : Talents             | Explorer   |
| `/encyclopedie/objets/`                            | Objets                       | Explorer   |
| `/encyclopedie/objets/$objetId/`                   | Détail : Objets              | Explorer   |
| `/encyclopedie/baies/`                             | Baies                        | Explorer   |
| `/encyclopedie/baies/$baieId/`                     | Détail : Baies               | Explorer   |
| `/encyclopedie/types/`                             | Types                        | Explorer   |
| `/encyclopedie/types/$typeId/`                     | Détail : Types               | Explorer   |
| `/encyclopedie/mecaniques/`                        | Mécaniques                   | Explorer   |
| `/encyclopedie/mecaniques/$slug/`                  | Détail : Mécaniques          | Explorer   |
| `/strategie/formats/`                              | Formats                      | Stratégie  |
| `/strategie/formats/$formatId/usages/`             | Statistiques d’usage         | Stratégie  |
| `/strategie/formats/$formatId/pokemon/$pokemonId/` | Analyse du Pokémon           | Stratégie  |
| `/strategie/formats/$formatId/cores/`              | Duos et noyaux d’équipe      | Stratégie  |
| `/strategie/formats/$formatId/archetypes/`         | Archétypes                   | Stratégie  |
| `/equipes/`                                        | Équipes publiques            | Stratégie  |
| `/equipes/$equipeId/`                              | Équipe partagée              | Stratégie  |
| `/outils/constructeur-equipe/`                     | Constructeur d’équipe        | Outils     |
| `/outils/degats/`                                  | Calculateur de dégâts        | Outils     |
| `/outils/couverture/`                              | Couverture des types         | Outils     |
| `/outils/vitesse/`                                 | Comparateur de vitesse       | Outils     |
| `/outils/statistiques/`                            | Calculateur de statistiques  | Outils     |
| `/outils/comparateur/`                             | Comparateur de Pokémon       | Outils     |
| `/outils/capture/`                                 | Calculateur de capture       | Outils     |
| `/outils/reproduction/`                            | Outil de reproduction        | Outils     |
| `/outils/shiny/`                                   | Probabilités chromatiques    | Outils     |
| `/outils/evolutions/`                              | Assistant d’évolution        | Outils     |
| `/outils/transferts/`                              | Compatibilité des transferts | Outils     |
| `/collection/modeles/`                             | Modèles de collection        | Collection |
| `/cartes/`                                         | Catalogue de cartes          | Collection |
| `/cartes/$carteId/`                                | Fiche de carte               | Collection |
| `/extensions/`                                     | Extensions du JCC            | Collection |
| `/extensions/$extensionId/`                        | Détail de l’extension        | Collection |
| `/collections/$partageId/`                         | Collection partagée          | Collection |
| `/mini-jeux/defi-du-jour/`                         | Défi du jour                 | Mini-jeux  |
| `/mini-jeux/devine-pokemon/`                       | Devine le Pokémon            | Mini-jeux  |
| `/mini-jeux/silhouettes/`                          | Silhouettes                  | Mini-jeux  |
| `/mini-jeux/cris/`                                 | Reconnais le cri             | Mini-jeux  |
| `/mini-jeux/types/`                                | Quiz des types               | Mini-jeux  |
| `/mini-jeux/evolutions/`                           | Chaînes d’évolution          | Mini-jeux  |
| `/mini-jeux/plus-ou-moins/`                        | Plus ou moins                | Mini-jeux  |
| `/mini-jeux/quiz/`                                 | Quiz                         | Mini-jeux  |
| `/mini-jeux/quiz/$quizId/`                         | Jouer au quiz                | Mini-jeux  |
| `/mini-jeux/grille/`                               | Grille Pokémon               | Mini-jeux  |
| `/mini-jeux/memory/`                               | Memory                       | Mini-jeux  |
| `/mini-jeux/classements/`                          | Classements des mini-jeux    | Mini-jeux  |
| `/communaute/discussions/`                         | Discussions                  | Communauté |
| `/communaute/discussions/$discussionId/`           | Discussion                   | Communauté |
| `/membres/$pseudo/`                                | Profil public                | Communauté |
| `/guides/`                                         | Tous les guides              | Communauté |
| `/guides/$slug/`                                   | Lire un guide                | Communauté |
| `/actualites/`                                     | Actualités                   | Communauté |
| `/actualites/$slug/`                               | Lire une actualité           | Communauté |
| `/moi/equipes/`                                    | Mes équipes                  | Mon espace |
| `/moi/equipes/$equipeId/modifier/`                 | Modifier mon équipe          | Mon espace |
| `/moi/collections/`                                | Mes collections              | Mon espace |
| `/moi/collections/$collectionId/`                  | Ma collection                | Mon espace |
| `/moi/classeurs/`                                  | Mes classeurs                | Mon espace |
| `/moi/classeurs/$classeurId/`                      | Mon classeur                 | Mon espace |
| `/moi/chasses/`                                    | Mes chasses                  | Mon espace |
| `/moi/chasses/$chasseId/`                          | Ma chasse                    | Mon espace |
| `/moi/souhaits/`                                   | Mes souhaits                 | Mon espace |
| `/moi/doublons/`                                   | Mes doublons                 | Mon espace |
| `/moi/favoris/`                                    | Mes favoris                  | Mon espace |
| `/moi/progression/`                                | Ma progression               | Mon espace |
| `/moi/historique/`                                 | Mon historique               | Mon espace |
| `/moi/notifications/`                              | Notifications                | Mon espace |
| `/moi/parametres/`                                 | Paramètres du compte         | Mon espace |
| `/plan-du-site/`                                   | Plan du site                 | Accueil    |
