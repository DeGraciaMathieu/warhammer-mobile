/* HUD — barre haute, panneau bas, fiche d'unité, relevé de combat, boutique.
   Les boutons déclenchent des actions de la boucle, liées par main.js via bindActions. */
import {U,TDEF,FNAME,ROSTER,BARS_MAX,DEF_POINT_PCT,AUDIO,VIB} from '../config.js';
import {S,tile} from '../state/state.js';
import {bldAt} from '../rules/grid.js';
import {bars} from '../rules/combat.js';
import {canDeploy} from '../rules/deploy.js';
import {play,vib} from '../audio.js';
import {svg} from './icons.js';
import {$} from './dom.js';
import {renderCombatPanel} from './combat-panel.js';

let A={};
export const bindActions=a=>{A=a;};

export function msg(t){$('msg').innerHTML=t;}
const stat=(l,v)=>`<span class="st"><u>${l}</u> <b>${v}</b></span>`;
export function unitCard(u,foe){
  const d=U[u.t];
  $('card').style.display='flex';
  const por=$('card').querySelector('.por');
  por.className='por '+u.s; por.innerHTML=svg(u.t);
  $('nm').textContent=d.n;
  $('stats').innerHTML=
    stat('PV',bars(u)+'/'+BARS_MAX)+stat('MVT',d.mv)+stat('PORTÉE',d.rng[1]>1?d.rng[0]+'-'+d.rng[1]:'1')+
    stat('ANTI-INF',d.dmg.inf)+stat('ANTI-BLD',d.dmg.veh)+stat('BLINDAGE',d.armor==='veh'?'lourd':'léger')+
    stat('TERRAIN','+'+(TDEF[tile(u.r,u.c)]+d.df)*DEF_POINT_PCT+'%');
}
export function hideCard(){$('card').style.display='none';}
export function addBtn(label,cls,fn,dis){
  const b=document.createElement('button');
  b.className='btn '+(cls||''); b.textContent=label; b.disabled=!!dis;
  b.onclick=()=>{play(AUDIO.BUTTON);vib(VIB.BUTTON);fn();};
  $('acts').appendChild(b);
}

export function renderHud(keepMsg){
  $('fname').textContent=FNAME[S.side];
  $('tsub').textContent='Cycle '+S.turn+(S.phase==='ai'?' — riposte ennemie':' — phase de commandement');
  $('fdot').style.color=S.side==='sm'?'var(--sm)':'var(--ork)';
  $('req').textContent=S.req[S.side];
  $('btnDanger').classList.toggle('on',S.danger);
  $('shop').style.display='none';
  $('combat').classList.remove('show');
  const acts=$('acts'); acts.innerHTML='';

  if(S.phase==='ai'||S.phase==='anim'||S.over){ if(S.phase==='ai')hideCard(); return; }

  if(S.phase==='idle'){
    hideCard();
    const left=S.units.filter(u=>u.hp>0&&u.s===S.side&&!u.acted);
    addBtn('Suivante ('+left.length+')','',()=>{A.cycleNext();},left.length===0);
    addBtn('Déployer','',()=>A.openShop(),!canDeploy(S.blds,S.units,S.req[S.side],S.side));
    addBtn('Fin du cycle','go',()=>A.endTurn());
    return;
  }
  if(S.phase==='sel'){
    unitCard(S.sel);
    msg("Touche une case bleue pour te déplacer, un ennemi cerclé pour attaquer sans bouger. Re-touche l'unité pour agir sur place.");
    addBtn('Annuler','ghost',()=>A.deselect());
    return;
  }
  if(S.phase==='moved'){
    unitCard(S.sel);
    const b=bldAt(S.blds,S.sel.r,S.sel.c);
    const canCap=U[S.sel.t].inf&&b&&b.own!==S.side;
    addBtn('Attaquer','warn',()=>A.openTarget(),S.targets.length===0);
    if(canCap) addBtn('Capturer','',()=>A.capture());
    addBtn('Attendre','',()=>A.wait());
    addBtn('↶','ghost',()=>A.undoMove());
    if(S.targets.length===0&&U[S.sel.t].rng[1]>1&&S.sel.moved)
      msg("Le tir indirect exige de rester immobile ce cycle. Touche une autre unité pour enchaîner.");
    else if(S.targets.length===0) msg("Aucune cible à portée. Touche une autre unité pour enchaîner : celle-ci passe en attente.");
    else msg("Touche un ennemi cerclé de rouge pour l'issue du combat, ou une autre unité pour enchaîner.");
    return;
  }
  if(S.phase==='target'){
    unitCard(S.sel);
    msg("Choisis une cible.");
    addBtn('Retour','ghost',()=>A.backToMoved());
    return;
  }
  if(S.phase==='preview'){
    /* le relevé porte le détail du combat ; la fiche du bas montre la cible ennemie */
    unitCard(S.pending.t);
    renderCombatPanel();
    msg("");
    addBtn('Confirmer l\'attaque','warn',()=>A.confirmAttack());
    addBtn('Autre cible','ghost',()=>A.backToTarget());
    addBtn('↶','ghost',()=>A.cancelPreview());
    return;
  }
  if(S.phase==='shop'){
    hideCard();
    const sh=$('shop'); sh.style.display='flex'; sh.innerHTML='';
    ROSTER[S.side].forEach(t=>{
      const b=document.createElement('button');
      b.className='sh'; b.disabled=U[t].cost>S.req[S.side];
      b.innerHTML=svg(t)+`<div class="n">${U[t].n}</div><div class="c">${U[t].cost}</div>`;
      b.onclick=()=>{play(AUDIO.SHOP);A.buy(t);};
      sh.appendChild(b);
    });
    msg("Réquisition disponible : <b>"+S.req[S.side]+"</b>. L'unité arrive à la forteresse.");
    addBtn('Retour','ghost',()=>A.closeShop());
  }
}
