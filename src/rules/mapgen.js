/* Génération procédurale du champ de bataille.
   On ne dessine que la moitié haute, puis on la fait pivoter de 180° :
   les deux camps héritent exactement du même terrain, jamais de carte injuste. */
import {ROWS,COLS,DIRS,MAPGEN,FALLBACK,INITIAL_FORCES} from '../config.js';
import {mulberry32} from '../rng.js';

export function generateMap(seed){
  const rnd=mulberry32(seed>>>0), H=ROWS>>1, mr=r=>ROWS-1-r, mc=c=>COLS-1-c;

  for(let attempt=0;attempt<MAPGEN.MAX_ATTEMPTS;attempt++){
    const g=Array.from({length:ROWS},()=>Array(COLS).fill('.'));

    // amas de terrain par marche aléatoire (plus organique qu'un semis uniforme)
    const scatter=(ch,cl,mn,mx)=>{
      for(let i=0;i<cl;i++){
        let r=Math.floor(rnd()*H), c=Math.floor(rnd()*COLS);
        const n=mn+Math.floor(rnd()*(mx-mn+1));
        for(let k=0;k<n;k++){
          if(r<0||r>=H||c<0||c>=COLS)break;
          if(g[r][c]==='.')g[r][c]=ch;
          const d=DIRS[Math.floor(rnd()*4)]; r+=d[0]; c+=d[1];
        }
      }
    };
    MAPGEN.CLUSTERS.forEach(cl=>scatter(cl.terrain,cl.count,cl.min,cl.max));

    // forteresse, avec son dégagement immédiat
    const hqc=MAPGEN.HQ_COL_MARGIN+Math.floor(rnd()*(COLS-2*MAPGEN.HQ_COL_MARGIN));
    g[0][hqc]='O';
    DIRS.forEach(([dr,dc])=>{const r=dr,c=hqc+dc;
      if(r>=0&&r<H&&c>=0&&c<COLS&&g[r][c]==='#')g[r][c]='.';});

    // route : descente depuis la forteresse avec des écarts latéraux
    let cc=hqc;
    for(let r=1;r<H;r++){
      if(rnd()<MAPGEN.ROAD_TURN_PROB){const n=cc+(rnd()<.5?-1:1); if(n>=1&&n<COLS-1){g[r][cc]='r';cc=n;}}
      g[r][cc]='r';
    }
    // segment horizontal sur la ligne de front : garantit la jonction avec la route miroir
    for(let c=Math.min(cc,mc(cc));c<=Math.max(cc,mc(cc));c++) g[H-1][c]='r';

    // bastions : espacés, loin de la forteresse, au moins un par flanc
    const cand=[];
    for(let r=1;r<H;r++)for(let c=0;c<COLS;c++)
      if(g[r][c]==='.'&&r+Math.abs(c-hqc)>=MAPGEN.BASTION_HQ_DIST) cand.push([r,c]);
    for(let i=cand.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[cand[i],cand[j]]=[cand[j],cand[i]];}
    const bs=[];
    for(const[r,c] of cand){
      if(bs.every(([r2,c2])=>Math.abs(r-r2)+Math.abs(c-c2)>=MAPGEN.BASTION_SPACING)) bs.push([r,c]);
      if(bs.length===MAPGEN.BASTION_COUNT)break;
    }
    if(bs.length<MAPGEN.BASTION_COUNT) continue;
    if(!bs.some(([,c])=>c<=MAPGEN.FLANK_LEFT_COL)||!bs.some(([,c])=>c>=COLS-MAPGEN.FLANK_RIGHT_OFFSET)) continue;
    bs.forEach(([r,c])=>g[r][c]='B');

    // rotation 180°
    for(let r=0;r<H;r++)for(let c=0;c<COLS;c++){
      const ch=g[r][c];
      g[mr(r)][mc(c)] = ch==='O' ? 'H' : ch;
    }

    // réparation de connexité : on ouvre les rochers qui isolent une poche
    let ok=false;
    for(let it=0;it<MAPGEN.REPAIR_ITERATIONS;it++){
      const seen=new Set([hqc]), q=[[0,hqc]];
      while(q.length){
        const[r,c]=q.shift();
        for(const[dr,dc] of DIRS){
          const nr=r+dr,nc=c+dc,k=nr*COLS+nc;
          if(nr<0||nr>=ROWS||nc<0||nc>=COLS||seen.has(k)||g[nr][nc]==='#')continue;
          seen.add(k); q.push([nr,nc]);
        }
      }
      let orphan=false;
      for(let r=0;r<ROWS&&!orphan;r++)for(let c=0;c<COLS;c++)
        if(g[r][c]!=='#'&&!seen.has(r*COLS+c)){orphan=true;break;}
      if(!orphan){ok=true;break;}
      let opened=false;
      for(let r=0;r<ROWS&&!opened;r++)for(let c=0;c<COLS&&!opened;c++){
        if(g[r][c]!=='#')continue;
        let touchIn=false,touchOut=false;
        for(const[dr,dc] of DIRS){
          const nr=r+dr,nc=c+dc;
          if(nr<0||nr>=ROWS||nc<0||nc>=COLS||g[nr][nc]==='#')continue;
          if(seen.has(nr*COLS+nc))touchIn=true; else touchOut=true;
        }
        if(touchIn&&touchOut){g[r][c]='.';g[mr(r)][mc(c)]='.';opened=true;}
      }
      if(!opened)break;
    }
    if(!ok) continue;

    // densité : ni terrain vide, ni labyrinthe
    const solid=g.flat().filter(x=>x!=='.').length/(ROWS*COLS);
    if(solid<MAPGEN.DENSITY_MIN||solid>MAPGEN.DENSITY_MAX) continue;
    // la forteresse doit rester praticable
    const libres=DIRS.filter(([dr,dc])=>{const r=dr,c=hqc+dc;
      return r>=0&&r<ROWS&&c>=0&&c<COLS&&g[r][c]!=='#';}).length;
    if(libres<MAPGEN.HQ_MIN_OPEN) continue;

    return {map:g, fromFallback:false};
  }
  return {map:FALLBACK.map(s=>s.split('')), fromFallback:true};
}

/* déploiement initial : on cherche les cases libres les plus proches de la forteresse,
   et on place l'armée adverse sur les cases miroir */
export function initialPlacements(map){
  let hr=ROWS-1,hc=0;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++) if(map[r][c]==='H'){hr=r;hc=c;}
  const seen=new Set([hr*COLS+hc]), q=[[hr,hc]], slots=[];
  while(q.length&&slots.length<MAPGEN.DEPLOY_SLOTS){
    const[r,c]=q.shift();
    for(const[dr,dc] of DIRS){
      const nr=r+dr,nc=c+dc,k=nr*COLS+nc;
      if(nr<0||nr>=ROWS||nc<0||nc>=COLS||seen.has(k))continue;
      seen.add(k);
      const t=map[nr][nc];
      if(t==='#')continue;
      q.push([nr,nc]);
      if('.rfuc'.indexOf(t)>=0) slots.push([nr,nc]);
    }
  }
  const out=[];
  slots.forEach(([r,c],i)=>{if(i<INITIAL_FORCES.sm.length) out.push({t:INITIAL_FORCES.sm[i],r,c});});
  slots.forEach(([r,c],i)=>{if(i<INITIAL_FORCES.ork.length) out.push({t:INITIAL_FORCES.ork[i],r:ROWS-1-r,c:COLS-1-c});});
  return out;
}
