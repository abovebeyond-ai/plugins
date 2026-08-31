# /agent-scan

**What's running on its own in your repo - and has it earned that?**

`/agent-scan` finds everything that acts without a human typing - agents, LLM
calls, MCP servers, bots, scheduled jobs - and scores it against the
[PAC framework](https://trustedagentic.ai) — Potential, Accountability, Control —
and profiles every agent, playbook and automation on the six Agent Profiler axes.

One rule sets it apart from every governance questionnaire: **prove, don't claim.**
Every level comes with evidence — a `file:line`, a config value, a command output —
or it is reported as *unknown*, never guessed.

## Run it

In [Claude Code](https://claude.com/claude-code):

```
/plugin marketplace add abovebeyond-ai/agent-scan
/plugin install agent-scan@abovebeyond
/agent-scan
```

## What you get

- An **inventory** of everything in the repo that acts or decides without a human
  typing: agents, playbooks, LLM calls, MCP servers and their tool grants,
  webhooks, auto-deploys, scheduled jobs - and the credentials each one holds.
- A **profile per entry** on the six axes:
  - **Autonomy** A1 suggestion → A5 autonomous — and whether the level is
    *earned* (computed from a track record) or merely *configured*
  - **Blast radius** B1 contained → B5 irreversible, scored in context
  - **Reliability** — a lower confidence bound over judged outcomes, not a
    headline number
  - **Governance thresholds** — does the reliability bar rise with blast radius?
  - **Infrastructure** I1 open → I5 contained — enforced by architecture, or
    only by policy?
  - **Business value** V1 → V4
- The framework's **19 questions** answered against your own code, one line each.
- Findings ranked by risk, each with the smallest fix that moves the level.
- One verdict line to close:

```
agent-scan: not yet — A3 claimed, A1 earned
```

## Who this is for

Teams shipping agents who want the autonomy question answered with evidence
instead of a policy document. Technical enough to challenge your engineers,
short enough to brief your board.

---

By [Above Beyond](https://abovebeyond.ai) — the reference implementation of the
[PAC framework](https://trustedagentic.ai).
