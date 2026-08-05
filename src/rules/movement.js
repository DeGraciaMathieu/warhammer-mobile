/* Déplacement — cases atteignables (Dijkstra), chemins, empreintes de tir. */
import {COLS,DIRS,COST,U} from '../config.js';
import {key,inb,unitAt,canStop} from './grid.js';

export function reachable(units,map,u){
  const cost=COST[U[u.t].cls], dist=new Map(), prev=new Map(), pq=[[0,u.r,u.c]];
  dist.set(key(u.r,u.c),0);
  while(pq.length){
    pq.sort((a,b)=>a[0]-b[0]);
    const [d,r,c]=pq.shift();
    if(d>(dist.get(key(r,c))??Infinity))continue;
    for(const [dr,dc] of DIRS){
      const nr=r+dr,nc=c+dc; if(!inb(nr,nc))continue;
      const cc=cost[map[nr][nc]]; if(cc==null)continue;
      const o=unitAt(units,nr,nc); if(o&&o.s!==u.s)continue;
      const nd=d+cc;
      if(nd<=U[u.t].mv&&nd<(dist.get(key(nr,nc))??Infinity)){
        dist.set(key(nr,nc),nd); prev.set(key(nr,nc),key(r,c)); pq.push([nd,nr,nc]);
      }
    }
  }
  return {dist,prev};
}
export function pathTo(prev,u,r,c){
  const p=[]; let k=key(r,c);
  while(k!==undefined&&k!==key(u.r,u.c)){p.unshift(k);k=prev.get(k);}
  return p;
}
function ringFrom(origins,a,b){
  const out=new Set();
  origins.forEach(k=>{
    const r=(k/COLS)|0,c=k%COLS;
    for(let dr=-b;dr<=b;dr++)for(let dc=-b;dc<=b;dc++){
      const m=Math.abs(dr)+Math.abs(dc);
      if(m<a||m>b)continue;
      if(inb(r+dr,c+dc)) out.add(key(r+dr,c+dc));
    }
  });
  return out;
}
/* empreinte réelle : le tir indirect ne frappe que depuis sa position actuelle */
export function atkFootprint(units,reach,u){
  const [a,b]=U[u.t].rng;
  const origins = b>1 ? [key(u.r,u.c)] : [...reach.keys()].filter(k=>canStop(units,u,(k/COLS)|0,k%COLS));
  return ringFrom(origins,a,b);
}
/* empreinte potentielle : anneau depuis chaque arrêt possible, même pour le tir
   indirect — sert à l'affichage de sélection, jamais à la résolution ni à la menace */
export function potentialFootprint(units,reach,u){
  const [a,b]=U[u.t].rng;
  const origins=[...reach.keys()].filter(k=>canStop(units,u,(k/COLS)|0,k%COLS));
  return ringFrom(origins,a,b);
}
export function threatZone(units,map,side){
  const out=new Set();
  units.filter(u=>u.hp>0&&u.s===side).forEach(u=>{
    const reach=reachable(units,map,u).dist;
    atkFootprint(units,reach,u).forEach(k=>out.add(k));
  });
  return out;
}
/* champ de distance depuis une case cible, sans limite de mouvement (avance IA) */
export function costField(map,tr,tc,cls){
  const cost=COST[cls],dist=new Map([[key(tr,tc),0]]),pq=[[0,tr,tc]];
  while(pq.length){
    pq.sort((a,b)=>a[0]-b[0]);
    const[d,r,c]=pq.shift(); if(d>(dist.get(key(r,c))??Infinity))continue;
    for(const[dr,dc]of DIRS){
      const nr=r+dr,nc=c+dc; if(!inb(nr,nc))continue;
      const cc=cost[map[nr][nc]]; if(cc==null)continue;
      const nd=d+cc;
      if(nd<(dist.get(key(nr,nc))??Infinity)){dist.set(key(nr,nc),nd);pq.push([nd,nr,nc]);}
    }
  }
  return dist;
}
