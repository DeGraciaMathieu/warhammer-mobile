# /check-tests

Analyse de la couverture macro et proposition des tests manquants.

## Démarche

1. Lire `CLAUDE.md` et la skill `testing`.
2. Périmètre : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
   Si rien n'a changé, analyser l'ensemble de `src/rules/` au lieu du diff.
3. Pour chaque règle du périmètre, confronter `src/rules/` à `tests/` :
   - la règle a-t-elle un test qui énonce son comportement (cas nominal) ?
   - le cas limite qui la justifie est-il couvert (plancher, blocage, interruption,
     tir indirect, fallback…) ?
   - les branches de `config` (doctrines par camp, classes de déplacement) sont-elles
     représentées ?
4. **Proposer** la liste des tests macro manquants : fichier cible, nom du test en
   vocabulaire de jeu, état littéral envisagé, valeur attendue calculée à la main.
   **Attendre l'approbation de l'utilisateur avant d'écrire quoi que ce soit.**
5. Après accord : écrire les tests approuvés, relancer `npm test`, corriger jusqu'au vert.

## Sortie

Tableau règle → test existant / manquant, la proposition soumise à validation, puis
(après accord) les tests ajoutés et le résultat de la suite.
