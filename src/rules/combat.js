/* Résolution des combats — dégâts, riposte, cibles à portée. */
import {U,TDEF,DIRS,BARS_MAX,HP_PER_BAR,MIN_DAMAGE,CODEX_FLOOR,WAAAGH_PCT,WAAAGH_MAX_ADJ,DEF_POINT_PCT} from '../config.js';
import {unitAt} from './grid.js';

export const bars=u=>Math.max(1,Math.ceil(u.hp/HP_PER_BAR));
export const toPV=n=>(n/HP_PER_BAR).toFixed(1).replace('.',',');

export function targetsFrom(units,u,r,c){
  const [a,b]=U[u.t].rng;
  if(b>1&&(r!==u.r||c!==u.c))return [];
  return units.filter(e=>e.hp>0&&e.s!==u.s&&Math.abs(e.r-r)+Math.abs(e.c-c)>=a&&Math.abs(e.r-r)+Math.abs(e.c-c)<=b);
}
export function dmgDetail(units,map,a,d,ar,ac){
  ar=ar??a.r; ac=ac??a.c;
  const A=U[a.t],D=U[d.t];
  const base=A.dmg[D.armor];
  const raw=bars(a)/BARS_MAX;
  let sc=raw, codex=false;
  if(a.s==='sm'&&raw<CODEX_FLOOR){sc=CODEX_FLOOR;codex=true;}   // Discipline du Codex
  let orks=0;
  if(a.s==='ork'){for(const[dr,dc]of DIRS){const o=unitAt(units,ar+dr,ac+dc);if(o&&o.s==='ork'&&o!==a)orks++;}}
  orks=Math.min(WAAAGH_MAX_ADJ,orks);
  const mob=1+orks*(WAAAGH_PCT/100);                            // Waaagh!
  const tdef=TDEF[map[d.r][d.c]], udef=D.df;
  const red=1-(tdef+udef)*(DEF_POINT_PCT/100);
  const brut=base*sc*mob*red;
  return {base,raw,sc,codex,orks,mob,tdef,udef,red,brut,dmg:Math.max(MIN_DAMAGE,Math.round(brut)),
          plancher:Math.round(brut)<MIN_DAMAGE,armor:D.armor};
}
export function dmgCalc(units,map,a,d,ar,ac){return dmgDetail(units,map,a,d,ar,ac).dmg;}
export function counterOf(units,map,a,d,ar,ac){
  if(U[d.t].rng[1]>1)return 0;
  if(Math.abs(d.r-ar)+Math.abs(d.c-ac)!==1)return 0;
  return dmgCalc(units,map,d,a,d.r,d.c);
}
