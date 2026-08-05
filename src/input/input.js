/* Entrées — écouteurs bruts, traduits en intentions passées par main.js. */
export function initInput(h){
  const board=document.getElementById('board');
  board.addEventListener('click',e=>{
    const rc=board.getBoundingClientRect(), ts=h.tileSize();
    const c=Math.floor((e.clientX-rc.left)/ts), r=Math.floor((e.clientY-rc.top)/ts);
    h.onCellTap(r,c);
  });
  document.getElementById('btnDanger').onclick=h.onDanger;
  document.getElementById('btnSound').onclick=h.onSound;
  document.getElementById('btnHelp').onclick=h.onHelp;
  document.getElementById('btnClose').onclick=h.onCloseModal;
  addEventListener('resize',h.onResize);
}
