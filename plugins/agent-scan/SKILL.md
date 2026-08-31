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
https://trustedagentic.ai/framework and note any drift from the copy below.

## The one house rule

**Prove, don't claim.** Every level you assign and every question you answer gets
evidence: a `file:line`, a config value, a command output. If you cannot point at
evidence, the answer is "unknown", never a guessed level. An axis scored without
evidence is worth less than an axis honestly left open - say what you could not see.

## Step 1 - inventory

Find everything that acts or decides without a human typing: scheduled jobs, agents,
playbooks, LLM calls, MCP servers and their tool grants, webhook handlers,
auto-deploys, auto-merges, cron entries, CI actions that push or publish, and the
credentials each of these holds. For each, note: what it touches, who triggers it,
what happens when it is wrong. This list is the unit of the profile - score each
entry, not the repo as a whole.

## Step 2 - profile each entry on the six axes

1. **Autonomy** - A1 suggestion (text only, human does the work) · A2 approve
   (prepares, human approves before it lands) · A3 oversight (acts, human watches
   and can revert) · A4 delegated (acts within bounds, oversight after the fact) ·
   A5 autonomous (no human in the loop). Also answer: is the level *earned*
   (computed from a track record) or *configured* (someone set a flag)? Earned
   beats configured; a flag nobody revokes is policy, not architecture.
2. **Blast radius** - B1 contained (stays inside the system) · B2 recoverable
   (outside, one action to undo) · B3 exposed (visible to third parties before you
   notice) · B4 regulated (touches rules, mail, DNS, personal data) · B5
   irreversible (cannot be undone). Score in context: the same tool behind a PR is
   B2, self-merging to production it is B4. For B5 ask: why is this not redesigned
   to be reversible?
3. **Reliability** - is there a measured success rate, and does anyone know its
   error margin? A lower confidence bound over *judged* outcomes (e.g. Wilson 95%)
   counts; a headline "10/10" does not. Who judges - the agent itself (invalid) or
   an independent measurement?
4. **Governance thresholds** - does the reliability bar rise with blast radius?
   Look for the coupling in code. One flat bar for a lockfile PR and a DNS change
   is a finding.
5. **Infrastructure** - I1 open ... I5 contained. Evidence: own OS user or shared?
   Credential scopes (read-only deploy keys, write-only tokens, can the agent read
   more than it needs?), can it reach production directly or only via PR, are
   limits enforced by architecture or by instructions the agent could ignore?
6. **Business value** - V1 incremental ... V4 transformative. Usually not in code:
   ask the user or mark "not declared". Absence is a finding only if the org
   claims PAC coverage.

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

Output a compact profile: a table (entry x six axes, with the evidence reference in
each cell), then findings ranked by risk - worst first, in the form "X is at
A?/B? with no ...", each with its evidence and the smallest fix that moves the
level. Close with the axes you could not score and why, and end the report with one
verdict line in this exact shape: `agent-scan: <trusted|not yet> - <the single fact that
decides it>` (e.g. `agent-scan: not yet - A3 claimed, A1 earned` or `agent-scan: trusted - B2 at
0.91 lower bound, bar is 0.85`). That line is the takeaway; everything above it is
the evidence. If the user asks for a
shareable report, build it as an artifact.

Do not fix anything during the audit; the deliverable is the profile. Offer fixes
as a follow-up.
