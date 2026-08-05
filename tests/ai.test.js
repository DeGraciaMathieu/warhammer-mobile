import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseBuy,bestAttack,advanceObjective,bestAdvanceSpot} from '../src/rules/ai.js';
import {key} from '../src/rules/grid.js';
import {AI} from '../src/config.js';

const plain=()=>Array.from({length:12},()=>Array(10).fill('.'));

test("l'achat IA descend la table des profils selon la réquisition et le tirage", () => {
  assert.equal(chooseBuy(9,()=>0), 'bat');      // tirage chanceux : le plus cher
  assert.equal(chooseBuy(9,()=>0.99), 'boy');   // tous les tirages ratent : chair à canon
  assert.equal(chooseBuy(5,()=>0), 'nob');      // pas assez pour bat/ddr/loo
  assert.equal(chooseBuy(1,()=>0), null);       // trop pauvre pour tout
});

test("l'IA trouve la case d'où elle peut détruire une cible affaiblie", () => {
  const boy={id:1,t:'boy',s:'ork',r:5,c:5,hp:100};
  const proie={id:2,t:'tac',s:'sm',r:5,c:7,hp:10};
  const dist=new Map([[key(5,5),0],[key(5,6),1]]);
  const best=bestAttack([boy,proie],plain(),boy,dist);
  assert.equal(best.e.id, 2);
  assert.equal(Math.abs(best.r-5)+Math.abs(best.c-7), 1);   // au contact de la proie
  assert.ok(best.sc>AI.ATTACK_THRESHOLD);
});

test("l'infanterie ork est aimantée par les objectifs, les véhicules par l'ennemi", () => {
  const marine={id:1,t:'tac',s:'sm',r:5,c:2,hp:100};        // à 6 cases
  const bastion={r:1,c:8,kind:'bastion',own:null};          // à 8 cases
  const boy={id:2,t:'boy',s:'ork',r:5,c:8,hp:100};          // infanterie : 8-3=5 < 6
  const bug={id:3,t:'bug',s:'ork',r:5,c:8,hp:100};          // véhicule : 8+6=14 > 6
  assert.deepEqual((({r,c})=>({r,c}))(advanceObjective([marine,boy],[bastion],boy)), {r:1,c:8});
  assert.deepEqual((({r,c})=>({r,c}))(advanceObjective([marine,bug],[bastion],bug)), {r:5,c:2});
});

test("à distance égale, l'IA avance vers la case qui offre du couvert", () => {
  const map=plain(); map[5][6]='u';                          // ruines
  const field=new Map([[key(5,6),3],[key(4,6),3]]);
  assert.equal(bestAdvanceSpot(map,field,[key(4,6),key(5,6)]), key(5,6));
});
