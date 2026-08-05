/* Son et vibration — Web Audio inline, coupables ensemble via le bouton ♪. */
let AC=null, muted=false;

export function blip(f,d,type,vol){
  if(muted)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(),g=AC.createGain();
    o.type=type||'square';o.frequency.value=f;g.gain.value=vol||.04;
    o.connect(g);g.connect(AC.destination);o.start();
    g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+(d||.08));
    o.stop(AC.currentTime+(d||.08));
  }catch(e){}
}
export const play=s=>blip(s.f,s.d,s.type,s.vol);
export function vib(ms){if(navigator.vibrate&&!muted)navigator.vibrate(ms);}
export function toggleMute(){muted=!muted;return muted;}
