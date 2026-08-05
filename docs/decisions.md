# Refactor decisions

Written by `/refactor-game`. Records what the code cannot express: why this layout, why
this toolchain, what was deliberately not touched, what is still undecided.

Read by `/scaffold-claude` so it does not have to re-deduce any of it.

## Archetype

Selected: `turn-based board`
Why: grille discrète 12×10, une action à la fois, pas de boucle continue, machine à
phases explicite (`idle/sel/moved/target/preview/shop/ai/anim/over`), rendu réactif aux
changements d'état. L'état vivait déjà dans des objets JS (`S`, `MAP`), pas dans le DOM.
Does not fit: la génération procédurale de carte (PRNG seedé + symétrie 180°, module
`rules/mapgen.js` dédié) ; le flux de tour asynchrone piloté par `await sleep(...)`
entrelacé avec les règles (isolé dans `loop/turns.js`) ; l'IA Ork (module de décisions
pures `rules/ai.js`, exécution dans la boucle) ; le sous-système son/vibration Web Audio
(`src/audio.js`).

## Toolchain

Branch: `zero-build`
Triggering signal: aucun signal Vite — pas d'import npm, pas de TypeScript, pas d'assets
à bundler (tout est SVG inline), ~1300 lignes < 2000. Le défaut s'applique.
Node: 22
Test runner: `node:test`

## Layout

| Module | Responsibility | Came from |
| --- | --- | --- |
| `src/config.js` | toutes les valeurs de réglage (plateau, unités, combat, IA, délais, sons) | constantes et littéraux dispersés, l. 300–520 et partout |
| `src/rng.js` | mulberry32 (algorithme historique) + `randomSeed()` pour les points d'entrée | l. 320–321, 507 |
| `src/rules/grid.js` | géométrie du plateau, occupation des cases | l. 498–504, 675 |
| `src/rules/combat.js` | dégâts, riposte, cibles à portée, barres de PV | l. 694–721 |
| `src/rules/movement.js` | Dijkstra de déplacement, chemins, empreintes de tir, zone de menace, champ de distance IA | l. 656–730, 909–922 |
| `src/rules/mapgen.js` | génération procédurale symétrique, placements initiaux | l. 323–448 |
| `src/rules/turn.js` | revenu, soin, capture, condition de victoire | l. 879–906 |
| `src/rules/deploy.js` | condition de déploiement | l. 1157–1160 |
| `src/rules/ai.js` | décisions IA : achat, meilleure attaque, objectif et point d'avance | l. 938–998 |
| `src/state/state.js` | `S`, `MAP`, `SEED`, fabrique `newGameState` | l. 495–522 |
| `src/render/board.js` | tuiles, pions, bâtiments, overlays, bannière, effets flottants, layout | l. 530–653, 822–827, 1012 |
| `src/render/hud.js` | barre haute, panneau bas, fiche d'unité, boutique | l. 1083–1156 |
| `src/render/combat-panel.js` | relevé de combat détaillé | l. 1050–1081 |
| `src/render/codex.js` | modale Codex, écran de fin | l. 1184–1305 |
| `src/render/icons.js` | symboles tactiques SVG | l. 461–475 |
| `src/input/input.js` | écouteurs bruts → intentions | l. 733–738, 1306–1309 |
| `src/loop/turns.js` | orchestration : intentions, résolution, tours, IA, délais | l. 740–1008 |
| `src/audio.js` | Web Audio + vibration | l. 1169–1181 |
| `src/main.js` | câblage des couches, graine, démarrage | l. 1311–1312 |

## Rules extracted

| Rule | Module | Test | Notes |
| --- | --- | --- | --- |
| clef de case, appartenance à la grille | `rules/grid.js` | `tests/grid.test.js` | |
| occupation, arrêt possible | `rules/grid.js` | `tests/grid.test.js` | les unités détruites ne bloquent pas |
| dégâts (Codex, Waaagh!, couvert, plancher) | `rules/combat.js` | `tests/combat.test.js` | formule inchangée à l'identique |
| riposte | `rules/combat.js` | `tests/combat.test.js` | jamais pour le tir indirect ni hors contact |
| cibles à portée | `rules/combat.js` | `tests/combat.test.js` | tir indirect immobile |
| cases atteignables (Dijkstra) | `rules/movement.js` | `tests/movement.test.js` | ennemis bloquent, alliés traversables |
| chemin, empreinte de tir, zone de menace | `rules/movement.js` | `tests/movement.test.js` | `threatZone` ne permute plus `S.reach` en place (calcul local, résultat identique) |
| champ de distance IA | `rules/movement.js` | `tests/movement.test.js` | sans limite de mouvement |
| génération de carte | `rules/mapgen.js` | `tests/mapgen.test.js` | même graine ⇒ même carte ; symétrie 180° |
| placements initiaux | `rules/mapgen.js` | `tests/mapgen.test.js` | armées en miroir |
| revenu, soin, capture, victoire | `rules/turn.js` | `tests/turn.test.js` | |
| condition de déploiement | `rules/deploy.js` | `tests/deploy.test.js` | |
| achat IA, attaque IA, avance IA | `rules/ai.js` | `tests/ai.test.js` | la table d'achat `AI.BUY` remplace le ternaire enchaîné, même ordre d'évaluation et mêmes tirages |

## Randomness and time

| Call site | Classification | Handling |
| --- | --- | --- |
| graine de carte (`newGame` sans argument, l. 507) | rule-bearing | `randomSeed()` dans `src/rng.js`, appelé uniquement par `main.js` |
| tirages d'achat IA (`aiBuy`, l. 941–942) | rule-bearing | rng injecté (`chooseBuy(req,rng)`) ; en jeu, `mulberry32(randomSeed())` seedé par session pour reproduire le `Math.random` non seedé d'origine |
| `await sleep(...)` d'animation (12 sites) | cosmetic (rythme d'animation) | restés dans `loop/turns.js`, délais nommés dans `config.T` |
| constantes internes de mulberry32 (`0x6D2B79F5`, `2^32`) | algorithme, pas config | laissées dans `src/rng.js` — en changer casserait la reproductibilité des cartes |

Seed: user-provided (champ « graine » du Codex) ou aléatoire au démarrage.
Aucun `Date.now()` ni `performance.now()` dans le prototype.

## Deliberately left alone

- Le soin sur bâtiment allié rend **20 points (2 PV affichés)** par cycle, mais le Codex
  dit « récupère 2 PV par cycle » en parlant de barres — texte et code cohérents entre
  eux, aucune correction à faire, juste un vocabulaire à connaître (`BUILDING_HEAL=20`).
- `unitCard(u,foe)` accepte un second paramètre jamais lu ; signature conservée.
- `renderHud(keepMsg)` accepte un paramètre jamais lu ; `showTerrain` continue de
  l'appeler avec `true` comme dans le prototype.
- Le compteur `cyc` de « Suivante » n'est pas remis à zéro entre les parties, comme dans
  le prototype (le modulo le garde valide).
- `uid` continue de croître d'une partie à l'autre sans remise à zéro (comportement
  d'origine, sans conséquence car les ids ne servent qu'au DOM).
- La bannière affiche toujours « Cycle 1 — Astartes » après régénération de carte, même
  en pleine partie recommencée — comportement d'origine.
- L'ordre de riposte : l'IA attend 150 ms là où le joueur attend 180 ms (`AI_COUNTER_DELAY`
  vs `COUNTER_DELAY`) — asymétrie d'origine conservée.

## Open questions

- Les poids de l'évaluation d'attaque IA (`KILL_BONUS=70`, `COUNTER_WEIGHT=.9`,
  `TERRAIN_WEIGHT=3`, `COST_WEIGHT=2`, `INDIRECT_BONUS=12`) n'ont aucune justification
  dans le code ni dans le Codex ; ils sont copiés tels quels dans `config.AI`. Leur
  équilibre relatif est inconnu.
- Le RNG de l'IA est désormais seedé par session (`mulberry32(randomSeed())`). Si l'on
  voulait des replays entièrement déterministes par graine, il suffirait de le seeder
  depuis `SEED` — décision volontairement non prise pour ne pas changer le comportement
  observable (l'original utilisait `Math.random` non seedé).
- `src/rules/mapgen.js` importe `mulberry32` depuis `src/rng.js` (et non `config.js`
  seul) — dérogation assumée au contrat d'import des règles, le PRNG étant pur.
- Le rendu (`render/board.js`, `render/hud.js`) appelle des règles pures en lecture
  (`threatZone`, `canStop`, `atkFootprint`, `bars`, `canDeploy`) — dérogation assumée :
  recalculer la zone de menace à chaque rendu est le comportement d'origine.
