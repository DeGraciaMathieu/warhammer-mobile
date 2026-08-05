/* État du jeu — la carte, la graine, l'objet S et sa fabrique. */
import {ROWS,COLS,U,START_REQUISITION,CAPTURE_GAUGE,UNIT_MAX_HP} from '../config.js';
import {generateMap,initialPlacements} from '../rules/mapgen.js';

export let S=null, MAP=[], SEED=0;
let uid=1;
export const tile=(r,c)=>MAP[r][c];
export const nextId=()=>uid++;

export function newGameState(seed){
  SEED=seed>>>0;
  MAP=generateMap(SEED).map;
  S={turn:1,side:'sm',req:{sm:START_REQUISITION,ork:START_REQUISITION},units:[],blds:[],sel:null,phase:'idle',
     from:null,targets:[],pending:null,danger:false,over:false};
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const t=tile(r,c);
    if(t==='B') S.blds.push({r,c,kind:'bastion',own:null,cap:CAPTURE_GAUGE});
    if(t==='H') S.blds.push({r,c,kind:'hq',own:'sm',cap:CAPTURE_GAUGE});
    if(t==='O') S.blds.push({r,c,kind:'hq',own:'ork',cap:CAPTURE_GAUGE});
  }
  const add=(t,r,c)=>S.units.push({id:nextId(),t,s:U[t].s,r,c,hp:UNIT_MAX_HP,acted:false});
  initialPlacements(MAP).forEach(p=>add(p.t,p.r,p.c));
  S.hq={sm:S.blds.find(b=>b.kind==='hq'&&b.own==='sm'),
        ork:S.blds.find(b=>b.kind==='hq'&&b.own==='ork')};
}
