#!/usr/bin/env node
// Merge judged verdicts into a claims file and say what they mean.
//
//   node judge.mjs <pac-claims.json> [judged.json]      judged from a file
//   pbpaste | node judge.mjs <pac-claims.json>           judged from stdin (the page's "copy judged claims as json")
//   node judge.mjs <pac-claims.json> --show              no merge, just the standing
//
// The judged input is either a full claims file or the page's export. Matching is
// by id, then by entry and axis, then by statement. The newest verdict wins and the
// change is listed, so a flipped verdict is visible rather than silently overwritten.
// Nothing is deleted: a claim that is gone from the judged input keeps what it had.

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const claimsPath = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--by')[0];
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--by');
const judgedPath = positional[1];
const show = args.includes('--show');
const byIdx = args.indexOf('--by');
const by = byIdx >= 0 ? args[byIdx + 1] : null;
if (!claimsPath) { console.error('usage: judge.mjs <pac-claims.json> [judged.json|stdin] [--show]'); process.exit(2); }

const file = JSON.parse(readFileSync(claimsPath, 'utf8'));
const claims = file.claims || [];
const REACH = ['outside', 'machine', 'inside', 'proposes', 'reads'];
const today = new Date().toISOString().slice(0, 10);

function readJudged() {
  if (show) return null;
  const raw = judgedPath ? readFileSync(judgedPath, 'utf8') : readFileSync(0, 'utf8');
  if (!raw.trim()) return null;
  const j = JSON.parse(raw);
  if (j.judged_by && !by) judgedBy = j.judged_by;
  const list = [];
  for (const c of j.claims || []) list.push({ id: c.id, entry: c.entry, axis: c.axis, statement: c.statement, verdict: c.verdict || null, note: c.note || null });
  for (const [i, q] of (j.questions || []).entries()) list.push({ id: `question/${i + 1}`, axis: 'question', statement: q.question, answer: q.answer || null });
  return list;
}

function find(j) {
  const byId = claims.find(c => c.id === j.id || (j.id && c.id === `${j.id}/${j.axis || 'map'}`) || (j.id && c.entry === j.id));
  if (byId) return byId;
  const byEntry = claims.find(c => j.entry && c.entry === j.entry);
  if (byEntry) return byEntry;
  return claims.find(c => j.statement && c.statement === j.statement) || null;
}

let judgedBy = by;
const changes = [];
const judged = readJudged();
if (judged) {
  for (const j of judged) {
    const c = find(j);
    if (!c) { changes.push({ kind: 'unmatched', id: j.id || j.entry || j.statement }); continue; }
    if (j.axis === 'question' || c.axis === 'question') {
      if (j.answer && j.answer !== c.answer) { c.answer = j.answer; c.status = 'answered'; c.judged_at = today; changes.push({ kind: 'answered', id: c.id }); }
      continue;
    }
    if (!j.verdict) continue;
    if (c.verdict && c.verdict !== j.verdict) changes.push({ kind: 'flipped', id: c.id, from: c.verdict, to: j.verdict });
    else if (!c.verdict) changes.push({ kind: 'judged', id: c.id, to: j.verdict });
    else continue;
    c.verdict = j.verdict; c.status = 'judged'; c.judged_at = today; c.judged_by = judgedBy || null; if (j.note) c.note = j.note;
  }
  file.judged_at = today;
  writeFileSync(claimsPath, JSON.stringify(file, null, 2) + '\n');
}

// standing
const scored = claims.filter(c => c.axis === 'map');
const boundary = claims.filter(c => c.axis === 'boundary');
const questions = claims.filter(c => c.axis === 'question');
const judgedClaims = [...scored, ...boundary].filter(c => c.verdict);
const confirmed = judgedClaims.filter(c => c.verdict === 'confirmed').length;
const disputed = judgedClaims.filter(c => c.verdict === 'disputed');
const answered = questions.filter(c => c.answer).length;
const reliability = judgedClaims.length ? confirmed / judgedClaims.length : null;

const next = scored
  .filter(c => c.verdict !== 'disputed')
  .sort((a, b) => REACH.indexOf(a.reach) - REACH.indexOf(b.reach) || (a.level ?? 0) - (b.level ?? 0))
  .slice(0, 3);

const out = [];
out.push(`pac judge, ${file.system || '?'} at ${file.commit || '?'}, ${today}`);
out.push('');
if (changes.length) {
  out.push('| change | claim | from | to |');
  out.push('|---|---|---|---|');
  for (const ch of changes) out.push(`| ${ch.kind} | ${ch.id} | ${ch.from || ''} | ${ch.to || ''} |`);
  out.push('');
}
const unsigned = judgedClaims.filter(c => !c.judged_by).length;
out.push(`judged: ${judgedClaims.length} of ${scored.length + boundary.length} claims, ${confirmed} confirmed, ${disputed.length} disputed; ${answered} of ${questions.length} questions answered`);
if (unsigned) out.push(`unsigned: ${unsigned} verdicts carry no judge; pass --by "name, role"`);
if (reliability !== null) out.push(`profiler: ${confirmed} of ${judgedClaims.length} judged claims survived (${Math.round(reliability * 100)}%)`);
for (const d of disputed) out.push(`disputed: ${d.entry}${d.note ? ` (${d.note})` : ''}`);
out.push('');
out.push('next, furthest reach first:');
for (const c of next) out.push(`  /pac:profile --entry "${c.entry}" --level ${(c.level ?? 0) + 1}`);
out.push('');
const stand = scored.filter(c => c.verdict !== 'disputed').length;
out.push(`pac: not yet - ${stand} things decide alone after judgement; ${confirmed} of ${judgedClaims.length} judged claims stand`);
console.log(out.join('\n'));
