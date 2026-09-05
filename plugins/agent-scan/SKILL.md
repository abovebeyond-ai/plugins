---
name: agent-scan
argument-hint: "[path]"
description: Scan everything in this repo that acts on its own - agents, LLM calls, MCP servers, bots, scheduled jobs - and score it on the PAC framework. Audit this repo's agentic system against the PAC framework (trustedagentic.ai) - profile every agent/playbook on the six Agent Profiler axes and answer the 19 governance questions, with file:line evidence for every score.
---

# /agent-scan


Audit the current repository (or the system the user points at) against the **PAC
framework** from trustedagentic.ai: three pillars - **Potential, Accountability,
Control** - and the six **Agent Profiler** axes. This skill is the reference
implementation of that framework. If online, refresh the reference with WebFetch on
https://trustedagentic.ai/framework and note any drift from the copy below. If the
fetch tool is not loaded or the site is unreachable, say so in the report and score
against the copy below; never let a missing refresh stall the audit.

## The one house rule

**Prove, don't claim.** Every level you assign and every question you answer gets
evidence: a `file:line`, a config value, a command output. If you cannot point at
evidence, the answer is "unknown", never a guessed level. An axis scored without
evidence is worth less than an axis honestly left open - say what you could not see.

## Step 0 - two things to settle before reading code

- **Business value** is not in the code. Ask the user up front, in one line, what
  the system is worth to the organisation (V1 incremental ... V4 transformative), or
  record "not declared". Do not discover its absence at the end.
- **Scope.** A monorepo is several systems; a pipeline, its dashboard and its site
  audit separately even when they share a database. Say which one this run covers.

## Step 1 - inventory

Find everything that acts or decides without a human typing: scheduled jobs, agents,
playbooks, LLM calls, MCP servers and their tool grants, webhook handlers,
auto-deploys, auto-merges, cron entries, CI actions that push or publish, and the
credentials each of these holds. For each, note: what it touches, who triggers it,
what happens when it is wrong. This list is the unit of the profile - score each
entry, not the repo as a whole.

Start from the code, not from the README; the README says what was intended. These
patterns find most of it:

```
spawn( | execSync( | execFile(         a process that runs something
cron | crontab | schedule | setInterval  a clock
callLLM | callModel | anthropic | openai | ollama | claude -p   a model call
fetch( | axios | got(                   an outbound call - list the hosts
sendMail | resend | smtp | nodemailer   mail leaves the system
webhook | WEBHOOK_URL                   data leaves to a third party
git push | git reset --hard | systemctl | sudo   deploy and restart
process.env.                            every credential the code reads
```

**Credentials are part of the inventory.** List the `process.env` keys the code
reads and compare them with what `.env.example` (or the equivalent) documents; the
gap is the undocumented contract. For each entry ask what it can read that it does
not need.

**One loop is several entries.** A worker that runs classify, enrich, merge and
deploy from one scheduler is not one line in the table. Split it by what each
action touches, because that is what blast radius scores; a loop scored once at the
radius of its worst action hides the four actions that are fine.

## Step 2 - profile each entry on the six axes

1. **Autonomy** - A1 suggestion (text only, human does the work) · A2 approve
   (prepares, human approves before it lands) · A3 oversight (acts, human watches
   and can revert) · A4 delegated (acts within bounds, oversight after the fact) ·
   A5 autonomous (no human in the loop). Also answer: is the level *earned*
   (computed from a track record) or *configured* (someone set a flag)? Earned
   beats configured; a flag nobody revokes is policy, not architecture.
   **Check that an A2 gate still exists.** A proposal written "for review in X" is
   A2 only while X is there and someone reads it. An approval path that points at a
   removed system, an unread queue or an inbox nobody owns is a label, not a gate;
   score it as what it is and name it as a finding.
2. **Blast radius** - B1 contained (stays inside the system) · B2 recoverable
   (outside, one action to undo) · B3 exposed (visible to third parties before you
   notice) · B4 regulated (touches rules, mail, DNS, personal data) · B5
   irreversible (cannot be undone). Score in context: the same tool behind a PR is
   B2, self-merging to production it is B4. For B5 ask: why is this not redesigned
   to be reversible? Money spent is B2 at best: it cannot be undone, only capped.
3. **Reliability** - is there a measured success rate, and does anyone know its
   error margin? A lower confidence bound over *judged* outcomes (e.g. Wilson 95%)
   counts; a headline "10/10" does not. Who judges - the agent itself (invalid), a
   model (self-judged, also invalid unless the judge is measured against humans) or
   an independent measurement? Name the table or file where the judgements live;
   if there is none, the column is "none measured", not blank.
4. **Governance thresholds** - does the reliability bar rise with blast radius?
   Look for the coupling in code. One flat bar for a lockfile PR and a DNS change
   is a finding. A budget cap coupled to queue depth is a cost threshold, not a
   governance one; do not let it pass for one.
5. **Infrastructure** - I1 open ... I5 contained. Evidence: own OS user or shared?
   Credential scopes (read-only deploy keys, write-only tokens, can the agent read
   more than it needs?), can it reach production directly or only via PR, are
   limits enforced by architecture or by instructions the agent could ignore? A
   server that spawns its workers hands them its whole environment; say so.
6. **Business value** - V1 incremental ... V4 transformative. From Step 0; "not
   declared" is an answer. Absence is a finding only if the org claims PAC coverage.

## Step 3 - the 19 questions

Answer the framework's questions per pillar, each in one or two lines with evidence
or "unknown". Potential (7): undelegated decisions and their cost; will better
models make this setup more valuable or obsolete; value lost to over-constraining;
deciding vs automating predefined steps; does the right context reach agents in
time; built on standards or an island; error margin known or headline number.
Accountability (5): every agent known/registered; liability chain clear; can an
unregistered agent even run; explainable to a regulator (what did it do and why);
consequential decisions traceable to who authorised. Control (7): contained by
architecture or only policy; delegated authority can only decrease; what happens
when human oversight breaks down; agent quality vs data privacy; allowed-list or
block-list; crossing trust boundaries; what happens on an unanticipated use case.

## Step 4 - report

Fill this skeleton; do not invent a shape. Two runs of the scan on the same repo,
weeks apart, must be comparable line by line.

```
## Profile
| entry | autonomy | blast radius | reliability | governance | infrastructure |
|---|---|---|---|---|---|
| <what it is> (`file:line`) | A? <earned|configured> (`file:line`) | B? <why> | <measure + judge, or "none measured"> | <coupling or "none"> | I? (`file:line`) |
Business value: <V? or "not declared">

## Findings, worst first
1. **<X> is at A?/B? with no <gate|bound|owner|...>.** <evidence, one sentence>
   Smallest fix: <the one change that moves the level>.

## What stands well
<the controls that are real, with evidence - an audit that lists only faults
teaches nothing about what to keep>

## The 19 questions
<one line each, grouped by pillar>

## Not scored
<axis and entry, and why>

agent-scan: <trusted|not yet> - <the single fact that decides it>
```

The verdict line's shape is fixed: `agent-scan: not yet - A3 claimed, A1 earned`,
`agent-scan: trusted - B2 at 0.91 lower bound, bar is 0.85`. That line is the
takeaway; everything above it is the evidence. Say which framework text you scored
against (fetched today, or the copy in this skill). If the user asks for a
shareable report, build it as an artifact.

Do not fix anything during the audit; the deliverable is the profile. Offer fixes
as a follow-up, worst finding first.
