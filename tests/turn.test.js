import {test} from 'node:test';
import assert from 'node:assert/strict';
import {turnIncome,healedHp,captureProgress,winnerOf} from '../src/rules/turn.js';

test('chaque bâtiment tenu rapporte 1 réquisition par cycle', () => {
  const blds=[{own:'sm'},{own:'sm'},{own:'ork'},{own:null}];
  assert.equal(turnIncome(blds,'sm'), 2);
  assert.equal(turnIncome(blds,'ork'), 1);
});

test('une unité sur un bâtiment allié récupère 20 points, plafonnés au maximum', () => {
  assert.equal(healedHp(30), 50);
  assert.equal(healedHp(85), 100);
  assert.equal(healedHp(100), 100);
});

test('la jauge de capture descend des PV de l’unité et se réarme une fois prise', () => {
  assert.deepEqual(captureProgress(20,10), {cap:10,captured:false});
  assert.deepEqual(captureProgress(5,10), {cap:20,captured:true});
});

test('victoire : forteresse adverse prise ou armée adverse détruite', () => {
  const hqSm={own:'sm'}, hqOrk={own:'ork'};
  const both=[{s:'sm',hp:50},{s:'ork',hp:50}];
  assert.equal(winnerOf(both,hqSm,hqOrk), null);
  assert.equal(winnerOf(both,hqSm,{own:'sm'}), 'sm');           // forteresse ork prise
  assert.equal(winnerOf([{s:'sm',hp:50},{s:'ork',hp:0}],hqSm,hqOrk), 'sm');
  assert.equal(winnerOf([{s:'sm',hp:0},{s:'ork',hp:50}],hqSm,hqOrk), 'ork');
});
