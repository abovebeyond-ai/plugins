---
name: hallucination-scan
argument-hint: "[path]"
description: Scan this repo for every path where raw model output reaches a human or a decision, and score what stands in between - nothing, human review, structure, or a verification gate. Scored on the ProveML method - claims carry their facts, judgments meet declared thresholds, and unverified text does not ship.
---

# /hallucination-scan

Find every place in this repository where the output of a language model reaches a
human or feeds a decision, and score what stands between the model and the landing.
A hallucination is not a model bug you can fix; it is an *exposure* you can measure:
the question is never "does the model make things up" but "what happens when it
does". The method this scan scores against is **ProveML**
(https://github.com/ShaneDeconinck/proveml): a claim carries the facts it names, a
verifier checks them against a measured fact store, judgments are checked against
declared thresholds, a number that is not a declared fact is a finding, and text
that fails the gate falls back to deterministic templates instead of shipping.

## The one house rule

**Prove, don't claim.** Every path you report and every level you assign gets
evidence - a `file:line`, a config value, a prompt. If you cannot point at it, say
"unknown", never guess. This scan about verification must itself be verifiable.

## Step 1 - inventory the speaking paths

Find every call into a language model (API clients, SDK calls, `claude -p`, agent
frameworks, MCP sampling) and trace where its output lands: a UI, an email, a
report, a database column later rendered, a commit message, a customer document, a
decision (a threshold, a route, a merge). One row per path: the call site, the
landing, the audience (internal / customer / machine).

## Step 2 - classify the gate on each path

- **G0 raw** - model text lands unchecked. Worst when the audience is a customer
  or the text carries numbers or judgments.
- **G1 reviewed** - a human approves before it lands. Note where review is a
  formality (bulk approval, no diff shown).
- **G2 constrained** - structure limits the damage: forced schemas, templates
  with model-filled slots, enums, retrieval-grounded quotes. The model cannot
  invent a field, but can still be wrong inside one.
- **G3 gated** - claims are machine-verified against measured facts before
  publication: every named fact exists in a store, every judgment holds against a
  declared threshold, every number in the text is a declared fact (coverage), and
  a failed gate means the text does not ship - a template or silence takes its
  place. This is the ProveML bar.

For each path also note the **failure mode**: what does the reader see when the
model is wrong or the gate fails - a lie, an error, an omission, or a plainer
sentence? A fallback that reads as a style change instead of an outage is the mark
of a healthy G3.

## Step 3 - report

A table: path x (call site, landing, audience, G-level, failure mode), evidence in
every cell. Then findings ranked by exposure - raw numbers and judgments to
customers first - each with the smallest change that raises the level (a schema, a
declared threshold, a fact store, a fallback). Close with what you could not
trace and why, and end with one verdict line:
`hallucination-scan: <gated|exposed> - <the single fact that decides it>`
(e.g. `hallucination-scan: exposed - 3 paths ship raw model text to customers` or
`hallucination-scan: gated - every claim passes a verifier, coverage enforced`).

Do not fix anything during the scan; the deliverable is the map. Offer the gate
work as a follow-up.
