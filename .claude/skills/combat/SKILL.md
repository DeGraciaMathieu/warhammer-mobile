---
name: combat
description: Use when le changement touche les dégâts, les doctrines de faction, la riposte, les cibles à portée ou le relevé de combat affiché.
auto_invoke: true
---

# Combat

## La formule

`dégâts = puissance de feu × état de l'attaquant × doctrine × défense de la cible`,
implémentée dans `dmgDetail(units,map,a,d,ar,ac)` (`src/rules/combat.js`). Elle retourne
le détail complet (`{base,raw,sc,codex,orks,mob,tdef,udef,red,brut,dmg,plancher,armor}`)
consommé tel quel par le relevé de combat.

| Concept | Implémentation | Valeur |
| --- | --- | --- |
| Puissance de feu | `config.U[t].dmg[armor]` — anti-inf ou anti-blindé selon `armor` de la cible | par unité |
| État de l'attaquant | `bars(a)/BARS_MAX` — une unité à 3 barres frappe à 30 % | `HP_PER_BAR=10`, `BARS_MAX=10` |
| Discipline du Codex | plancher du ratio pour les `s==='sm'` | `CODEX_FLOOR=.6` |
| Waaagh! | +5 % par ork adjacent à l'attaquant (position de tir `ar,ac`) | `WAAAGH_PCT=5`, `WAAAGH_MAX_ADJ=3` |
| Défense | −5 % par point de couvert (`TDEF[terrain]`) et de blindage (`U[t].df`) | `DEF_POINT_PCT=5` |
| Plancher | un coup inflige toujours au moins 5 points | `MIN_DAMAGE=5` |

## Riposte

`counterOf(units,map,a,d,ar,ac)` : nulle si la cible est un tireur indirect
(`U[t].rng[1]>1`) ou si la distance ≠ 1 ; sinon `dmgCalc` de la cible depuis sa case.
La cible détruite ne riposte pas — c'est géré au site d'appel (`t.hp>0` dans
`confirmAttack`/`aiAct`, `loop/turns.js`).

## Cibles

`targetsFrom(units,u,r,c)` : anneau Manhattan `[rng[0],rng[1]]`. Un tireur indirect qui
a bougé (`r,c ≠ u.r,u.c`) n'a **aucune** cible.

## Affichage

- Relevé détaillé : `renderCombatPanel()` (`src/render/combat-panel.js`) — lit
  `S.pending.dtA/dtC` produits par `openPreview` (`loop/turns.js`).
- Aperçu chiffré + confirmation : phase `preview` de `renderHud` (`src/render/hud.js`).
- Exécution animée : `strike(a,d,forced)` dans `loop/turns.js` (sons, vibration,
  `floatFX`, délais `T.STRIKE_PAUSE`/`T.COUNTER_DELAY`).

## Modifier le combat

1. La valeur : export nommé dans `src/config.js` (jamais de littéral dans la règle).
2. La règle : `dmgDetail`/`counterOf`/`targetsFrom` dans `src/rules/combat.js` —
   pur, sans DOM ni hasard.
3. Le test macro : `tests/combat.test.js`, énoncé en vocabulaire de jeu, valeurs
   attendues calculées à la main.
4. Le relevé : si le détail retourné change de forme, adapter `calcBlock`
   (`combat-panel.js`) qui l'affiche ligne par ligne.
5. Le Codex : sections « Calcul des dégâts » et « Doctrines de faction »
   (`src/render/codex.js`) — la prose cite 60 %, +5 %, +15 %, 5 points : la garder exacte.
