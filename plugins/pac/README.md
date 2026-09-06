```
  ┓       ┓          ┓
┏┓┣┓┏┓┓┏┏┓┣┓┏┓┓┏┏┓┏┓┏┫
┗┻┗┛┗┛┗┛┗ ┗┛┗ ┗┫┗┛┛┗┗┻
               ┛
pac profiler
```

# /pac:profile

**What in this repository acts without a person, and has it earned that?**

`/pac:profile` maps everything that acts without a human typing
- agents, LLM calls, MCP servers, bots, scheduled jobs, deploys - and profiles
each one on the [PAC framework](https://trustedagentic.ai): Potential,
Accountability, Control, and the six Agent Profiler axes.

It assumes you run your agents consciously. It makes that cheaper; it does not
do it for you. Its output is a map in plain words, the questions only you can
answer, and a set of claims with a line of evidence each, for you to confirm or
dispute. Your judgement is the deliverable.

**Prove, don't claim.** Every level comes with a `file:line`, a config value or
a command output, or it is reported as *unknown*.

## Run it

In [Claude Code](https://claude.com/claude-code):

```
/plugin marketplace add abovebeyond-ai/plugins
/plugin install pac@abovebeyond
/pac:profile              # level 1 on the whole repository
/pac:profile --level 0    # the map only, minutes
/pac:profile --entry auto-deploy --level 3   # one row, as deep as the running system allows
```

## Levels

| level | establishes |
|---|---|
| 0 | the map: everything that acts alone, one file reference each |
| 1 | the profile: the six axes as configured, evidence per cell |
| 2 | the gates: does each approval path, credential scope and limit exist in fact |
| 3 | the record: measured outcomes, who judges, an error margin |
| 4 | earned: levels computed from a ledger of judged claims |

Run level 0 on everything, judge the rows, go deeper on one row at a time,
highest blast radius first. The table is the same at every depth.

## What you get

In the terminal, one table: a row per thing that acts alone, ordered by how
far a mistake travels, with a plain-words label, one line of evidence and the
level reached. Under it your questions, one line each by pillar, and what
stands well. Then one line: `pac: not yet - A5 configured, A0 earned`.

The judging happens on a page, built from `pac-claims.json`: the map as cards,
confirm or dispute per claim, your questions with room to answer, and the
verdict line following what survives. Answers and verdicts stay in your
browser. A later run keeps your verdicts and shows what changed.
