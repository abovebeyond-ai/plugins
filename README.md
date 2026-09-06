# Above Beyond plugins

Claude Code skills that answer one question each, with evidence.

```
/plugin marketplace add abovebeyond-ai/plugins
```

## /pac:profile

**What's running on its own in your repo - and has it earned that?**
Finds everything that acts without a human typing - agents, LLM calls, MCP servers,
bots, scheduled jobs - and scores it on the [PAC framework](https://trustedagentic.ai):
autonomy earned or configured, blast radius, reliability with an error margin.

```
/plugin install pac@abovebeyond
/pac:profile
```

## /hallucination-scan

**What happens when your model makes something up?**
Two modes on the [ProveML](https://github.com/ShaneDeconinck/proveml) method.
Hand it a document and it verifies every claim against your data: each fact traced
to a source, each number sourced (an unsourced number is a finding even when it
happens to be right), each judgment checked against a declared threshold. Hand it
nothing and it audits the repo: every path where model output reaches a human or a
decision, scored by the gate in between - nothing, review, structure, or
verification.

```
/plugin install hallucination-scan@abovebeyond
/hallucination-scan
```

---

Every scan obeys one house rule: **prove, don't claim** - each level assigned comes
with `file:line` evidence, or is reported as unknown. MIT licensed, by
[Above Beyond](https://abovebeyond.ai).
