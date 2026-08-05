import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reachable,pathTo,atkFootprint,threatZone,costField} from '../src/rules/movement.js';
import {key} from '../src/rules/grid.js';

const plain=()=>Array.from({length:12},()=>Array(10).fill('.'));

test('le mouvement est borné par le budget de déplacement de l’unité', () => {
  const u={id:1,t:'tac',s:'sm',r:5,c:5,hp:100};   // à pied, 3 de mouvement
  const {dist}=reachable([u],plain(),u);
  assert.equal(dist.has(key(5,8)), true);          // à 3 cases
  assert.equal(dist.has(key(5,9)), false);         // à 4 cases
});

test('un rocher est infranchissable, un ennemi bloque le passage, un allié non', () => {
  const u={id:1,t:'tac',s:'sm',r:5,c:5,hp:100};
  const rock=plain(); rock[5][6]='#';
  assert.equal(reachable([u],rock,u).dist.has(key(5,6)), false);
  const foe={id:2,t:'boy',s:'ork',r:5,c:6,hp:100};
  assert.equal(reachable([u,foe],plain(),u).dist.has(key(5,6)), false);
  const ally={id:3,t:'tac',s:'sm',r:5,c:6,hp:100};
  assert.equal(reachable([u,ally],plain(),u).dist.has(key(5,7)), true); // traverse l'allié
});

test('le chemin reconstruit va de la case de départ (exclue) à l’arrivée', () => {
  const u={id:1,t:'tac',s:'sm',r:5,c:5,hp:100};
  const {prev}=reachable([u],plain(),u);
  const p=pathTo(prev,u,5,8);
  assert.deepEqual(p, [key(5,6),key(5,7),key(5,8)]);
});

test('le tir indirect ne s’étend que depuis la position actuelle, en anneau 2-3', () => {
  const u={id:1,t:'dev',s:'sm',r:5,c:5,hp:100};
  const {dist}=reachable([u],plain(),u);
  const fp=atkFootprint([u],dist,u);
  assert.equal(fp.has(key(5,7)), true);            // distance 2
  assert.equal(fp.has(key(5,8)), true);            // distance 3
  assert.equal(fp.has(key(5,6)), false);           // trop près
});

test('la zone de menace couvre tout ce que le camp peut atteindre puis frapper', () => {
  const boy={id:1,t:'boy',s:'ork',r:5,c:5,hp:100}; // 3 de mouvement + contact
  const z=threatZone([boy],plain(),'ork');
  assert.equal(z.has(key(5,9)), true);             // 3 pas + 1 case de frappe
  assert.equal(z.has(key(0,0)), false);
});

test('le champ de distance de l’IA ignore la limite de mouvement mais pas le terrain', () => {
  const rock=plain(); for(let r=0;r<12;r++) rock[r][6]='#';   // mur complet
  const field=costField(rock,5,5,'pied');
  assert.equal(field.get(key(5,0)), 5);
  assert.equal(field.has(key(5,7)), false);        // de l'autre côté du mur
});
