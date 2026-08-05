/* Règles de cycle — revenu, soin, capture des bâtiments, condition de victoire. */
import {UNIT_MAX_HP,BUILDING_HEAL,CAPTURE_GAUGE} from '../config.js';

/* réquisition gagnée en début de cycle : 1 par bâtiment tenu */
export const turnIncome=(blds,side)=>blds.filter(b=>b.own===side).length;

/* PV après un cycle passé sur un bâtiment allié */
export const healedHp=hp=>hp<UNIT_MAX_HP?Math.min(UNIT_MAX_HP,hp+BUILDING_HEAL):hp;

/* progression de capture : la jauge descend des PV affichés de l'unité */
export function captureProgress(cap,unitBars){
  const next=cap-unitBars;
  return next<=0 ? {cap:CAPTURE_GAUGE,captured:true} : {cap:next,captured:false};
}

/* vainqueur : forteresse adverse prise, ou armée adverse détruite */
export function winnerOf(units,hqSm,hqOrk){
  const smU=units.filter(u=>u.hp>0&&u.s==='sm').length;
  const orkU=units.filter(u=>u.hp>0&&u.s==='ork').length;
  let win=null;
  if(hqOrk.own==='sm'||orkU===0) win='sm';
  if(hqSm.own==='ork'||smU===0) win='ork';
  return win;
}
