/* Décisions de l'IA Ork — achat, choix d'attaque, choix d'avance.
   Décisions pures : l'exécution (déplacements, frappes, délais) reste dans la boucle. */
import {COLS,U,TDEF,AI} from '../config.js';
import {canStop} from './grid.js';
import {targetsFrom,dmgCalc,counterOf} from './combat.js';

/* achat : premier profil éligible de la table, un tirage par profil tenté */
export function chooseBuy(req,rng){
  const choice=AI.BUY.find(o=>req>=o.req&&(o.p>=1||rng()<o.p));
  return choice?choice.t:null;
}

/* meilleure attaque atteignable, tous points de tir confondus */
export function bestAttack(units,map,u,dist){
  const spots=[...dist.keys()].filter(k=>canStop(units,u,(k/COLS)|0,k%COLS));
  let best=null;
  for(const k of spots){
    const r=(k/COLS)|0,c=k%COLS;
    for(const e of targetsFrom(units,u,r,c)){
      const d=dmgCalc(units,map,u,e,r,c), kill=d>=e.hp;
      const ct=kill?0:counterOf(units,map,u,e,r,c);
      const sc=Math.min(d,e.hp)*1 + (kill?AI.KILL_BONUS:0) - ct*AI.COUNTER_WEIGHT
               + TDEF[map[r][c]]*AI.TERRAIN_WEIGHT + U[e.t].cost*AI.COST_WEIGHT
               + (U[e.t].rng[1]>1?AI.INDIRECT_BONUS:0);
      if(!best||sc>best.sc)best={sc,r,c,e};
    }
  }
  return best;
}

/* objectif d'avance : unité ennemie ou bâtiment à reprendre, au plus court pondéré */
export function advanceObjective(units,blds,u){
  let tgt=null,bd=1e9;
  const cands=units.filter(e=>e.hp>0&&e.s==='sm');
  const objs=blds.filter(b=>b.own!=='ork');
  [...cands.map(e=>({r:e.r,c:e.c,w:0})),...objs.map(b=>({r:b.r,c:b.c,w:U[u.t].inf?AI.OBJ_WEIGHT_INF:AI.OBJ_WEIGHT_NONINF}))].forEach(o=>{
    const d=Math.abs(o.r-u.r)+Math.abs(o.c-u.c)+o.w;
    if(d<bd){bd=d;tgt=o;}
  });
  return tgt;
}

/* point d'avance : minimise la distance au but, bonus pour le couvert */
export function bestAdvanceSpot(map,field,spots){
  let bk=null,bv=1e9;
  for(const k of spots){
    const v=(field.get(k)??1e9)-TDEF[map[(k/COLS)|0][k%COLS]]*AI.ADVANCE_COVER_WEIGHT;
    if(v<bv){bv=v;bk=k;}
  }
  return bk;
}
