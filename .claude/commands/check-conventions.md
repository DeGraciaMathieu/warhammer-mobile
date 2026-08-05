# /check-conventions

Contrôle léger : conventions + cohérence tests/doc + exécution de la suite.

## Démarche

1. Lire `CLAUDE.md`.
2. Périmètre : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
   **Rien à vérifier → le dire et s'arrêter.**
3. Contrôles (statut OK / VIOLATION / N/A) :
   - Pureté de `src/rules/` : pas de DOM, pas de `Math.random`, pas d'horloge.
   - Valeurs magiques : tout littéral de réglage nouveau doit être dans `src/config.js`.
   - Imports : sens descendant, pas d'import de `loop/` depuis `render/` ou `input/`.
   - Chaque règle touchée a un test macro correspondant dans `tests/`.
   - Codex (`src/render/codex.js`) : la prose manuscrite reste exacte si une règle
     visible du joueur a changé (l'ordre de bataille généré depuis `config.U` s'ignore).
   - Français dans le code, les commentaires et les tests.
4. `npm test` — rapporter le décompte exact.

## Sortie

Liste des contrôles avec statut, violations localisées (fichier:ligne), résultat des
tests, verdict global.
