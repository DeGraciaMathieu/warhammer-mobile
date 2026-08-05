import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inb,unitAt,canStop} from '../src/rules/grid.js';

test('une case hors du plateau 12×10 est injouable', () => {
  assert.equal(inb(0,0), true);
  assert.equal(inb(11,9), true);
  assert.equal(inb(12,0), false);
  assert.equal(inb(0,10), false);
  assert.equal(inb(-1,3), false);
});

test('une unité détruite ne bloque plus sa case', () => {
  const units=[{id:1,r:4,c:4,hp:0},{id:2,r:4,c:5,hp:30}];
  assert.equal(unitAt(units,4,4), undefined);
  assert.equal(unitAt(units,4,5).id, 2);
});

test("une unité ne peut pas s'arrêter sur une case occupée, sauf la sienne", () => {
  const a={id:1,r:2,c:2,hp:100}, b={id:2,r:2,c:3,hp:100};
  const units=[a,b];
  assert.equal(canStop(units,a,2,3), false);  // occupée par b
  assert.equal(canStop(units,a,2,2), true);   // sa propre case
  assert.equal(canStop(units,a,5,5), true);   // case libre
});
