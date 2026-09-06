#!/usr/bin/env node
// The framework is data, published by the site; the skill is generated from it.
//
//   node framework.mjs --render     rewrite the generated sections of skills/profile/SKILL.md from framework/pac.json
//   node framework.mjs --check      fetch the live pac.json and report drift against the committed copy (exit 1 on drift)
//   node framework.mjs --update     fetch the live pac.json, write it over the committed copy, then render
//
// Nothing in the generated sections is edited by hand: the markers say so, and --check
// in CI says when the site moved on without the skill.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const LOCAL = join(root, 'framework', 'pac.json');
const SKILL = join(root, 'skills', 'profile', 'SKILL.md');
const LIVE = 'https://trustedagentic.ai/framework/pac.json';
const args = new Set(process.argv.slice(2));

const load = () => JSON.parse(readFileSync(LOCAL, 'utf8'));

function renderAxes(d) {
  const lines = ['| axis | id | levels | pillar | crosswalk |', '|---|---|---|---|---|'];
  for (const a of d.axes) {
    const levels = a.levels.length ? a.levels.map(l => `${l.id} ${l.name}`).join(', ') : a.measure;
    const cw = ['eu', 'iso', 'nist'].map(k => (a.crosswalk[k] || []).join(', ')).filter(Boolean).join('; ') || 'none';
    lines.push(`| ${a.name} | \`${a.id}\` | ${levels} | ${a.pillar} | ${cw} |`);
  }
  return lines.join('\n');
}
function renderQuestions(d) {
  const out = [];
  for (const p of d.pillars) {
    out.push(`**${p.name}** (${p.question} The ${p.answers === 'business' ? 'business owner' : p.answers === 'liability' ? 'person who carries the liability' : 'engineering side'} answers.)`);
    for (const id of p.questions) {
      const q = d.questions.find(x => x.id === id);
      const cw = ['eu', 'iso', 'nist'].map(k => (q.crosswalk[k] || []).join(', ')).filter(Boolean).join('; ');
      out.push(`- ${q.id}: ${q.text}${cw ? ` (${cw})` : ''}`);
    }
    out.push('');
  }
  return out.join('\n').trimEnd();
}
function render() {
  const d = load();
  let s = readFileSync(SKILL, 'utf8');
  const put = (name, body) => {
    const re = new RegExp(`(<!-- pac:${name} generated from framework/pac.json, do not edit -->)[\\s\\S]*?(<!-- /pac:${name} -->)`);
    if (!re.test(s)) throw new Error(`marker pac:${name} missing in SKILL.md`);
    s = s.replace(re, `$1\n${body}\n$2`);
  };
  put('axes', renderAxes(d));
  put('questions', renderQuestions(d));
  put('version', `Framework text: ${d.source}, version ${d.version}, language ${d.language}.`);
  writeFileSync(SKILL, s);
  console.log(`rendered ${d.questions.length} questions and ${d.axes.length} axes into SKILL.md (framework ${d.version})`);
}
async function fetchLive() {
  const res = await fetch(LIVE);
  if (!res.ok) throw new Error(`${LIVE}: ${res.status}`);
  return res.json();
}
function drift(a, b) {
  const out = [];
  const qa = new Map(a.questions.map(q => [q.id, q])), qb = new Map(b.questions.map(q => [q.id, q]));
  for (const [id, q] of qb) { if (!qa.has(id)) out.push(`new question ${id}`); else if (qa.get(id).text !== q.text) out.push(`question ${id} reworded`); }
  for (const id of qa.keys()) if (!qb.has(id)) out.push(`question ${id} removed`);
  const aa = new Map(a.axes.map(x => [x.id, x])), ab = new Map(b.axes.map(x => [x.id, x]));
  for (const [id, x] of ab) {
    if (!aa.has(id)) { out.push(`new axis ${id}`); continue; }
    const la = aa.get(id).levels.map(l => `${l.id} ${l.name}`).join(','), lb = x.levels.map(l => `${l.id} ${l.name}`).join(',');
    if (la !== lb) out.push(`axis ${id} levels changed`);
    if (JSON.stringify(aa.get(id).crosswalk) !== JSON.stringify(x.crosswalk)) out.push(`axis ${id} crosswalk changed`);
  }
  for (const [id, q] of qb) if (qa.has(id) && JSON.stringify(qa.get(id).crosswalk) !== JSON.stringify(q.crosswalk)) out.push(`question ${id} crosswalk changed`);
  if (a.version !== b.version) out.push(`version ${a.version} -> ${b.version}`);
  return out;
}

if (args.has('--render')) render();
else if (args.has('--check') || args.has('--update')) {
  const live = await fetchLive();
  const d = drift(load(), live);
  if (args.has('--update')) { writeFileSync(LOCAL, JSON.stringify(live, null, 2) + '\n'); render(); console.log(d.length ? d.join('\n') : 'no drift'); }
  else if (d.length) { console.log('drift against ' + LIVE + ':\n' + d.map(x => '  ' + x).join('\n')); process.exit(1); }
  else console.log('no drift against ' + LIVE);
} else { console.error('usage: framework.mjs --render | --check | --update'); process.exit(2); }
