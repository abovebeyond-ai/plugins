---
name: judge
argument-hint: "[pac-claims.json] [judged.json | --by \"name, role\"]"
description: Fold the owner's verdicts back into the claims file, say what the profiler got right, and name the next rows to go deeper on. The memory of the trajectory; without it every run starts blank.
---

# /pac:judge

`/pac:profile` writes claims; people confirm or dispute them on the page or in
the file. This skill folds those verdicts back in, so the next profile starts
from what the owner already said instead of from nothing.

Judging is an interdisciplinary exercise, and the profiler is built for that:
the Potential questions are the business owner's, the Accountability questions
belong to whoever carries the liability, the Control questions to engineering.
One person rarely holds all three. Every verdict therefore carries who gave it
(`judged_by`: name and role), and a verdict without a judge is recorded but
flagged as unsigned.

## What it does

1. Find the claims file: the argument, else `pac-claims.json` in the current
   directory, else the scratchpad of the last profile. No file: say so and
   point at `/pac:profile`; there is nothing to judge.
2. Take the verdicts from one of four places, in this order of preference:
   - **the shared page's store**, when the review page was published with the
     `db` capability: read the `verdicts` and `answers` collections with the
     Artifact tool (`action: read_db`, `db_op: list`, `out_dir` into the
     scratchpad), gather the rows into one json array, and pass that file. This
     is the team's judgement, every row signed; nothing to paste;
   - a file given as the second argument;
   - stdin, the page's "copy judged claims as json", pasted;
   - the owner speaking them in the conversation ("the scout is off since July,
     dispute it"). Spoken verdicts go through the same merge, with the reason as
     `note` and the speaker as `--by`.
   Several people may judge one claim. Every signed verdict is kept; the claim's
   own verdict is the consensus, and one dispute disputes it until withdrawn. A
   split claim (confirmed by one discipline, disputed by another) is listed as
   such: that is the workshop's agenda, not a bug.
3. Run the merge, which is deterministic and lives next to this file:

   ```
   node <base directory>/scripts/judge.mjs <pac-claims.json> [judged.json] [--by "name, role"]
   pbpaste | node <base directory>/scripts/judge.mjs <pac-claims.json> --by "name, role"
   node <base directory>/scripts/judge.mjs <pac-claims.json> --show
   ```

   The newest verdict wins and every flip is listed, so a changed mind is
   visible rather than silently overwritten. Nothing is deleted.
4. Print the script's output as is: the table of changes, the standing, the
   profiler's own reliability (the share of judged claims that survived), the
   disputed rows with their reasons, and the next three rows to go deeper on,
   furthest reach first, each as a ready `/pac:profile --entry ... --level N`.
5. If a review page exists for this file, rebuild it from the merged file so
   the verdicts show for everyone who opens it, and print its link.

## Tone

Same as the profiler: about the system, never about the person. A disputed
claim is information about the profiler, not a fault of the owner; say what
it teaches ("the map counted a switched-off worker; a later run checks the
schedule before the code"). The reliability number is the profiler's, and it
is reported even when it is low.

abovebeyond, trustedagentic.ai/framework
