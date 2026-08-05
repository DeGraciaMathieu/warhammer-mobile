---
name: feature
description: Use when l'utilisateur demande une fonctionnalité, une règle nouvelle ou une modification de gameplay à implémenter de bout en bout.
user_invocable: true
---

# Feature

Dérouler dans l'ordre, sans sauter d'étape.

## 1. Comprendre

- Reformuler la demande en une ou deux phrases ; invoquer `architecture` pour situer les
  couches touchées, et la skill domaine concernée (`combat`, `deplacement-terrain`,
  `generation-carte`, `ia-ork`, `economie-objectifs`).
- Poser les questions de clarification **avant de coder** :
  - les valeurs chiffrées (coût, dégâts, portée, délai — rien ne s'invente) ;
  - les interactions avec l'existant (riposte ? capture ? IA concernée ? tir indirect ?) ;
  - les cas limites (unité détruite pendant l'effet, carte fallback, phase `shop`/`ai`).
- Si la demande est ambiguë sur un point que le code ne tranche pas : demander, ne pas
  deviner.

## 2. Implémenter

- Dans l'ordre des couches : `config.js` (valeurs nommées) → `src/rules/` (décision pure,
  RNG injecté) → `loop/turns.js` (orchestration) → `render/` (affichage, boutons via le
  registre `A.*`) — voir « Où va le nouveau code » de `architecture`.
- Respecter `CLAUDE.md` : pas de DOM ni de hasard dans les règles, pas de littéral hors
  config, imports strictement descendants.

## 3. Tester

- Test macro dans `tests/` (voir `testing`) : énoncé en vocabulaire de jeu, état littéral,
  valeurs attendues calculées à la main.
- `npm test` — corriger jusqu'au vert. Ne jamais conclure suite rouge.
- Si l'approche échoue deux fois, revenir au plan avec l'utilisateur.

## 4. Synchroniser la documentation

- Le Codex (`src/render/codex.js`) si la règle est visible du joueur — sa prose est
  manuscrite et doit rester exacte.
- La skill domaine touchée et `CLAUDE.md` si le périmètre ou une convention a bougé.
- `docs/decisions.md` si un choix non tranché par le code a été fait.

## 5. Rendre compte

Résumer : fichiers modifiés, tests ajoutés (avec leurs noms de règle), résultat de
`npm test`, points laissés ouverts.
