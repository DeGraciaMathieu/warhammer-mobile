/* Point d'entrée — câblage des couches, graine, démarrage. */
import {mulberry32,randomSeed} from './rng.js';
import {inb} from './rules/grid.js';
import {S,newGameState} from './state/state.js';
import {buildTiles,layout,banner,TS} from './render/board.js';
import {render} from './render/render.js';
import {bindActions as bindHudActions} from './render/hud.js';
import {bindActions as bindCodexActions,openCodex,closeModal} from './render/codex.js';
import {initInput} from './input/input.js';
import {initLoop,onTap,toggleDanger,actions} from './loop/turns.js';
import {toggleMute} from './audio.js';
import {$} from './render/dom.js';

function newGame(seed){
  newGameState(seed===undefined?randomSeed():seed);
  buildTiles(); layout(); render();
  banner("Cycle 1 — Astartes");
}
function regenNew(){closeModal();newGame();}
function regenSeed(){
  const v=parseInt(($('seedin')||{}).value,10);
  if(!isNaN(v)){closeModal();newGame(v>>>0);}
}
/* appelées par les onclick inline de la modale Codex — un module n'expose rien en global */
window.regenNew=regenNew; window.regenSeed=regenSeed;

initLoop(mulberry32(randomSeed()));
bindHudActions(actions);
bindCodexActions({newGame});
initInput({
  tileSize:()=>TS,
  onCellTap:(r,c)=>{ if(S.over||S.phase==='ai')return; if(inb(r,c)) onTap(r,c); },
  onDanger:toggleDanger,
  onSound:()=>{$('btnSound').textContent=toggleMute()?'✕':'♪';},
  onHelp:()=>openCodex(false),
  onCloseModal:closeModal,
  onResize:()=>{layout();render();}
});

newGame();
openCodex(true);
