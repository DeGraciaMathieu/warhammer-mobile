import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateMap,initialPlacements} from '../src/rules/mapgen.js';
import {INITIAL_FORCES,ROWS,COLS} from '../src/config.js';

test('la même graine produit exactement la même carte', () => {
  const a=generateMap(42), b=generateMap(42);
  assert.deepEqual(a.map, b.map);
  assert.equal(a.fromFallback, false);
});

test('la carte est symétrique par rotation de 180°, forteresses échangées', () => {
  const {map}=generateMap(42);
  const sym=ch=>ch==='O'?'H':ch==='H'?'O':ch;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)
    assert.equal(map[ROWS-1-r][COLS-1-c], sym(map[r][c]), `case ${r},${c}`);
});

test('chaque camp reçoit sa forteresse et trois bastions', () => {
  const flat=generateMap(7).map.flat();
  assert.equal(flat.filter(t=>t==='H').length, 1);
  assert.equal(flat.filter(t=>t==='O').length, 1);
  assert.equal(flat.filter(t=>t==='B').length, 6);
});

test('les armées initiales sont posées en miroir autour des forteresses', () => {
  const {map}=generateMap(42);
  const p=initialPlacements(map);
  assert.equal(p.length, INITIAL_FORCES.sm.length+INITIAL_FORCES.ork.length);
  const sm=p.slice(0,INITIAL_FORCES.sm.length), ork=p.slice(INITIAL_FORCES.sm.length);
  ork.slice(0,sm.length).forEach((o,i)=>{   // les 5 premiers orks reflètent les 5 slots Astartes
    assert.equal(o.r, ROWS-1-sm[i].r);
    assert.equal(o.c, COLS-1-sm[i].c);
  });
});
