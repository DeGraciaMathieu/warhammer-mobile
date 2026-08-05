/* Relevé de combat — le détail chiffré affiché avant confirmation d'une attaque. */
import {U,TNAME,HP_PER_BAR,BARS_MAX,CODEX_FLOOR,DEF_POINT_PCT} from '../config.js';
import {S,tile} from '../state/state.js';
import {bars,toPV} from '../rules/combat.js';
import {svg} from './icons.js';
import {$} from './dom.js';

const fmtx=x=>x.toFixed(2).replace('.',',');
const chip=u=>`<span class="who ${u.s}">${svg(u.t)}</span>`;
function crow(l,v,cls){return `<div class="crow ${cls||''}"><div class="l">${l}</div><div class="v">${v||''}</div></div>`;}
function pipRow(u,after){
  const cur=bars(u), aft=after<=0?0:Math.max(1,Math.ceil(after/HP_PER_BAR));
  let h='<div class="pips">';
  for(let i=1;i<=BARS_MAX;i++) h+=`<div class="pip ${i<=aft?u.s:(i<=cur?'lost':'')}"></div>`;
  return h+`</div><div class="plabel">${U[u.t].n} · <b>${cur} → ${aft===0?'<span class="dead">détruit</span>':aft}</b> PV</div>`;
}
function calcBlock(a,d,dt,title){
  let h=`<div class="cs">${title}</div>`;
  h+=crow(`Puissance de feu<small>${U[a.t].n} contre blindage ${dt.armor==='veh'?'lourd':'léger'}</small>`,dt.base);
  if(dt.sc!==1) h+=crow(
      `Attaquant à ${Math.round(dt.raw*BARS_MAX)}/${BARS_MAX} PV`+(dt.codex?'<small>Discipline du Codex : plancher à '+fmtx(CODEX_FLOOR)+'</small>':''),
      '×'+fmtx(dt.sc), dt.codex?'pos':'neg');
  if(dt.orks) h+=crow(`Waaagh! · ${dt.orks} ork${dt.orks>1?'s':''} au contact`,'×'+fmtx(dt.mob),'pos');
  if(dt.tdef) h+=crow(`Couvert · ${TNAME[tile(d.r,d.c)]}`,'−'+dt.tdef*DEF_POINT_PCT+'%','neg');
  if(dt.udef) h+=crow('Blindage lourd de la cible','−'+dt.udef*DEF_POINT_PCT+'%','neg');
  if(dt.tdef+dt.udef) h+=crow('Défense cumulée','×'+fmtx(dt.red),'neg');
  if(dt.plancher) h+=crow('Plancher minimum de dégâts','= 5','pos');
  return h+`<div class="ctot"><div class="l">Dégâts</div><div class="big">${dt.dmg}</div><div class="pv">soit ${toPV(dt.dmg)} PV</div></div>`;
}
export function renderCombatPanel(){
  const p=S.pending,u=S.sel,c=$('combat');
  let h=`<div class="ch">${chip(u)}<b>${U[u.t].n}</b><span class="arrow">▸</span>${chip(p.t)}<b>${U[p.t.t].n}</b></div>`;
  h+=calcBlock(u,p.t,p.dtA,'Attaque')+pipRow(p.t,p.hpAfter);
  h+= p.dtC ? calcBlock(p.t,u,p.dtC,'Riposte')+pipRow(u,p.myAfter)
            : `<div class="cs">Riposte</div><div class="cnote">${p.why}</div>`;
  c.innerHTML=h; c.classList.add('show');
}
