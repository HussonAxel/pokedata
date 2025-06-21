# Documentation rapide

## 🧰 Librairies installées

- @tanstack/query
- @tanstack/router
- @tanstack/table
- @tanstack/virtual
- nuqs
- shadcn/ui
- zustand
- tailwindcss
- framer-motion
- zod

## 🚀 Fonctionnalités prévues

### 1. 🗂️ Gestion des données Pokémon
- **Pokédex avancé**
  - Filtres : génération, type, région, stats
  - Fiches détaillées : stats, descriptions, évolutions, formes alternatives
  - Pokédex régionaux : Kanto, Johto, Hoenn, etc.
  - Pokédex thématiques : Légendaires, Mythiques, Ultra-Chimères
  - Comparateur de Pokémon (stats côte à côte)
  - Historique des changements : évolution des stats entre générations
- **Collections personnelles**
  - Collection de shinies : photos, dates de capture
  - Collection générale : statut possédé / manquant
  - Tracker de formes régionales : Alola, Galar, Hisui, Paldea
  - Statistiques de collection : pourcentages, graphiques

### 2. ⚔️ Outils de combat & stratégie
- Calculateur de dégâts (tous modificateurs)
- Calculateur faiblesses / résistances
- Calculateur d’IV (à partir des stats observées)
- Calculateur d’EV (optimisation et répartition)
- Calculateur de taux de capture (toutes les Poké Balls)
- Analyseur d’équipes : synergies, faiblesses communes

### 3. 🧬 Reproduction & génétique
- Calculateur d’hérédité : capacités, nature, IV
- Calculateur de groupes d’œufs
- Calculateur de probabilité shiny : méthode Masuda, Charme Chroma, etc.
- Emplacements détaillés : où trouver chaque Pokémon

### 4. 🃏 Trading Card Game (TCG)
- Base de données cartes : catalogue complet par extension
- Prix du marché : valeurs actuelles
- Tracker personnel de collection
- Identification & valorisation des cartes rares
- Historique des prix

### 5. 🎯 Outils interactifs
- Générateur d’équipes aléatoires
- Quiz d’identification : silhouettes, cris, descriptions
- Jeu “Qui est ce Pokémon ?”
- Memory game avec cartes Pokémon
- Trivia (questions culture générale)

### 6. 📊 Statistiques & analyses
- Statistiques personnelles : temps de jeu, captures, etc.
- Suivi de progression : objectifs, achievements
- Journal d’activité utilisateur
- Comparaisons : stats entre utilisateurs
- Données globales : Pokémon les plus populaires, tendances de recherche
- Statistiques d’usage : formats compétitifs, méta analysis

## 🎨 Thèmes & accessibilité
- Thèmes clair / sombre / coloré
- Raccourcis clavier pour navigation rapide
- Multi-langues (i18n)

---


## STEP 1 - POKEDLE
### What is Pokedle ?
Pokedle is a Pokémon-themed Wordle game featuring multiple modes: you must guess the Pokémon from their characteristics, from a silhouette, from a Pokédex entry or from a blurred trading card.
#### Pokedle - Classic - Rules :
- Guess the pokemon based on multiples informations :
  - Type 1
  - Type 2
  - Habitat
  - Color(s)
  - Evolution stage
  - Height
  - Weight

There are colors indications for each category, helping you identify Pokémon more easily. Green is correct, yellow is partially correct and red is incorrect.

##### Pokedle - Classic - Algo
- A random Pokémon has to be queried from the database or the API. Here it'll come from the API (pokeapi.co)
- This pokemon has to be regenerated every 24 hours. It also shouldn't be the same as the previous one.
- Every time the user tries a guess, the game will check if the guess is correct and update the game state accordingly. A counter will keep track of the number of attempts made by the user and will display clues based on the number of attempts. For example, 5 for the ability, 10 for a card of the pokemon, 15 for a silhouette.
