---
name: pac
argument-hint: "[path] [--level 0-4] [--entry <name>]"
description: The PAC profiler. Map everything in a repository that acts without a person, profile each thing on the PAC framework's six axes with a line of evidence per score, hand the owner the questions only they can answer, and end in one line. Formerly /agent-scan; the old name still describes it.
---

```
  ┓       ┓          ┓
┏┓┣┓┏┓┓┏┏┓┣┓┏┓┓┏┏┓┏┓┏┫
┗┻┗┛┗┛┗┛┗ ┗┛┗ ┗┫┗┛┛┗┗┻
               ┛
pac profiler
```

# /pac

Profile the current repository (or the system the user points at) against the
**PAC framework** from trustedagentic.ai: three pillars - **Potential,
Accountability, Control** - and the six **Agent Profiler** axes. This skill is
the framework as a procedure a machine can run. If online, refresh the
reference with WebFetch on https://trustedagentic.ai/framework and note any
drift from the copy below; if the fetch tool is not loaded or the site is
unreachable, say which text you scored against and go on.

## What this is, and is not

This assumes the owner runs their agents consciously: they know what acts alone,
they have decided what each may do, and they revisit that. The profiler makes
that cheaper. It does not do it for them, and it must never read as if it had.

It reads code, so it can only ever be best effort. Its output is a set of
**claims** for the owner to confirm or dispute, a set of **questions** only the
owner can answer, and one line that says where things stand, and a page where they judge it. The owner's
judgement is the deliverable; the profiler is the blank page filled in.

If a repository shows no sign of a conscious process - nothing registered, no
declared levels, nobody who owns the question - the profiler says so and stops
at the map. A "not yet" to a team that has not started is not a failure of the
team; it is the framework's first sentence to them.

## The one house rule

**Prove, don't claim.** Every level you assign and every question you answer gets
evidence: a `file:line`, a config value, a command output. If you cannot point at
evidence, the answer is "unknown", never a guessed level. An axis scored without
evidence is worth less than an axis honestly left open - say what you could not see.

## Tone

Every sentence is about the system, none about the person. Present tense. No
"should", no "you failed to", no second-person blame anywhere. Plain words first,
the framework's label after, in brackets, never instead: "Deploys to production on
every merge; the only check is a pulse. (acts alone, reaches customers)". A number
appears only with its source. "Unknown" is written out, never left blank. The
verdict line describes a stage, the stage every team is at once, not a grade.
Nothing in the output sells anything or asks for a meeting; the signature at the
end says who made it and where the framework lives, and that is all.

## Levels - how hard you looked

Like a static analyser's levels, each adds a kind of evidence, and a row may only
claim what its level allows. The report states the level reached per row.

| level | establishes | needs |
|---|---|---|
| 0 | the map: everything that acts alone, one file reference each | the code |
| 1 | the profile: the six axes as configured, evidence per cell | the code |
| 2 | the gates: does each approval path, credential scope and limit exist in fact, or on paper | the code, plus the environment contract |
| 3 | the record: measured outcomes, who judges, an error margin | the running system (a probe, a database) |
| 4 | earned: levels computed from a ledger of judged claims | the ledger |

Default is level 1 for the whole repository. `--level N` sets the depth;
`--entry <name>` goes deeper on one row only. The loop the owner runs is: level
0 on everything, judge the rows, then deeper on one row at a time, starting where
blast radius is highest and the level lowest. The table is the overview at every
zoom - the same six columns for the whole system and for one script.

## Step 0 - before reading code

- **Scope.** A monorepo is several systems; a pipeline, its dashboard and its
  site are profiled separately even when they share a database. Say which one.
- **Business value.** Not in the code. Ask the owner in one line, or record "not
  declared". Do not discover its absence at the end.
- **Previous run.** If a claims file from an earlier run exists (see the claims
  file below), load it: the report opens with what changed since, and judged
  claims keep their verdicts.

## Step 1 - the map

Find everything that acts or decides without a human typing: scheduled jobs,
agents, playbooks, LLM calls, MCP servers and their tool grants, webhook handlers,
auto-deploys, auto-merges, cron entries, CI actions that push or publish, and the
credentials each of these holds. For each: what it touches, who triggers it, what
happens when it is wrong. This list is the unit of the profile - score each entry,
not the repository.

Start from the code, not the README; the README says what was intended.

```
spawn( | execSync( | execFile(              a process that runs something
cron | crontab | schedule | setInterval     a clock
callLLM | callModel | anthropic | openai | ollama | claude -p   a model call
fetch( | axios | got(                       an outbound call - list the hosts
sendMail | resend | smtp | nodemailer       mail leaves the system
webhook | WEBHOOK_URL                       data leaves to a third party
git push | git reset --hard | systemctl | sudo   deploy and restart
process.env.                                every credential the code reads
```

**Credentials are part of the map.** List the `process.env` keys the code reads
against what `.env.example` (or the equivalent) documents; the gap is the
undocumented contract. For each entry ask what it can read that it does not need.

**One loop is several entries.** A worker that runs classify, enrich, merge and
deploy from one scheduler is not one row. Split it by what each action touches,
because that is what blast radius scores.

## Step 2 - the six axes (level 1 and up)

1. **Autonomy** - A1 suggestion (text only, human does the work), A2 approve
   (prepares, human approves before it lands), A3 oversight (acts, human watches
   and can revert), A4 delegated (acts within bounds, oversight after the fact),
   A5 autonomous (no human in the loop). Also: is the level *earned* (computed
   from a track record) or *configured* (someone set a flag)? Earned beats
   configured; a flag nobody revokes is policy, not architecture.
   **Check that an A2 gate still exists** (level 2). A proposal written "for
   review in X" is A2 only while X is there and someone reads it. An approval
   path that points at a removed system, an unread queue or an inbox nobody owns
   is a label; score it as what it is and make it a claim.
2. **Blast radius** - B1 contained (stays inside the system), B2 recoverable
   (outside, one action to undo), B3 exposed (visible to third parties before you
   notice), B4 regulated (touches rules, mail, DNS, personal data), B5
   irreversible. Score in context: the same tool behind a PR is B2, self-merging
   to production it is B4. For B5 ask why it is not redesigned to be reversible.
   Money spent is B2 at best: it cannot be undone, only capped.
3. **Reliability** (level 3) - is there a measured success rate, and does anyone
   know its error margin? A lower confidence bound over *judged* outcomes (e.g.
   Wilson 95%) counts; a headline "10/10" does not. Who judges - the agent itself
   (invalid), a model (self-judged, invalid unless the judge is measured against
   people) or an independent measurement? Name the table or file where the
   judgements live; if there is none, the cell is "none measured".
4. **Governance thresholds** - does the reliability bar rise with blast radius?
   Look for the coupling in code. One flat bar for a lockfile PR and a DNS change
   is a claim. A budget cap coupled to queue depth is a cost threshold, not a
   governance one.
5. **Infrastructure** - I1 open ... I5 contained. Own OS user or shared?
   Credential scopes, production reachable directly or only via PR, limits
   enforced by architecture or by instructions the agent could ignore? A server
   that spawns its workers hands them its whole environment; say so.
6. **Business value** - V1 incremental ... V4 transformative. From step 0; "not
   declared" is an answer.

## Step 3 - the 19 questions, as the owner's questions

Answer what the code can answer, one line each with evidence. The rest are the
owner's, and they go to the top of the report as questions about *their*
system, in their words - "Does anyone read the sources the scout proposes?" -
not as the framework's abstract wording. Potential (7): undelegated decisions
and their cost; will better models make this setup more valuable or obsolete;
value lost to over-constraining; deciding vs automating predefined steps; does
the right context reach agents in time; built on standards or an island; error
margin known or headline number. Accountability (5): every agent known and
registered; liability chain clear; can an unregistered agent even run;
explainable to a regulator; consequential decisions traceable to who authorised.
Control (7): contained by architecture or only policy; delegated authority can
only decrease; what happens when human oversight breaks down; agent quality vs
data privacy; allowed-list or block-list; crossing trust boundaries; what happens
on an unanticipated use case.

## Step 4 - the report: one table in the terminal, one page for the room

The terminal is for the person who ran the profiler. They get a table, not
prose: one row per entry, the same columns at every level, so two runs weeks
apart compare line by line. Fill this skeleton in this order; do not invent a
shape.

```
<the mark>
pac profiler, level N, <system> at <sha>, <date>

<1. one sentence in the owner's words: how many things act alone, how many reach outside>

| what acts alone | reach | label | evidence | level |
|---|---|---|---|---|
<2. one row per entry, ordered by reach: the furthest first. Reach is one of:
    outside (customers, third parties, mail), machine (spends, changes the host),
    inside (writes the system's own data), proposes (a person decides), reads.
    Label is the plain-words tag, evidence one file:line, level the depth reached
    for that row. At level 1 and up, add the six axes as columns after reach.>

questions
<3. numbered, one line each, prefixed with the pillar letter (P, A, C): the
    decisions only the owner can make, in their words>

stands well
<4. three or four lines: the controls that are real, each with evidence. A
    profile that lists only faults teaches nothing about what to keep.>

pac: <trusted|not yet> - <the single fact that decides it>
review: <link to the page, when one was built>
abovebeyond, trustedagentic.ai/framework, pac profiler <version>
```

"Where each stands" is a column in the table (level), not a section; at
level 0 it reads `unknown` for every row except the ones that carry a ledger
by construction. Nothing else goes to the terminal: no paragraphs between the
blocks, no repeat of the table as prose, no list of claims (the table is the
list of claims, and the claims file carries them).

The verdict line's shape is fixed: `pac: not yet - A5 configured, A0 earned`,
`pac: trusted - B2 at 0.91 lower bound, bar is 0.85`. If a previous run was
loaded, moment 1 opens with what changed since. Say which framework text you
scored against, in one line under the signature.

**The page is where the judging happens.** Build it from the claims file as an
artifact, and put its link on the `review:` line. It follows the shape of
trustedagentic.ai/framework, so a reader who knows the site knows the page:
a short thesis; the map as cards grouped by reach (name, chips, one sentence,
evidence), each with confirm and dispute as text that behaves; the owner's
questions in three columns by pillar, P blue, A amber, C green, each with a
place to answer; what stands well; and a night band at the end with the verdict
line, a meter of what is judged, and a copy of the judged claims as json.
Answers and verdicts stay in the reader's browser; nothing is sent anywhere.
Paper ground, Lato and Spline Sans Mono, 6px corners, no middle-dot chains, no
em dashes, no spaced capitals.

## The claims file

Alongside the report, write `pac-claims.json` in the scanned directory (or the
scratchpad if the directory must stay clean): one object per claim.

```json
{ "id": "auto-deploy/autonomy", "entry": "auto-deploy", "axis": "autonomy",
  "level": 2, "statement": "Deploys on every merge with no approval and no test gate.",
  "evidence": [{"file": "bin/auto-deploy", "line": 161}],
  "status": "claimed", "verdict": null, "judged_at": null, "note": null }
```

`status` is `claimed` until the owner sets `verdict` to `confirmed` or
`disputed`; questions for the owner are claims with `axis: "question"`. A later
run loads this file, keeps every verdict, marks claims whose evidence moved as
`stale`, and adds new ones. The profiler's own reliability is the share of its
claims that survive judgement; report it when a judged file is loaded.

If the owner wants to judge on a page instead of in the file, build the review
view as an artifact from the claims file: one row per claim, confirm or dispute,
the verdict line recomputed from what survived.

Do not fix anything during a profile; the deliverable is the map, the questions
and the claims. Offer fixes afterwards, highest blast radius first.
