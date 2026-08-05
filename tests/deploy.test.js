import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canDeploy} from '../src/rules/deploy.js';

const hq={r:11,c:5,kind:'hq',own:'sm'};

test('déployer exige une forteresse tenue, libre, et assez de réquisition', () => {
  assert.equal(canDeploy([hq],[],3,'sm'), true);            // le Marine tactique coûte 3
  assert.equal(canDeploy([hq],[],2,'sm'), false);           // trop pauvre
  const occupant=[{id:1,r:11,c:5,hp:100}];
  assert.equal(canDeploy([hq],occupant,9,'sm'), false);     // forteresse occupée
  assert.equal(canDeploy([{...hq,own:'ork'}],[],9,'sm'), false); // forteresse perdue
});
