---
name: economie-objectifs
description: Use when le changement touche la réquisition, la boutique de déploiement, la capture de bâtiments, le soin, ou les conditions de victoire.
auto_invoke: true
---

# Économie & objectifs

## Réquisition

| Concept | Implémentation | Valeur |
| --- | --- | --- |
| Dotation de départ | `newGameState` (`src/state/state.js`) | `START_REQUISITION=5` par camp |
| Revenu | `turnIncome(blds,side)` (`src/rules/turn.js`) — appliqué dans `startTurn` | 1 par bâtiment tenu (forteresse comprise) |
| Coût des unités | `config.U[t].cost` | 2 (boy) à 9 (pre/bat) |

## Déploiement

- Condition : `canDeploy(blds,units,req,side)` (`src/rules/deploy.js`) — forteresse tenue,
  **libre**, et réquisition ≥ coût de l'unité la moins chère du `ROSTER`.
- Boutique : phase `shop` de `renderHud` (`src/render/hud.js`), ouverte par `openShop`,
  achat par `buy(t)` (`loop/turns.js`) — l'unité apparaît sur la forteresse, `acted:true`
  (elle entre en action au cycle suivant).
- L'IA achète dans `aiBuy` via `chooseBuy` (voir skill `ia-ork`).

## Capture

- Seule l'infanterie capture (`config.U[t].inf`).
- `captureProgress(cap,unitBars)` (`src/rules/turn.js`) : la jauge (`CAPTURE_GAUGE=20`)
  descend des **barres** de l'unité ; à ≤ 0 le bâtiment change de camp et la jauge se réarme.
- Interruptions (jauge réarmée) : l'unité quitte le bâtiment (`moveTo`) ou meurt
  (`killed`) — `loop/turns.js`.
- Marqueur ⚑ : `u.capturing`, rendu dans `renderUnits` (`src/render/board.js`).

## Soin

`healedHp(hp)` (`src/rules/turn.js`) : +`BUILDING_HEAL=20` points (2 barres) par cycle
passé sur un bâtiment **allié**, plafonné à `UNIT_MAX_HP=100`. Appliqué dans `startTurn`.

## Victoire

`winnerOf(units,hqSm,hqOrk)` (`src/rules/turn.js`) : un camp gagne si la forteresse
adverse est prise **ou** si l'armée adverse est détruite. Vérifié par `checkEnd`
(`loop/turns.js`) après chaque unité et pendant le tour IA ; l'écran de fin est
`showEnd` (`src/render/codex.js`).

## Modifier l'économie

1. La valeur dans `src/config.js` (`START_REQUISITION`, `CAPTURE_GAUGE`, `BUILDING_HEAL`,
   coûts dans `U`).
2. La règle pure dans `src/rules/turn.js` ou `rules/deploy.js`.
3. Le test dans `tests/turn.test.js` / `tests/deploy.test.js`.
4. Le Codex, section « Objectifs et réquisition » — sa prose cite « 2 PV par cycle »
  (= 20 points) et « la jauge descend de tes PV actuels » : la garder exacte.
