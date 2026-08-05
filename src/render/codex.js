/* Modale — Codex de campagne, écran de fin de bataille. */
import {U,ROSTER,FNAME,AUDIO} from '../config.js';
import {S,SEED} from '../state/state.js';
import {play} from '../audio.js';
import {svg} from './icons.js';
import {$} from './dom.js';

let A={};
export const bindActions=a=>{A=a;};

function codex(){
  const acc=(t,b,open)=>`<details class="acc"${open?' open':''}><summary>${t}</summary><div class="accb">${b}</div></details>`;
  const terr=[
    ['Forteresse','+20%',"Objectif de victoire. Point de déploiement."],
    ['Ruines','+15%',"Le meilleur couvert. Marcheurs à l'aise, véhicules à la peine."],
    ['Bastion','+15%',"Capturable. Rapporte 1 réquisition par cycle."],
    ['Bois','+10%',"Très pénible pour les véhicules."],
    ['Cratère','+5%',"Couvert léger, franchi facilement par les marcheurs."],
    ['Route','aucun',"Progression rapide, aucune protection."],
    ['Rocher','—',"Infranchissable."]
  ];

  let h=`<p class="lead">Duel tactique au tour par tour sur une planète-ruche. Deux armées, aucun dé.</p>
  <div class="key">
    <div class="kl"><span class="kt">But</span><span>Capturer la forteresse adverse, ou détruire son armée.</span></div>
    <div class="kl"><span class="kt">Geste</span><span>Touche une unité, puis une case bleue, puis une action.</span></div>
    <div class="kl"><span class="kt">Promesse</span><span>L'issue exacte du combat s'affiche avant que tu ne valides.</span></div>
  </div>
  <p class="hint">Le détail se déplie ci-dessous, section par section.</p>`;

  h+=acc('Commandes',`<ul>
    <li>Touche une unité : les cases <b style="color:#8fb8ff">bleues</b> sont accessibles,
        les <b style="color:#ff9d78">hachures rouges</b> montrent la portée de tir.</li>
    <li>Touche un ennemi encadré d'équerres pour ouvrir le relevé de combat, puis confirme.
        Nul besoin de bouger : l'attaque sur place marche aussi.</li>
    <li>Re-touche l'unité sélectionnée pour agir sans te déplacer : attaquer, capturer ou attendre.</li>
    <li><b>↶</b> annule le déplacement tant que rien n'est validé.</li>
    <li>Une fois déplacée, toucher une autre unité vaut <b>Attendre</b> : tu enchaînes d'un seul geste.</li>
    <li><b>Suivante</b> saute à la prochaine unité inactive, avec son décompte.</li>
    <li><b>☠</b> affiche tout ce que l'ennemi peut atteindre au prochain cycle.</li>
    <li>Touche une case vide pour lire son terrain, un ennemi pour consulter sa fiche sans rien engager.</li>
  </ul>`);

  h+=acc('Terrain et déplacement',
    terr.map(t=>`<div class="trow"><span class="tn">${t[0]}</span><span class="tv">${t[1]}</span><span class="tc">${t[2]}</span></div>`).join('')
    +`<ul style="margin-top:9px">
    <li><b>À pied</b> : ruines, bois et cratères coûtent 2 points de mouvement.</li>
    <li><b>Marcheur</b> : ruines et cratères à 1, bois à 2. Le roi des décombres.</li>
    <li><b>Véhicule</b> : bois et ruines à 3. À garder sur les routes et les plaines.</li>
    <li><b>Antigrav</b> : tout à 1. Le terrain n'existe pas.</li>
  </ul>`);

  h+=acc('Calcul des dégâts',
    `<p>Chaque coup suit cette formule, dépliée ligne par ligne dans le relevé avant validation :</p>
    <div class="formula">puissance de feu × état de l'attaquant × doctrine × défense de la cible</div>
    <ul>
    <li><b>Puissance de feu</b> : valeur anti-infanterie ou anti-blindé de l'arme, selon la cible.</li>
    <li><b>État</b> : une unité à 6 PV ne frappe qu'à 60% de sa valeur.</li>
    <li><b>Défense</b> : 5% par point de couvert du terrain, plus 5% par point de blindage.</li>
    <li>100 points de dégâts = 10 PV. Un coup inflige toujours au moins 5 points.</li>
    <li>La <b>riposte</b> est automatique au contact, sauf si la cible tombe, tire à distance, ou est hors de portée.</li>
  </ul>`);

  h+=acc('Objectifs et réquisition',`<ul>
    <li>Seule l'infanterie capture. Reste sur le bâtiment : la jauge descend de tes PV actuels par cycle.</li>
    <li>Quitter le bâtiment ou tomber remet la jauge à zéro.</li>
    <li>Chaque bâtiment tenu rapporte 1 réquisition par cycle, forteresse comprise.</li>
    <li>Touche ta forteresse pour déployer. L'unité arrivée entre en action au cycle suivant.</li>
    <li>Une unité posée sur un bâtiment allié récupère 2 PV par cycle.</li>
  </ul>`);

  h+=acc('Doctrines de faction',`<ul>
    <li><b>Astartes — Discipline du Codex :</b> ne perdent jamais plus de 40% de puissance de feu, même à 1 PV.</li>
    <li><b>Orks — Waaagh! :</b> +5% de dégâts par ork adjacent à l'attaquant, jusqu'à +15%.</li>
    <li><b>Tir indirect</b> (portée 2-3) : ne subit jamais de riposte, mais interdit de bouger et tirer le même cycle.</li>
  </ul>`);

  let ro='';
  ['sm','ork'].forEach(s=>{
    ro+=`<div class="kicker" style="margin:${s==='sm'?'2px':'16px'} 0 4px">${FNAME[s]}</div>`;
    ROSTER[s].forEach(t=>{const d=U[t];
      ro+=`<div class="rowu"><div class="ic ${s}">${svg(t)}</div><div class="rtxt">
        <div class="rn">${d.n}</div><div class="rnote">${d.note}</div>
        <div class="rstat">
          <span><u>réq</u><b>${d.cost}</b></span>
          <span><u>mvt</u><b>${d.mv}</b></span>
          <span><u>portée</u><b>${d.rng[1]>1?d.rng[0]+'-'+d.rng[1]:1}</b></span>
          <span><u>anti-inf</u><b>${d.dmg.inf}</b></span>
          <span><u>anti-bld</u><b>${d.dmg.veh}</b></span>
        </div></div></div>`;
    });
  });
  h+=acc('Ordre de bataille',ro);

  h+=acc('Champ de bataille',
    `<p>Chaque carte est générée puis pivotée de 180° : les deux camps héritent du même terrain,
    du même nombre de bastions et du même dégagement.</p>
    <p>Graine actuelle : <b style="font-family:Oswald,sans-serif;color:var(--gold);letter-spacing:.08em">${SEED}</b></p>
    <div class="seedbox">
      <input id="seedin" inputmode="numeric" placeholder="graine" value="${SEED}">
      <button class="btn" onclick="regenSeed()">Rejouer</button>
    </div>
    <button class="btn" style="width:100%" onclick="regenNew()">Tirer une nouvelle carte</button>
    <p class="hint">Régénérer recommence la bataille.</p>`);

  return h;
}
export function openCodex(first){
  $('modalKicker').textContent=first?'Bataille tactique · Astartes contre Waaagh!':'Codex de campagne';
  $('modalTitle').textContent='Zone de guerre';
  $('modalBody').innerHTML=codex();
  $('btnClose').textContent=first?'Engager la bataille':'Reprendre';
  $('btnClose').onclick=closeModal;
  $('modalScroll').scrollTop=0;
  $('modal').classList.add('show');
}
export function showEnd(win){
  $('modalKicker').textContent='Fin de la bataille';
  $('modalTitle').textContent = win==='sm'?"Victoire impériale":"Défaite";
  $('modalBody').innerHTML=
    (win==='sm'
      ? `<p class="lead">L'Empereur protège. Les xenos sont brisés.</p>`
      : `<p class="lead">WAAAGH ! Les Orks ont tout cassé. Encore.</p>`)
    +`<div class="key">
       <div class="kl"><span class="kt">Cycles</span><span>${S.turn}</span></div>
       <div class="kl"><span class="kt">Graine</span><span>${SEED}</span></div>
      </div>`;
  $('modalScroll').scrollTop=0;
  $('modal').classList.add('show');
  $('btnClose').textContent='Nouvelle bataille';
  $('btnClose').onclick=()=>{closeModal();A.newGame();openCodex(true);};
  play(win==='sm'?AUDIO.VICTORY:AUDIO.DEFEAT);
}
export function closeModal(){$('modal').classList.remove('show');}
