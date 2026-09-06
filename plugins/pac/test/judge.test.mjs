// The merge is the deterministic core of /pac:judge; these pin what it promises.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const judge = join(here, '..', 'scripts', 'judge.mjs');
const claims = () => ({ system: 'x', commit: 'abc', claims: [
  { id: 'deploy/map', entry: 'deploy', axis: 'map', level: 0, reach: 'outside', statement: 'deploys', evidence: [], status: 'claimed', verdict: null },
  { id: 'hook/boundary', entry: 'hook', axis: 'boundary', level: 0, statement: 'posts', evidence: [], status: 'claimed', verdict: null },
  { id: 'question/1', axis: 'question', pillar: 'P', statement: 'worth?', evidence: [], status: 'claimed', verdict: null },
] });
function run(rows, file = claims()) {
  const dir = mkdtempSync(join(tmpdir(), 'pac-'));
  const c = join(dir, 'pac-claims.json'), r = join(dir, 'rows.json');
  writeFileSync(c, JSON.stringify(file)); writeFileSync(r, JSON.stringify(rows));
  const out = execFileSync('node', [judge, c, r], { encoding: 'utf8' });
  return { out, file: JSON.parse(readFileSync(c, 'utf8')) };
}

test('a signed verdict lands on the claim and the profiler score follows', () => {
  const { out, file } = run([{ claim: 'deploy/map', verdict: 'confirmed', by: 'Ann, engineering' }]);
  const c = file.claims.find(x => x.id === 'deploy/map');
  assert.equal(c.verdict, 'confirmed'); assert.equal(c.verdicts[0].by, 'Ann, engineering');
  assert.match(out, /profiler: 1 of 1 judged claims survived/);
});
test('one dispute disputes a claim two others confirmed, and the split is named', () => {
  const { out, file } = run([
    { claim: 'deploy/map', verdict: 'confirmed', by: 'Ann, engineering' },
    { claim: 'deploy/map', verdict: 'confirmed', by: 'Cas, business' },
    { claim: 'deploy/map', verdict: 'disputed', by: 'Bo, legal', note: 'no sign-off' }]);
  assert.equal(file.claims[0].verdict, 'disputed');
  assert.match(out, /split: deploy/); assert.match(out, /disputed: deploy by Bo, legal \(no sign-off\)/);
});
test('a changed mind is listed as a flip, never silently overwritten', () => {
  const first = run([{ claim: 'deploy/map', verdict: 'confirmed', by: 'Ann, engineering' }]).file;
  const { out } = run([{ claim: 'deploy/map', verdict: 'disputed', by: 'Ann, engineering' }], first);
  assert.match(out, /flipped \| deploy\/map \| confirmed, Ann, engineering \| disputed/);
});
test('an unsigned verdict is kept but flagged', () => {
  const { out } = run([{ claim: 'hook/boundary', verdict: 'confirmed' }]);
  assert.match(out, /unsigned: 1 verdicts carry no judge/);
});
test('an answer lands on its question under the name that gave it', () => {
  const { file } = run([{ question: 'question/1', answer: 'the product', by: 'Cas, business' }]);
  assert.equal(file.claims[2].answers[0].by, 'Cas, business');
});
test('a row that matches nothing is reported, not invented', () => {
  const { out, file } = run([{ claim: 'ghost/map', verdict: 'confirmed', by: 'x' }]);
  assert.match(out, /unmatched \| ghost\/map/); assert.equal(file.claims.length, 3);
});
