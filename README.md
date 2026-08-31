# Above Beyond plugins

Claude Code skills that answer one question each, with evidence.

```
/plugin marketplace add abovebeyond-ai/plugins
```

## /agent-scan

**What's running on its own in your repo - and has it earned that?**
Finds everything that acts without a human typing - agents, LLM calls, MCP servers,
bots, scheduled jobs - and scores it on the [PAC framework](https://trustedagentic.ai):
autonomy earned or configured, blast radius, reliability with an error margin.

```
/plugin install agent-scan@abovebeyond
/agent-scan
```

## /hallucination-scan

**What happens when your model makes something up?**
Finds every path where model output reaches a human or a decision, and scores what
stands in between - nothing, review, structure, or a verification gate (the
[ProveML](https://github.com/ShaneDeconinck/proveml) bar: claims carry their facts,
judgments meet declared thresholds, unverified text does not ship).

```
/plugin install hallucination-scan@abovebeyond
/hallucination-scan
```

---

Every scan obeys one house rule: **prove, don't claim** - each level assigned comes
with `file:line` evidence, or is reported as unknown. MIT licensed, by
[Above Beyond](https://abovebeyond.ai).
