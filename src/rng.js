/* PRNG déterministe du jeu. mulberry32 est l'algorithme historique du prototype :
   en changer casserait la reproductibilité des cartes par graine. */
export function mulberry32(a){return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* Seule source de hasard non seedée : réservée aux points d'entrée (jamais dans une règle). */
export function randomSeed(){return (Math.random()*4294967296)>>>0;}
