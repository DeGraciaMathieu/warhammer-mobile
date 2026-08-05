/* Boucle de jeu — intentions du joueur, résolution des actions, tours, IA ork.
   C'est la seule couche qui orchestre : règles pures + état + rendu + délais. */
import {COLS,U,TNAME,TDEF,AI,T,DEF_POINT_PCT,CAPTURE_GAUGE,UNIT_MAX_HP,AUDIO,VIB} from '../config.js';
import {S,MAP,tile,nextId} from '../state/state.js';
import * as G from '../rules/grid.js';
import * as C from '../rules/combat.js';
import * as M from '../rules/movement.js';
import {turnIncome,healedHp,captureProgress,winnerOf} from '../rules/turn.js';
import {chooseBuy,bestAttack,advanceObjective,bestAdvanceSpot} from '../rules/ai.js';
import {play,vib} from '../audio.js';
import {render} from '../render/render.js';
import {TS,banner,floatFX,unitEl} from '../render/board.js';
import {msg,unitCard,hideCard,addBtn,renderHud} from '../render/hud.js';
import {showEnd} from '../render/codex.js';
import {$} from '../render/dom.js';

const key=G.key;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const bars=C.bars, toPV=C.toPV;
const unitAt=(r,c)=>G.unitAt(S.units,r,c);
const bldAt=(r,c)=>G.bldAt(S.blds,r,c);
const canStop=(u,r,c)=>G.canStop(S.units,u,r,c);
const reachable=u=>M.reachable(S.units,MAP,u);
const pathTo=(u,r,c)=>M.pathTo(S.prev,u,r,c);
const targetsFrom=(u,r,c)=>C.targetsFrom(S.units,u,r,c);
const dmgDetail=(a,d,ar,ac)=>C.dmgDetail(S.units,MAP,a,d,ar,ac);
const dmgCalc=(a,d,ar,ac)=>C.dmgCalc(S.units,MAP,a,d,ar,ac);
const counterOf=(a,d,ar,ac)=>C.counterOf(S.units,MAP,a,d,ar,ac);
const costField=(tr,tc,cls)=>M.costField(MAP,tr,tc,cls);

/* RNG des décisions IA : injecté par main.js (graine aléatoire par session) */
let aiRng=null;
export function initLoop(rng){aiRng=rng;}

/* ============================================================ ACTIONS JOUEUR */
export function onTap(r,c){
  const u=unitAt(r,c), b=bldAt(r,c);
  if(S.phase==='idle'){
    if(u&&u.s===S.side&&!u.acted) return select(u);
    if(u) return inspect(u);
    if(b&&b.kind==='hq'&&b.own===S.side) return openShop();
    return showTerrain(r,c);
  }
  if(S.phase==='sel'){
    if(u===S.sel){ actInPlace(); return; }             // re-toucher l'unité = agir sans bouger
    const t=targetsFrom(S.sel,S.sel.r,S.sel.c).find(e=>e.r===r&&e.c===c);
    if(t){ S.targets=targetsFrom(S.sel,S.sel.r,S.sel.c); return openPreview(t); }
    if(S.reach.has(key(r,c))&&canStop(S.sel,r,c)) return moveTo(r,c);
    if(u&&u.s===S.side&&!u.acted) return select(u);
    if(u) return inspect(u);
    return deselect();
  }
  if(S.phase==='moved'){
    const t=S.targets.find(e=>e.r===r&&e.c===c);
    if(t) return openPreview(t);
    if(u===S.sel) return wait();                       // re-toucher l'unité = attendre
    if(u&&u.s===S.side&&!u.acted){                     // enchaîner sur une autre unité
      wait(); if(!S.over) select(u);
      return;
    }
    return;
  }
  if(S.phase==='target'||S.phase==='preview'){
    const t=S.targets.find(e=>e.r===r&&e.c===c);
    if(t) return openPreview(t);
  }
}
function select(u){
  S.sel=u; S.phase='sel';
  const {dist,prev}=reachable(u); S.reach=dist; S.prev=prev;
  S.from={r:u.r,c:u.c}; play(AUDIO.SELECT); render();
}
function deselect(){S.sel=null;S.phase='idle';S.targets=[];S.pending=null;render();}
/* menu d'actions sans déplacement : attaque, capture ou attente depuis la case actuelle */
function actInPlace(){
  const u=S.sel;
  S.phase='moved'; S.targets=targetsFrom(u,u.r,u.c); render();
}
async function moveTo(r,c){
  const u=S.sel, path=pathTo(u,r,c);
  S.phase='anim'; render();
  const el=unitEl(u.id);
  for(const k of path){
    u.r=(k/COLS)|0; u.c=k%COLS;
    el.style.transform=`translate(${u.c*TS}px,${u.r*TS}px)`;
    play(AUDIO.STEP); await sleep(T.PLAYER_STEP);
  }
  u.moved = (u.r!==S.from.r||u.c!==S.from.c);
  if(u.moved){
    u.capturing=false;
    const old=bldAt(S.from.r,S.from.c);
    if(old&&old.cap<CAPTURE_GAUGE&&!unitAt(old.r,old.c)) old.cap=CAPTURE_GAUGE;
  }
  S.phase='moved'; S.targets=targetsFrom(u,u.r,u.c); render();
}
function undoMove(){
  const u=S.sel; u.r=S.from.r; u.c=S.from.c; u.moved=false;
  S.phase='sel'; S.targets=[]; render();
}
function openTarget(){S.phase='target';render();}
function openPreview(t){
  const u=S.sel;
  const dtA=dmgDetail(u,t,u.r,u.c);
  const hpAfter=Math.max(0,t.hp-dtA.dmg);
  const dist=Math.abs(t.r-u.r)+Math.abs(t.c-u.c);
  let ct=0,dtC=null,why='';
  if(hpAfter===0) why="Cible détruite : aucune riposte.";
  else if(U[t.t].rng[1]>1) why="Arme à tir indirect : cette unité ne riposte jamais.";
  else if(dist!==1) why="Hors de portée de riposte (la cible frappe à 1 case).";
  else {dtC=dmgDetail(t,u,t.r,t.c); ct=dtC.dmg;}
  S.pending={t,dtA,dtC,ct,why,d:dtA.dmg,hpAfter,myAfter:Math.max(0,u.hp-ct)};
  S.phase='preview'; render();
}
async function confirmAttack(){
  const u=S.sel,p=S.pending,t=p.t;
  const uName=U[u.t].n,tName=U[t.t].n,tB=bars(t),uB=bars(u);
  S.phase='anim'; render();
  await strike(u,t);
  let ct=0;
  if(t.hp>0){ct=counterOf(u,t,u.r,u.c); if(ct){await sleep(T.COUNTER_DELAY); await strike(t,u,ct);}}
  finishUnit(u);
  msg(`${uName} inflige <b>${p.dtA.dmg}</b> (${toPV(p.dtA.dmg)} PV) · ${tName} ${tB} → ${t.hp<=0?'<span class="dead">détruit</span>':bars(t)}`
    +(ct?` — riposte <b>${ct}</b> · ${uName} ${uB} → ${u.hp<=0?'<span class="dead">détruit</span>':bars(u)}`:''));
}
async function strike(a,d,forced){
  const dmg=forced??dmgCalc(a,d,a.r,a.c);
  d.hp-=dmg; play(a.s==='sm'?AUDIO.HIT_SM:AUDIO.HIT_ORK); vib(VIB.HIT);
  const el=unitEl(d.id);
  if(el){el.classList.add('hit');setTimeout(()=>el.classList.remove('hit'),T.HIT_ANIM);}
  floatFX(d.r,d.c,'−'+toPV(dmg)+' PV');
  await sleep(T.STRIKE_PAUSE);
  if(d.hp<=0){d.hp=0;killed(d);floatFX(d.r,d.c,'DÉTRUIT','kill');play(AUDIO.DESTROY);}
  render();
}
function killed(d){
  S.blds.forEach(b=>{if(b.r===d.r&&b.c===d.c&&b.cap<CAPTURE_GAUGE)b.cap=CAPTURE_GAUGE;});
  render();
}
function capture(){
  const u=S.sel,b=bldAt(u.r,u.c);
  const res=captureProgress(b.cap,bars(u));
  b.cap=res.cap; u.capturing=!res.captured; play(AUDIO.CAPTURE);
  if(res.captured){
    b.own=u.s;
    msg(b.kind==='hq'?"Forteresse prise !":"Bastion sécurisé. +1 réquisition par cycle.");
  }
  finishUnit(u);
}
function finishUnit(u){
  u.acted=true; u.moved=false; S.sel=null; S.pending=null; S.targets=[];
  S.phase = S.side==='sm' ? 'idle' : 'ai';
  render();
  if(checkEnd())return;
  if(S.side!=='sm')return;
  const left=S.units.filter(x=>x.hp>0&&x.s===S.side&&!x.acted).length;
  if(left===0) msg("Toutes les unités ont agi. Termine le cycle.");
}
function wait(){finishUnit(S.sel);}

/* déploiement */
function openShop(){
  const hq=S.blds.find(b=>b.kind==='hq'&&b.own===S.side);
  if(!hq||unitAt(hq.r,hq.c)) {msg("La forteresse est occupée : impossible de déployer.");return;}
  S.phase='shop'; render();
}
function buy(t){
  const hq=S.blds.find(b=>b.kind==='hq'&&b.own===S.side);
  if(U[t].cost>S.req[S.side])return;
  S.req[S.side]-=U[t].cost;
  S.units.push({id:nextId(),t,s:S.side,r:hq.r,c:hq.c,hp:UNIT_MAX_HP,acted:true});
  play(AUDIO.DEPLOY); S.phase='idle'; render();
  msg(U[t].n+" déployé. Il entrera en action au prochain cycle.");
}

/* fiches d'information */
function inspect(u){
  S.sel=null;S.phase='idle';render();
  unitCard(u,true);
  msg(U[u.t].note+(u.s===S.side?"":" — unité ennemie."));
  $('acts').innerHTML='';
  addBtn('Menace de cette unité','ghost',()=>{S.danger=!S.danger;render();});
  addBtn('Fermer','ghost',()=>{deselect();});
}
function showTerrain(r,c){
  hideCard();
  const t=tile(r,c),b=bldAt(r,c);
  let s=`<b>${TNAME[t]}</b> — défense +${TDEF[t]*DEF_POINT_PCT}%`;
  if(b) s+= b.own?` · contrôlé par ${b.own==='sm'?'les Astartes':'les Orks'}`:' · neutre';
  msg(s); renderHud(true);
}
let cyc=0;
function cycleNext(){
  const l=S.units.filter(u=>u.hp>0&&u.s===S.side&&!u.acted);
  if(!l.length)return;
  cyc=(cyc+1)%l.length; select(l[cyc]);
}
export function toggleDanger(){
  S.danger=!S.danger;render();
  msg(S.danger?"Zone de menace ennemie affichée.":"Zone de menace masquée.");
}

/* ============================================================ TOURS */
function startTurn(side){
  S.side=side;
  if(side==='sm')S.turn++;
  S.req[side]+=turnIncome(S.blds,side);
  S.units.filter(u=>u.s===side&&u.hp>0).forEach(u=>{
    u.acted=false;u.moved=false;
    const b=bldAt(u.r,u.c);
    if(b&&b.own===side)u.hp=healedHp(u.hp);
  });
  S.sel=null;S.phase=side==='sm'?'idle':'ai';S.targets=[];S.pending=null;
  render();
  banner((side==='sm'?"Astartes":"Waaagh!")+" — cycle "+S.turn);
  msg(side==='sm'?"À toi de jouer.":"Les Orks avancent…");
}
function endTurn(){
  if(S.over)return;
  S.sel=null;S.phase='ai';S.targets=[];render();
  startTurn('ork'); setTimeout(aiTurn,T.AI_TURN_START);
}
function checkEnd(){
  const win=winnerOf(S.units,S.hq.sm,S.hq.ork);
  if(win){S.over=true;S.phase='over';render();showEnd(win);return true;}
  return false;
}

/* ============================================================ IA ORK */
async function aiTurn(){
  if(S.over)return;
  aiBuy(aiRng);
  await sleep(T.AI_OPENING);
  const list=S.units.filter(u=>u.hp>0&&u.s==='ork').sort((a,b)=>U[b.t].rng[1]-U[a.t].rng[1]);
  for(const u of list){
    if(S.over)return;
    if(u.hp<=0||u.acted)continue;
    await aiAct(u);
    if(checkEnd())return;
    await sleep(T.AI_UNIT_PAUSE);
  }
  await sleep(T.AI_CLOSING);
  startTurn('sm');
}
function aiBuy(rng){
  const hq=S.blds.find(b=>b.kind==='hq'&&b.own==='ork');
  if(!hq||unitAt(hq.r,hq.c))return;
  const pick=chooseBuy(S.req.ork,rng);
  if(!pick)return;
  S.req.ork-=U[pick].cost;
  S.units.push({id:nextId(),t:pick,s:'ork',r:hq.r,c:hq.c,hp:UNIT_MAX_HP,acted:true});
  render();
}
async function aiAct(u){
  const {dist,prev}=reachable(u); S.reach=dist; S.prev=prev; S.sel=u; S.from={r:u.r,c:u.c};
  const spots=[...dist.keys()].filter(k=>canStop(u,(k/COLS)|0,k%COLS));
  const best=bestAttack(S.units,MAP,u,dist);
  if(best&&best.sc>AI.ATTACK_THRESHOLD){
    await aiMove(u,best.r,best.c);
    S.targets=[best.e]; S.pending={t:best.e};
    const dt=dmgDetail(u,best.e,u.r,u.c), tB=bars(best.e), uB=bars(u);
    await strike(u,best.e);
    let ct=0;
    if(best.e.hp>0){ct=counterOf(u,best.e,u.r,u.c);if(ct){await sleep(T.AI_COUNTER_DELAY);await strike(best.e,u,ct);}}
    msg(`${U[u.t].n} inflige <b>${dt.dmg}</b> (${toPV(dt.dmg)} PV) · ${U[best.e.t].n} ${tB} → ${best.e.hp<=0?'<span class="dead">détruit</span>':bars(best.e)}`
      +(ct?` — riposte <b>${ct}</b> · ${U[u.t].n} ${uB} → ${u.hp<=0?'<span class="dead">détruit</span>':bars(u)}`:''));
    u.acted=true;u.moved=false;S.sel=null;S.targets=[];render();return;
  }
  // capture
  if(U[u.t].inf){
    const here=bldAt(u.r,u.c);
    if(here&&here.own!=='ork'){ S.sel=u; capture(); return; }
    const objs=S.blds.filter(b=>b.own!=='ork'&&dist.has(key(b.r,b.c))&&canStop(u,b.r,b.c))
                     .sort((a,b)=>(a.kind==='hq'?-1:1)-(b.kind==='hq'?-1:1));
    if(objs.length){ await aiMove(u,objs[0].r,objs[0].c); S.sel=u; capture(); return; }
  }
  // avance
  const tgt=advanceObjective(S.units,S.blds,u);
  if(tgt){
    const field=costField(tgt.r,tgt.c,U[u.t].cls);
    const bk=bestAdvanceSpot(MAP,field,spots);
    if(bk!=null&&bk!==key(u.r,u.c)) await aiMove(u,(bk/COLS)|0,bk%COLS);
  }
  u.acted=true;u.moved=false;S.sel=null;render();
}
async function aiMove(u,r,c){
  const path=pathTo(u,r,c), el=unitEl(u.id);
  for(const k of path){
    u.r=(k/COLS)|0;u.c=k%COLS;
    if(el)el.style.transform=`translate(${u.c*TS}px,${u.r*TS}px)`;
    await sleep(T.AI_STEP);
  }
  u.moved=path.length>0; render();
}

/* actions offertes aux boutons du HUD, liées par main.js */
export const actions={
  cycleNext,openShop,endTurn,deselect,openTarget,capture,wait,undoMove,confirmAttack,buy,
  backToMoved(){S.phase='moved';render();},
  backToTarget(){S.phase='target';render();},
  cancelPreview(){S.phase='moved';S.pending=null;render();},
  closeShop(){S.phase='idle';render();}
};
