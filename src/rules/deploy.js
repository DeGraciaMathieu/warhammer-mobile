/* Déploiement — condition d'achat d'une unité à la forteresse. */
import {U,ROSTER} from '../config.js';
import {unitAt} from './grid.js';

export function canDeploy(blds,units,req,side){
  const hq=blds.find(b=>b.kind==='hq'&&b.own===side);
  return !!(hq&&!unitAt(units,hq.r,hq.c)&&req>=Math.min(...ROSTER[side].map(t=>U[t].cost)));
}
