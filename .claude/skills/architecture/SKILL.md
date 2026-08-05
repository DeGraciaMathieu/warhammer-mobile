---
name: architecture
description: Use when il faut situer un changement dans les couches du projet, comprendre qui importe qui, ou décider dans quel fichier écrire du nouveau code.
auto_invoke: true
---

# Architecture

Couches à sens d'import strictement descendant. Un import qui remonte est une violation.

| Module | Rôle | Dépend de |
| --- | --- | --- |
| `src/config.js` | toutes les valeurs de réglage, aucune logique | rien |
| `src/rng.js` | `mulberry32(seed)` (PRNG historique), `randomSeed()` (points d'entrée uniquement) | rien |
| `src/rules/grid.js` | `key`, `inb`, `unitAt`, `bldAt`, `canStop` | config |
| `src/rules/combat.js` | `dmgDetail`, `dmgCalc`, `counterOf`, `targetsFrom`, `bars`, `toPV` | config, grid |
| `src/rules/movement.js` | `reachable` (Dijkstra), `pathTo`, `atkFootprint`, `threatZone`, `costField` | config, grid |
| `src/rules/mapgen.js` | `generateMap(seed)`, `initialPlacements(map)` | config, rng |
| `src/rules/turn.js` | `turnIncome`, `healedHp`, `captureProgress`, `winnerOf` | config |
| `src/rules/deploy.js` | `canDeploy` | config, grid |
| `src/rules/ai.js` | `chooseBuy`, `bestAttack`, `advanceObjective`, `bestAdvanceSpot` | config, grid, combat |
| `src/state/state.js` | `S`, `MAP`, `SEED`, `tile`, `nextId`, `newGameState(seed)` | config, rules/mapgen |
| `src/render/board.js` | tuiles, pions, bâtiments, overlays, `banner`, `floatFX`, `layout`, `TS` | config, state, rules (lecture) |
| `src/render/hud.js` | barre haute, panneau bas, fiche d'unité, boutique, `addBtn`, `msg` | config, state, rules (lecture), audio |
| `src/render/combat-panel.js` | relevé de combat détaillé (`renderCombatPanel`) | config, state, rules/combat |
| `src/render/codex.js` | modale Codex (doc vivante), écran de fin | config, state, audio |
| `src/render/render.js` | composite `render()` = blds + units + overlays + hud | render/* |
| `src/render/icons.js`, `src/render/dom.js` | symboles SVG, helper `$` | rien |
| `src/input/input.js` | `initInput(handlers)` : événements bruts → intentions | rien (handlers injectés) |
| `src/loop/turns.js` | orchestration : `onTap`, actions joueur, tours, IA, délais `config.T` | tout le dessus |
| `src/audio.js` | `blip`, `play`, `vib`, `toggleMute` | rien |
| `src/main.js` | câblage (`bindActions`, `initInput`, `initLoop`), graine, démarrage | tout |

Particularités de câblage :

- `S`, `MAP`, `SEED`, `TS` sont des live bindings ESM — réassignés uniquement dans leur
  module (`newGameState`, `layout`), mutés par propriété ailleurs.
- Le HUD et le Codex ne connaissent pas la boucle : leurs boutons appellent `A.*`, un
  registre rempli par `main.js` via `bindActions(actions)` (actions exportées par
  `loop/turns.js`).
- La machine à phases vit dans `S.phase` : `idle → sel → anim → moved → target →
  preview → shop / ai / over`. Le dispatch est `onTap` dans `loop/turns.js`.

## Où va le nouveau code

| Type de changement | Fichiers à toucher, dans l'ordre |
| --- | --- |
| Nouvelle valeur d'équilibrage | `src/config.js` (export nommé) → le module de règles qui la lit |
| Nouvelle règle de jeu | `src/rules/<module>.js` (fonction pure) → test macro dans `tests/` → appel depuis `loop/turns.js` → prose du Codex si elle en parle |
| Nouvelle unité | `config.U` + `config.ROSTER` (+ icône dans `render/icons.js`) — le reste suit tout seul |
| Nouveau terrain | `config` (`TNAME`, `TDEF`, `COST`, générateur `MAPGEN` si semé) → SVG dans `render/board.js` (`terrainSVG`, `TBG`) → table des terrains du Codex |
| Nouvelle action joueur | action dans `loop/turns.js` + export dans `actions` → bouton dans `render/hud.js` via `A.*` → phase dans `S.phase` si besoin |
| Nouvel affichage | `src/render/` (jamais de mutation de `S` autre que via une action) |
| Nouveau comportement IA | décision pure dans `rules/ai.js` (+ poids dans `config.AI`) → exécution dans `aiAct`/`aiTurn` (`loop/turns.js`) |
| Nouveau son | spec dans `config.AUDIO` → `play(AUDIO.X)` au site d'appel |
