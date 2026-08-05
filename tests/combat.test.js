import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dmgDetail,dmgCalc,counterOf,targetsFrom,bars} from '../src/rules/combat.js';

const plain=()=>Array.from({length:12},()=>Array(10).fill('.'));

test('Discipline du Codex : un Astartes blessé frappe au plancher de 60%', () => {
  const a={id:1,t:'tac',s:'sm',r:5,c:5,hp:30};   // 3/10 PV
  const d={id:2,t:'boy',s:'ork',r:5,c:6,hp:100};
  const dt=dmgDetail([a,d],plain(),a,d);
  assert.equal(dt.codex, true);
  assert.equal(dt.sc, 0.6);
  assert.equal(dt.dmg, 33);                       // 55 × 0,6
});

test("Waaagh! : +5% de dégâts par ork adjacent à l'attaquant, plafonné à 3", () => {
  const a={id:1,t:'boy',s:'ork',r:5,c:5,hp:100};
  const d={id:2,t:'tac',s:'sm',r:5,c:6,hp:100};
  const mates=[{id:3,t:'boy',s:'ork',r:4,c:5,hp:100},{id:4,t:'boy',s:'ork',r:6,c:5,hp:100}];
  const dt=dmgDetail([a,d,...mates],plain(),a,d);
  assert.equal(dt.orks, 2);
  assert.equal(dt.dmg, 55);                       // 50 × 1,10
});

test('le couvert de la cible réduit les dégâts de 5% par point', () => {
  const map=plain(); map[5][6]='u';               // ruines : couvert 3
  const a={id:1,t:'tac',s:'sm',r:5,c:5,hp:100};
  const d={id:2,t:'boy',s:'ork',r:5,c:6,hp:100};
  assert.equal(dmgCalc([a,d],map,a,d), 47);       // 55 × 0,85 arrondi
});

test('un coup inflige toujours au moins 5 points de dégâts', () => {
  const map=plain(); map[5][6]='u';
  const a={id:1,t:'boy',s:'ork',r:5,c:5,hp:10};   // 1/10 PV, anti-blindé 12
  const d={id:2,t:'dre',s:'sm',r:5,c:6,hp:100};   // blindage 2, dans les ruines
  const dt=dmgDetail([a,d],map,a,d);
  assert.equal(dt.plancher, true);
  assert.equal(dt.dmg, 5);
});

test('la riposte : jamais pour un tireur indirect, jamais hors du contact', () => {
  const map=plain();
  const a={id:1,t:'boy',s:'ork',r:5,c:5,hp:100};
  const indirect={id:2,t:'dev',s:'sm',r:5,c:6,hp:100};
  assert.equal(counterOf([a,indirect],map,a,indirect,5,5), 0);
  const far={id:3,t:'tac',s:'sm',r:5,c:8,hp:100};
  assert.equal(counterOf([a,far],map,a,far,5,5), 0);
  const close={id:4,t:'tac',s:'sm',r:5,c:6,hp:100};
  assert.equal(counterOf([a,close],map,a,close,5,5), dmgCalc([a,close],map,close,a));
});

test('le tir indirect exige de rester immobile ce cycle', () => {
  const u={id:1,t:'dev',s:'sm',r:5,c:5,hp:100};   // portée 2-3
  const e1={id:2,t:'boy',s:'ork',r:5,c:7,hp:100}; // distance 2
  const e2={id:3,t:'boy',s:'ork',r:5,c:6,hp:100}; // distance 1 : trop près
  const units=[u,e1,e2];
  assert.deepEqual(targetsFrom(units,u,5,6), []);            // a bougé : aucune cible
  assert.deepEqual(targetsFrom(units,u,5,5).map(e=>e.id), [2]);
});

test('les barres de PV : 1 barre = 10 points, jamais moins de 1 tant que l’unité vit', () => {
  assert.equal(bars({hp:100}), 10);
  assert.equal(bars({hp:41}), 5);
  assert.equal(bars({hp:3}), 1);
});
