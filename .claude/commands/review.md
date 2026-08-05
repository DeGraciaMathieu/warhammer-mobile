# /review

Revue complète des changements en cours.

## Démarche

1. Lire `CLAUDE.md`.
2. Établir le périmètre : `git diff`, `git diff --cached`, `git status`,
   `git log --oneline -5`. **S'il n'y a aucun changement, le dire et s'arrêter.**
3. Vérifier point par point (statut OK / VIOLATION / N/A pour chacun) :

### Conventions
- Aucun DOM, `Math.random`, `Date.now`/`performance.now` dans `src/rules/`.
- Aucune valeur magique hors `src/config.js` (délais, coûts, seuils, fréquences).
- Sens d'import descendant respecté (`config → rules → state → render/input → loop → main`) ;
  hors dérogations documentées dans `docs/decisions.md`.
- HUD/Codex sans import de la boucle : boutons via le registre `A.*` lié par `main.js`.
- Français, style compact du dépôt.

### Couverture de test
- Toute règle nouvelle ou modifiée dans `src/rules/` a son test macro dans `tests/`
  (énoncé en vocabulaire de jeu, état littéral, RNG stubbé).
- Les tests modifiés testent toujours le comportement, pas l'implémentation.

### Maintenabilité
- Couplage : la nouvelle logique est-elle dans la bonne couche (décision pure vs
  orchestration vs affichage) ?
- Responsabilité unique, duplication avec une règle existante, longueur/complexité des
  fonctions, nommage cohérent avec le vocabulaire du jeu.

### Cohérence système
- Intégration : la machine à phases (`S.phase`), le registre d'actions, les live bindings
  (`S`, `MAP`, `TS`) sont-ils utilisés comme partout ailleurs ?
- La forme de l'état (`S.units`, `S.blds`, unités `{id,t,s,r,c,hp,acted,…}`) est-elle
  préservée ?
- Le Codex (`src/render/codex.js`) reflète-t-il encore les règles modifiées ?
- `docs/decisions.md` mis à jour si un arbitrage a été fait.

4. Lancer `npm test` et rapporter le résultat exact.

## Sortie

Rapport structuré : un statut par item ci-dessus, la liste des violations avec fichier
et ligne, le résultat des tests, puis un verdict global (approuvé / corrections requises).
