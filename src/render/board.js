/* Rendu du plateau — tuiles de terrain, pions, bâtiments, overlays, effets. */
import {ROWS,COLS,T,MIN_TILE,BOARD_MARGIN,CAPTURE_GAUGE,BARS_MAX} from '../config.js';
import {S,MAP,tile} from '../state/state.js';
import {key,inb,canStop} from '../rules/grid.js';
import {bars} from '../rules/combat.js';
import {potentialFootprint,threatZone} from '../rules/movement.js';
import {svg} from './icons.js';
import {$} from './dom.js';

export const board=document.getElementById('board');
export let TS=44;
export const unitEl=id=>board.querySelector('.u[data-id="'+id+'"]');

const TBG={'.':'#2e363d','r':'#2e363d','f':'#26332b','u':'#333b42','c':'#252c32','#':'#161d22','B':'#303840','H':'#303840','O':'#303840'};
const BRACKETS='<g fill="none" stroke="#d0a63a" stroke-width="1.6" opacity=".75"><path d="M3 8V3h5"/><path d="M32 3h5v5"/><path d="M37 32v5h-5"/><path d="M8 37H3v-5"/></g>';
const wrapSVG=i=>'<svg viewBox="0 0 40 40" preserveAspectRatio="none">'+i+'</svg>';

function terrainSVG(t,r,c){
  switch(t){
    case 'r':{
      let d='';
      const arms=[[-1,0,'M20 20V-1'],[1,0,'M20 20V41'],[0,-1,'M20 20H-1'],[0,1,'M20 20H41']];
      arms.forEach(([dr,dc,p])=>{const nr=r+dr,nc=c+dc;
        if(inb(nr,nc)&&'rHO'.indexOf(tile(nr,nc))>=0) d+=p;});
      if(!d) d='M20 20h.01';
      return wrapSVG(
        `<path d="${d}" fill="none" stroke="#464f57" stroke-width="16"/>`+
        `<path d="${d}" fill="none" stroke="#5b6570" stroke-width="13"/>`+
        `<path d="${d}" fill="none" stroke="#0000002e" stroke-width="1.6" stroke-dasharray="3 4"/>`);
    }
    case 'f': return wrapSVG(
      '<g fill="#2b4a34"><circle cx="11" cy="14" r="7"/><circle cx="27" cy="11" r="6"/><circle cx="20" cy="27" r="7.5"/><circle cx="32" cy="28" r="5.5"/></g>'+
      '<g fill="#3a6544"><circle cx="10" cy="12.5" r="4.4"/><circle cx="26" cy="9.5" r="3.6"/><circle cx="19" cy="25.5" r="4.6"/><circle cx="31" cy="27" r="3"/></g>');
    case 'u': return wrapSVG(
      '<g fill="#454f58" stroke="#10161b" stroke-width="1"><path d="M5.5 22.5h12v14h-12z"/><path d="M20.5 10.5h8v26h-8z"/><path d="M30.5 25.5h6v11h-6z"/></g>'+
      '<g fill="#5d6871"><path d="M5.5 22.5h12v2.6h-12z"/><path d="M20.5 10.5h8v2.6h-8z"/><path d="M30.5 25.5h6v2.6h-6z"/></g>');
    case 'c': return wrapSVG(
      '<ellipse cx="20" cy="21" rx="14" ry="11" fill="#1d242a"/>'+
      '<ellipse cx="20" cy="20" rx="9" ry="6.5" fill="#141a1f"/>'+
      '<ellipse cx="20" cy="21" rx="14" ry="11" fill="none" stroke="#4c565f" stroke-width="1.1" stroke-dasharray="4 3"/>');
    case '#': return wrapSVG(
      '<path d="M2 38 11 9l10 8 8-10 7 31z" fill="#222a31"/>'+
      '<path d="M11 9l10 8-5 6z" fill="#37424b"/>'+
      '<g stroke="#0c1216" stroke-width="1" opacity=".55"><path d="M5 31h30M8 23h24M12 15h16"/></g>');
    case 'B': return wrapSVG(
      '<rect x="8" y="11" width="24" height="22" fill="#3b444d" stroke="#0e1418"/>'+
      '<rect x="8" y="11" width="24" height="4.5" fill="#525d67"/>'+
      '<g fill="#1a2127"><rect x="13" y="20" width="5.5" height="13"/><rect x="22" y="20" width="5.5" height="8"/></g>'+BRACKETS);
    case 'H': case 'O': return wrapSVG(
      '<rect x="5" y="7" width="30" height="27" fill="#414b55" stroke="#0e1418"/>'+
      '<rect x="8.5" y="10.5" width="23" height="20" fill="none" stroke="#5f6b76"/>'+
      '<path d="M20 13.5l6.5 8h-3.8v6h-5.4v-6h-3.8z" fill="#ccd6df"/>'+BRACKETS);
    default: return wrapSVG(
      '<g stroke="#ffffff0f" stroke-width="1" fill="none"><path d="M6 28q6-3.5 11 0"/><path d="M24 11q5-2 9 1"/></g>'+
      '<g fill="#ffffff0d"><circle cx="31" cy="31" r="1.3"/><circle cx="12" cy="15" r="1"/><circle cx="25" cy="24" r="1"/></g>');
  }
}
export function buildTiles(){
  board.querySelectorAll('.t,.u,.ov').forEach(e=>e.remove());
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const t=tile(r,c), d=document.createElement('div');
    d.className='t'; d.dataset.k=key(r,c);
    d.style.background=TBG[t]||'#2e363d';
    d.innerHTML=terrainSVG(t,r,c);
    board.appendChild(d);
  }
}
export function layout(){
  const w=$('wrap');
  TS=Math.max(MIN_TILE,Math.floor(Math.min((w.clientWidth-BOARD_MARGIN)/COLS,(w.clientHeight-BOARD_MARGIN)/ROWS)));
  document.documentElement.style.setProperty('--ts',TS+'px');
  board.style.width=TS*COLS+'px'; board.style.height=TS*ROWS+'px';
  board.querySelectorAll('.t').forEach(d=>{
    const k=+d.dataset.k, r=(k/COLS)|0, c=k%COLS;
    d.style.cssText+=`;left:${c*TS}px;top:${r*TS}px;width:${TS}px;height:${TS}px`;
  });
}

export function renderBlds(){
  S.blds.forEach(b=>{
    const el=board.querySelector('.t[data-k="'+key(b.r,b.c)+'"]');
    el.querySelectorAll('.b-owner,.b-cap').forEach(e=>e.remove());
    const o=document.createElement('div'); o.className='b-owner';
    o.style.background=b.own==='sm'?'var(--sm)':b.own==='ork'?'var(--ork)':'#6a6357';
    el.appendChild(o);
    if(b.cap<CAPTURE_GAUGE){const c=document.createElement('div');c.className='b-cap';c.textContent=b.cap;el.appendChild(c);}
  });
}
export function renderUnits(){
  const seen=new Set();
  S.units.filter(u=>u.hp>0).forEach(u=>{
    seen.add(u.id);
    let el=unitEl(u.id);
    if(!el){
      el=document.createElement('div'); el.className='u'; el.dataset.id=u.id;
      el.innerHTML='<div class="box">'+svg(u.t)+'<div class="gauge"><i></i></div></div>';
      board.appendChild(el);
    }
    el.style.width=TS+'px'; el.style.height=TS+'px';
    el.style.setProperty('--x',u.c*TS+'px'); el.style.setProperty('--y',u.r*TS+'px');
    el.style.transform=`translate(${u.c*TS}px,${u.r*TS}px)`;
    el.className='u '+u.s+(u.acted?' done':'')+(S.sel===u?' sel':'');
    const box=el.firstChild;
    box.querySelectorAll('.hp,.cap').forEach(e=>e.remove());
    const g=box.querySelector('.gauge i');
    if(g){g.style.width=Math.max(4,u.hp)+'%';g.className=bars(u)<=3?'low':'';}
    if(bars(u)<BARS_MAX){const h=document.createElement('div');h.className='hp'+(bars(u)<=3?' low':'');h.textContent=bars(u);box.appendChild(h);}
    if(u.capturing){const cc=document.createElement('div');cc.className='cap';cc.textContent='⚑';box.appendChild(cc);}
  });
  board.querySelectorAll('.u').forEach(el=>{ if(!seen.has(+el.dataset.id)) el.remove(); });
}
const TG_SVG='<svg viewBox="0 0 40 40"><g fill="none" stroke="#ff6f45" stroke-width="3.4" stroke-linecap="square">'+
  '<path d="M2.5 12v-9.5h9.5"/><path d="M28 2.5h9.5V12"/><path d="M37.5 28v9.5H28"/><path d="M12 37.5H2.5V28"/></g></svg>';
function ov(r,c,cls){
  const d=document.createElement('div'); d.className='ov '+cls;
  d.style.cssText=`left:${c*TS}px;top:${r*TS}px;width:${TS}px;height:${TS}px`;
  if(cls==='tg') d.innerHTML=TG_SVG;
  board.appendChild(d);
}
export function renderOv(){
  board.querySelectorAll('.ov').forEach(e=>e.remove());
  if(S.danger){
    const z=threatZone(S.units,MAP,S.side==='sm'?'ork':'sm');
    z.forEach(k=>ov((k/COLS)|0,k%COLS,'dz'));
  }
  if(S.phase==='sel'&&S.sel){
    S.reach.forEach((_,k)=>{ if(canStop(S.units,S.sel,(k/COLS)|0,k%COLS)) ov((k/COLS)|0,k%COLS,'mv'); });
    /* bleu pur sur le déplacement ; le rouge ne commence qu'au-delà, avec la portée
       potentielle depuis chaque arrêt possible (y compris pour le tir indirect) */
    potentialFootprint(S.units,S.reach,S.sel).forEach(k=>{ if(!S.reach.has(k)) ov((k/COLS)|0,k%COLS,'at'); });
  }
  if(S.phase==='moved'||S.phase==='target'||S.phase==='preview'){
    S.targets.forEach(e=>ov(e.r,e.c,'tg'));
  }
}

export function banner(t){
  const b=$('banner');b.querySelector('span').textContent=t;
  b.classList.toggle('sm',S.side==='sm');
  b.classList.toggle('ork',S.side==='ork');
  b.classList.remove('show');void b.offsetWidth;b.classList.add('show');
}
export function floatFX(r,c,txt,cls){
  const d=document.createElement('div');
  d.className='fx '+(cls||''); d.textContent=txt;
  d.style.cssText=`left:${c*TS}px;top:${r*TS-6}px;width:${TS}px`;
  board.appendChild(d); setTimeout(()=>d.remove(),T.FX_LIFETIME);
}
