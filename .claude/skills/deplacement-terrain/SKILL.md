---
name: deplacement-terrain
description: Use when le changement touche le déplacement des unités, les coûts de terrain, les cases atteignables, la portée de tir affichée ou la zone de menace.
auto_invoke: true
---

# Déplacement & terrain

## Les données

| Concept | Implémentation |
| --- | --- |
| Coût d'entrée par case | `config.COST[classe][terrain]` — `undefined` = infranchissable (le rocher `#` n'y figure pas) |
| Classes de déplacement | `pied`, `marcheur`, `vehicule`, `antigrav` (`config.U[t].cls`) |
| Budget | `config.U[t].mv` points de mouvement |
| Couvert | `config.TDEF[terrain]` (0–4), affiché ×5 % partout |

## Les règles (`src/rules/movement.js`)

- `reachable(units,map,u)` → `{dist,prev}` : Dijkstra borné par `mv`. Un **ennemi bloque
  le passage**, un allié se traverse mais on ne s'y arrête pas (`canStop`, `rules/grid.js`).
- `pathTo(prev,u,r,c)` : chemin reconstruit, départ exclu.
- `atkFootprint(units,reach,u)` : cases frappables réelles — depuis chaque arrêt possible
  pour le contact, depuis la position actuelle seulement pour le tir indirect (`rng[1]>1`).
- `potentialFootprint(units,reach,u)` : anneau depuis chaque arrêt possible, même pour le
  tir indirect — **affichage de sélection uniquement** (le rouge au-delà du bleu), jamais
  la résolution ni la zone de menace.
- `threatZone(units,map,side)` : union des empreintes de tout un camp (bouton ☠).
- `costField(map,tr,tc,cls)` : champ de distance **sans limite de mouvement** — sert à
  l'avance de l'IA, pas au joueur.

## L'exécution (hors règles)

- Sélection : `select(u)` (`loop/turns.js`) stocke `S.reach`/`S.prev`, `S.from` pour
  l'annulation (`undoMove`).
- Animation : `moveTo` (joueur, `T.PLAYER_STEP=85` ms/pas) et `aiMove` (IA,
  `T.AI_STEP=80`) déplacent le pion via `unitEl` + `transform`.
- Quitter un bâtiment en cours de capture réarme sa jauge (`moveTo`, garde `!unitAt`).
- Overlays : `renderOv` (`src/render/board.js`) — bleu `mv`, hachures rouges `at`,
  menace `dz`, cibles `tg`.

## Ajouter un terrain

1. `src/config.js` : entrée dans `TNAME`, `TDEF`, et chaque classe de `COST`
   (omettre = infranchissable). S'il est semé par le générateur : `MAPGEN.CLUSTERS`.
2. `src/render/board.js` : fond dans `TBG`, dessin dans `terrainSVG`.
3. `tests/movement.test.js` : le coût ou le blocage attendu.
4. Codex (`src/render/codex.js`) : table `terr` et liste des coûts par classe —
   prose manuscrite, la mettre à jour à la main.
