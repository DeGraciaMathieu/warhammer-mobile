---
name: ia-ork
description: Use when le changement touche le comportement de l'IA Ork — achats, choix d'attaque, avance, priorités de capture — ou son déroulé pendant le tour ennemi.
auto_invoke: true
---

# IA Ork

Séparation stricte : les **décisions** sont pures dans `src/rules/ai.js`, l'**exécution**
(déplacements animés, frappes, délais) vit dans `aiTurn`/`aiAct` (`src/loop/turns.js`).
Un changement de comportement se fait dans la décision ; un changement de rythme dans
l'exécution.

## Décisions (`src/rules/ai.js`)

| Fonction | Rôle | Réglages (`config.AI`) |
| --- | --- | --- |
| `chooseBuy(req,rng)` | descend la table `AI.BUY` : premier profil dont `req` suffit et dont le tirage `rng()<p` réussit (`p>=1` = sans tirage) | `BUY` (bat 9/.4 → ddr 8/.5 → loo 6/.4 → nob 5/.5 → bug 4/.35 → boy 2) |
| `bestAttack(units,map,u,dist)` | meilleur couple (case de tir, cible) — score = dégâts utiles + kill + coût de la cible − riposte + couvert + bonus anti-artillerie | `KILL_BONUS=70`, `COUNTER_WEIGHT=.9`, `TERRAIN_WEIGHT=3`, `COST_WEIGHT=2`, `INDIRECT_BONUS=12` |
| `advanceObjective(units,blds,u)` | cible d'avance au plus court pondéré : l'infanterie est aimantée par les objectifs, les véhicules par l'ennemi | `OBJ_WEIGHT_INF=-3`, `OBJ_WEIGHT_NONINF=6` |
| `bestAdvanceSpot(map,field,spots)` | case d'arrêt minimisant la distance au but, bonus de couvert | `ADVANCE_COVER_WEIGHT=.3` |

⚠️ Les poids d'attaque sont copiés du prototype **sans justification connue**
(question ouverte de `docs/decisions.md`) : ne pas les « corriger » au passage.

## Exécution (`src/loop/turns.js`)

Ordre du tour (`aiTurn`) : achat → unités triées **artillerie d'abord**
(`sort` sur `rng[1]` décroissant) → pour chacune : attaque si `sc > AI.ATTACK_THRESHOLD=4`,
sinon capture si infanterie sur/vers un objectif atteignable (forteresse prioritaire),
sinon avance (`costField` + `bestAdvanceSpot`). Délais : `T.AI_OPENING`, `T.AI_UNIT_PAUSE`,
`T.AI_CLOSING`, `T.AI_STEP`, `T.AI_COUNTER_DELAY`.

## RNG

L'IA reçoit son RNG par injection : `initLoop(mulberry32(randomSeed()))` dans `main.js`
(seedé par session — comportement d'origine, non reproductible par graine de carte, choix
documenté). Les tests stubbent : `chooseBuy(9,()=>0)`.

## Modifier l'IA

1. Le poids ou seuil dans `config.AI`.
2. La décision pure dans `rules/ai.js` — jamais de DOM, hasard via le paramètre `rng`.
3. Le test dans `tests/ai.test.js` avec un rng stub et un état littéral.
4. Le déroulé (ordre, délais, messages) dans `aiAct`/`aiTurn` seulement.
