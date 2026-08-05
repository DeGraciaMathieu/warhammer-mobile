# Zone de guerre — Astartes / Waaagh!

Duel tactique au tour par tour sur une planète-ruche, pensé pour mobile. Deux armées,
aucun dé : l'issue exacte de chaque combat s'affiche avant validation.

> ⚠️ **Ouvrir `index.html` par double-clic ne fonctionne plus.** Le jeu est découpé en
> modules ES natifs, qui ne se chargent pas en `file://`. Il faut le servir en HTTP :
>
> ```sh
> npm run dev        # sert le dossier sur http://localhost:3000
> ```

## Lancer

```sh
npm run dev
```

Puis ouvrir l'URL affichée (Node ≥ 22, aucune dépendance à installer).

## Tester

```sh
npm test           # node --test, 29 tests macro
npm run test:watch
```

## Architecture

```
index.html            coquille : HTML + CSS, charge src/main.js
src/
  config.js           toutes les valeurs de réglage — aucune logique
  rng.js              mulberry32 + graine aléatoire (points d'entrée uniquement)
  rules/              fonctions pures, testées : grid, combat, movement,
                      mapgen, turn, deploy, ai
  state/state.js      l'état S, la carte, la graine, la fabrique de partie
  render/             tout ce qui écrit à l'écran : board, hud, combat-panel,
                      codex, icons
  input/input.js      écouteurs bruts → intentions
  loop/turns.js       orchestration : intentions, résolution, tours, IA, délais
  main.js             câblage des couches, graine, démarrage
tests/                un fichier de tests macro par module de règles
docs/decisions.md     décisions du refactor, comportements conservés, questions ouvertes
```

Les règles (`src/rules/`) sont pures : pas de DOM, pas de `Math.random` direct, pas
d'horloge. Le hasard est injecté (PRNG `mulberry32` seedé), ce qui rend chaque carte
reproductible par sa graine — champ « graine » dans le Codex en jeu.
