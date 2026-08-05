# Zone de guerre — Astartes / Waaagh!

Duel tactique au tour par tour sur mobile : Astartes contre Orks sur une carte procédurale
symétrique, sans dé — l'issue exacte de chaque combat s'affiche avant validation.

## Stack

- JavaScript vanilla, modules ES natifs. Aucun framework, aucun build, aucune dépendance.
- Node ≥ 22 pour l'outillage ; le jeu tourne dans le navigateur.
- `npm run dev` — sert le dossier en HTTP (`npx serve .`). **`file://` ne fonctionne pas** :
  les modules ES exigent un serveur.
- `npm test` — `node --test`, tests macro dans `tests/`.
- Pas de linter ni de formateur : ne pas en introduire.

## Conventions de code

Architecture en couches, sens d'import strictement descendant
(`config` → `rules` → `state` → `render`/`input` → `loop` → `main`) :

- **Jamais de DOM, de `Math.random`, ni d'horloge dans `src/rules/`.** Les règles sont
  pures : état en paramètre, décision en retour, RNG injecté (`mulberry32` de `src/rng.js`).
- **Jamais de valeur magique hors de `src/config.js`.** Toute vitesse, coût, seuil, délai,
  fréquence sonore est un export nommé de la config.
- **Jamais de logique de jeu dans `render/` ou `input/`.** Le rendu lit l'état (et peut
  appeler des règles pures en lecture) ; l'input traduit les événements en intentions.
  Seul `loop/turns.js` orchestre : règle → mutation de `S` → rendu → délais.
- Les boutons du HUD/Codex n'importent pas la boucle : ils passent par le registre
  d'actions lié par `main.js` (`bindActions`).
- `Math.random` n'existe que dans `src/rng.js` (`randomSeed()`, réservé aux points d'entrée).
- Dérogations assumées (documentées dans `docs/decisions.md`) : `rules/mapgen.js` importe
  `mulberry32` depuis `src/rng.js` ; le rendu appelle `threatZone`/`canStop`/`bars` en lecture.
- Code, commentaires et documentation en **français**, style compact du dépôt
  (pas d'espaces autour de `=` dans les one-liners existants — s'y conformer).

## Conventions de domaine

- Vocabulaire : cycle (tour), réquisition (monnaie), barre de PV (= 10 points de dégâts),
  Discipline du Codex (plancher 60 % Astartes), Waaagh! (+5 %/ork adjacent, max 3),
  tir indirect (portée 2-3, immobile, jamais de riposte), bastion/forteresse (capturables).
- Terrains par caractère : `.` plaine, `r` route, `f` bois, `u` ruines, `c` cratère,
  `#` rocher (infranchissable), `B` bastion, `H` forteresse Astartes, `O` forteresse Ork.
- Le Codex en jeu (`src/render/codex.js`) est la documentation vivante : toute règle
  modifiée doit y rester exacte (sa prose est manuscrite ; l'ordre de bataille est généré
  depuis `config.U`/`ROSTER` et se met à jour seul).

## Comportement

- Ne jamais déclarer une tâche terminée sans avoir lancé `npm test` et vu la suite verte.
- Si une approche échoue deux fois, revenir au plan avant de continuer — ne pas tenter
  une troisième variante à l'aveugle.
- Tout changement de règle passe par : la règle pure dans `src/rules/`, son test macro
  dans `tests/`, la valeur dans `config.js`, et la prose du Codex si elle en parle.
- Ce que le code ne tranche pas va dans `docs/decisions.md` (questions ouvertes) —
  ne jamais combler un vide en devinant.

## Skills disponibles

- `architecture` — carte des modules et « où va le nouveau code » par type de changement.
- `testing` — commande, philosophie macro, mapping test → portée couverte.
- `combat` — formule de dégâts, doctrines, riposte, relevé de combat.
- `deplacement-terrain` — coûts de terrain, Dijkstra, empreintes de tir, zone de menace.
- `generation-carte` — génération procédurale seedée, symétrie, contraintes, placements.
- `ia-ork` — décisions pures de l'IA et leur exécution dans la boucle.
- `economie-objectifs` — réquisition, déploiement, capture, soin, victoire.
- `feature` — dérouler une demande de fonctionnalité de bout en bout.
- `prd` — rédiger une spécification sans rien implémenter.
