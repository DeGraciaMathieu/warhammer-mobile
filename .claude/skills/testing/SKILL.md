---
name: testing
description: Use when il faut écrire, localiser ou faire passer des tests — ou décider ce qui mérite un test et à quel niveau.
auto_invoke: true
---

# Testing

## Commande

```sh
npm test           # node --test (Node ≥ 22), zéro dépendance
npm run test:watch
```

Les tests vivent dans `tests/*.test.js`, importent `node:test` + `node:assert/strict`
et les modules de `src/rules/` directement (pur = importable sous Node sans DOM).

## Philosophie

Tests **macro** : on vérifie ce qu'un joueur constaterait, dans le vocabulaire du jeu,
jamais l'implémentation. Un bon nom de test est un énoncé de règle :
« Discipline du Codex : un Astartes blessé frappe au plancher de 60% »,
« un rocher est infranchissable, un ennemi bloque le passage, un allié non ».

- L'état de test est un petit littéral explicite (`{id:1,t:'tac',s:'sm',r:5,c:5,hp:30}`),
  pas un helper qui cache la mise en place. Carte : `Array.from({length:12},()=>Array(10).fill('.'))`.
- Un à deux tests par règle : le cas nominal + le cas limite qui justifie la règle.
- Pas d'objectif de couverture chiffré. Pas de test du rendu ni de la boucle (asynchrone,
  DOM) — c'est la pureté des règles qui rend le reste fiable.
- RNG : injecter un stub (`()=>0`, `()=>0.99`) ou une graine fixe (`generateMap(42)`).

## Test → portée couverte

| Fichier | Couvre |
| --- | --- |
| `tests/grid.test.js` | bornes du plateau, occupation, arrêt possible |
| `tests/combat.test.js` | formule de dégâts (Codex, Waaagh!, couvert, plancher 5), riposte, cibles du tir indirect, barres de PV |
| `tests/movement.test.js` | budget de mouvement, terrain bloquant, chemins, anneau de tir indirect, zone de menace, champ de distance IA |
| `tests/mapgen.test.js` | déterminisme par graine, symétrie 180°, dotation (1 H, 1 O, 6 B), placements en miroir |
| `tests/turn.test.js` | revenu par bâtiment, soin plafonné, jauge de capture, conditions de victoire |
| `tests/deploy.test.js` | conditions de déploiement |
| `tests/ai.test.js` | table d'achat, choix d'attaque létale, aimantation objectifs/ennemis, couvert à distance égale |

## Où mettre un nouveau test

1. La règle touchée a déjà son fichier ci-dessus → y ajouter le test.
2. Nouveau module de règles → nouveau `tests/<module>.test.js`, mêmes conventions.
3. Si le comportement à tester exige le DOM ou des délais, c'est le signe que la logique
   n'est pas au bon endroit : extraire d'abord la décision pure dans `src/rules/`,
   tester la décision, laisser l'exécution dans `loop/`.
