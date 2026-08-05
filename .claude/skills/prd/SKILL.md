---
name: prd
description: Use when il faut spécifier une fonctionnalité avant de la coder — produire un PRD, un cadrage ou une spécification. N'implémente rien.
user_invocable: true
---

# PRD

Ce skill produit un **document de spécification** et ne modifie aucun fichier de code.

## Démarche

1. **Explorer d'abord** : lire les modules concernés (`architecture` + skill domaine)
   pour établir la base technique réelle — état actuel, fonctions touchées, valeurs de
   `config.js` en jeu. Ne poser **aucune** question dont la réponse est dans le code.
2. **Ne demander que les décisions produit** : valeurs d'équilibrage souhaitées,
   comportement attendu dans les cas limites, ce qui est hors périmètre.
3. Rédiger le PRD dans le format fixe ci-dessous, en français, puis s'arrêter —
   l'implémentation est un autre travail (skill `feature`).

## Format (sections obligatoires, dans cet ordre)

```markdown
# PRD — <titre court>

## Objectif
Une ou deux phrases : le problème joueur résolu.

## Base technique
L'existant sur lequel on s'appuie : modules, fonctions, valeurs de config concernées.

## Comportement
La règle spécifiée, cas nominal puis cas limites, en vocabulaire de jeu
(cycles, barres, réquisition, doctrines).

## Hors périmètre
Ce que cette itération ne fait explicitement pas.

## Impact par couche
| Couche | Impact |
config.js / rules/ / state/ / render/ / input/ / loop/ / Codex — « aucun » accepté.

## Critères d'acceptation
Liste vérifiable, chaque item observable en jeu ou en test.

## Tests
Les tests macro à écrire (fichier cible + énoncé de règle), stubs RNG si besoin.

## Risques et questions ouvertes
Ce que le code ne tranche pas, les interactions douteuses, l'équilibrage incertain.
```
