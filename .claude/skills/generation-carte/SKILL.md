---
name: generation-carte
description: Use when le changement touche la génération de carte, la graine, la symétrie, les bastions, la connexité ou les placements initiaux.
auto_invoke: true
---

# Génération de carte

## Le contrat

`generateMap(seed)` (`src/rules/mapgen.js`) → `{map, fromFallback}`. Déterministe :
même graine ⇒ même carte, garanti par `mulberry32` (`src/rng.js` — algorithme historique,
**ne jamais le remplacer** : cela casserait toutes les graines connues).

Principe : seule la moitié haute est dessinée, puis pivotée de 180° (`O` ↔ `H`) — les
deux camps héritent exactement du même terrain.

## Le pipeline (une tentative, max `MAPGEN.MAX_ATTEMPTS=120`)

1. Amas par marche aléatoire : `MAPGEN.CLUSTERS` (ruines, bois, cratères, rochers).
2. Forteresse `O` en ligne 0, colonne dans `[HQ_COL_MARGIN, COLS-HQ_COL_MARGIN[`,
   dégagement immédiat des rochers adjacents.
3. Route descendante avec écarts latéraux (`ROAD_TURN_PROB`), jonction horizontale
   garantie sur la ligne de front.
4. Bastions : 3 (`BASTION_COUNT`), espacés (`BASTION_SPACING`), loin de la forteresse
   (`BASTION_HQ_DIST`), au moins un par flanc (`FLANK_LEFT_COL`, `FLANK_RIGHT_OFFSET`).
5. Rotation 180°.
6. Réparation de connexité : ouverture de rochers isolant une poche
   (`REPAIR_ITERATIONS`), symétrique.
7. Filtres : densité dans `[DENSITY_MIN, DENSITY_MAX]`, forteresse praticable
   (`HQ_MIN_OPEN`).

Échec des 120 tentatives → `config.FALLBACK` (carte de secours dessinée à la main,
elle aussi symétrique).

## Placements initiaux

`initialPlacements(map)` : BFS depuis `H`, `MAPGEN.DEPLOY_SLOTS=6` cases libres les plus
proches, armées de `config.INITIAL_FORCES` — les orks sur les cases miroir des slots.

## Câblage

- `newGameState(seed)` (`src/state/state.js`) fixe `SEED`, `MAP`, construit `S`.
- La graine vient de `main.js` : `randomSeed()` si absente, ou le champ « graine » du
  Codex (`regenSeed`/`regenNew`, exposés sur `window` pour les `onclick` inline).

## Modifier la génération

1. Le réglage dans `config.MAPGEN` (jamais de littéral dans `mapgen.js`).
2. La logique dans `generateMap` — **ne consommer le RNG que dans le même ordre** si le
   déterminisme des graines existantes doit survivre ; sinon l'assumer et le dire.
3. `tests/mapgen.test.js` : le déterminisme, la symétrie et la dotation doivent rester
   verts ; ajouter l'invariant nouveau.
4. Codex, section « Champ de bataille », si la promesse au joueur change.
