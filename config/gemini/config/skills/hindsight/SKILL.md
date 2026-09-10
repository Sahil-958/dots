---
name: hindsight
description: Session-end self-improvement pass for AI coding assistants. Reviews the session end-to-end (transcripts, tasks, tool outputs, dead ends, corrections), identifies root-cause process lessons, verifies proof vs. suggestion, and saves durable lessons into persistent memory/rules. Trigger on demand: "get some hindsight", "run a hindsight pass", "what should we improve", "review today and notate lessons", "what did you learn today", "save what's worth remembering".
---

# Hindsight

A session-end self-improvement pass. Read-only against the session's actual
work — it never redoes or re-opens a task — and write-only against memory and rules.
User-triggered only: a hindsight pass writes persistent memory, so timing
stays the user's call, never something run on a hunch.

## When this fires

On-demand only:
- "get some hindsight"
- "run a hindsight pass"
- "what should we improve"
- "review today and notate lessons"
- "what did you learn today"
- "save what's worth remembering from this session"

---

## Process

Review the full body of work completed in this session — every task,
decision, correction, tool failure, and course-change from start to finish, not just the
most recent exchange. Inspect the session transcripts (`transcript.jsonl` / `transcript_full.jsonl`)
and tool execution logs to ground findings in actual evidence. Then produce a structured
hindsight review covering the following:

### 1. Identify genuine process failures, not just outcomes
For each meaningful mistake, inefficiency, or round of back-and-forth correction,
name the root cause — not the surface symptom. If something took multiple
attempts to get right, ask what specifically caused each failed attempt,
and whether a single upstream fix (a question asked earlier, a check
performed differently, a different verification method, grounding in official docs first)
would have prevented the whole chain. Distinguish between mistakes that were
reasonable given the information available at the time, and mistakes
that came from skipping a step, assuming instead of asking, or verifying
the wrong thing.

### 2. Separate durable lessons from one-off noise
A lesson is worth keeping only if it would change how a future task gets handled — not
just this one. Discard anything that's purely specific to this session's
content and has no bearing on method or process going forward. For each
lesson that survives that filter, state it as a concrete, actionable
rule — not a vague sentiment like "be more careful." Say precisely what
should happen differently: what question should be asked, at what point,
or what check should be performed, and why the check that was actually
used wasn't sufficient.

### 3. Verify claims before writing them down
If a lesson references specific behavior, a tool's output, a file, or a technical constraint,
confirm it against what actually happened in this session (e.g. by inspecting
`transcript.jsonl` or relevant log files) rather than reconstructing it from memory. Don't
generalize from a single data point into a universal rule — note when something might be a
one-time fluke versus a confirmed, repeatable pattern (e.g., something that failed
identically on a second attempt is a stronger signal than something that failed once).

### 4. Before saving any lesson, ask explicitly: did this session prove it, or only suggest it?
- **Proved** means the same failure happened more than once, the root cause was actually
  confirmed against real evidence (a tool's output, a file's contents, a technical constraint checked),
  or a fix was verified to work.
  - *Action:* Persist as a firm, actionable rule.
- **Suggested** means it happened once, reads as plausible, but wasn't independently confirmed —
  a reasonable guess, not a demonstrated fact.
  - *Action:* Do not persist as settled fact. Either hold it out of memory and name it in the
    final report as a watch-item pending a second occurrence, or persist with uncertainty stated
    plainly (e.g., "seen once, not yet confirmed as a pattern").
- If it is genuinely unclear which bucket a lesson falls into and the user is available, ask
  them rather than deciding unilaterally.

### 5. Persist the lessons, don't just narrate them
Write surviving durable lessons into persistent memory:
- Check existing memory and rule files first to see if an entry already covers the topic.
- Update/extend existing entries in place rather than creating redundant duplicates.
- Ensure the memory index or rules file reflects all new or updated entries.

### 6. Keep the scope honest
A handful of well-reasoned, specific lessons is more useful than a long list of shallow ones.
If a session genuinely went well with nothing worth changing, say so plainly rather than
manufacturing findings to fill space. If real infrastructure or environment constraints were
discovered (a tool that doesn't work as documented, a permission issue, a network limitation),
record those as factual findings distinct from process lessons.

### 7. Report back concisely
Summarize for the user in a few short sections:
- **Lessons Learned:** Root causes and concrete rules that will govern future sessions.
- **Persistent Updates:** Specific files created or updated in memory/rules.
- **Watch-Items:** Plausible observations held back pending further confirmation.

---

## In this environment (Antigravity & Claude Code)

### 1. Transcript & Session History
- **Antigravity Transcripts:**
  - Compact: `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript.jsonl`
  - Full: `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript_full.jsonl`
  - Inspect exact tool inputs, outputs, exit codes, and thinking traces to ground every claim.

### 2. Persistent Memory & Rules Locations
- **Global Behavioral Rules (Universal):**
  - Path: `~/.gemini/config/GEMINI.md`
  - Injected into all Antigravity sessions as `RULE[user_global]`. Use for high-level principles, package management standards, workflow rules.
- **Project-Specific Knowledge & Context:**
  - Path: `<workspace>/GEMINI.md` or `<workspace>/.agents/rules/*.md`
  - Injected when working within that specific project workspace.
- **Modular Memory & Lessons Index:**
  - Index: `~/.gemini/config/memory/MEMORY.md`
  - Topic Entries: `~/.gemini/config/memory/<topic-slug>.md`
  - Use for domain-specific findings, environment quirks, and persistent feedback.
- **Claude Code Memory (if active):**
  - Path: `~/.claude/projects/<project-slug>/memory/` with `MEMORY.md` index.

---

## Definition of Done

- Every persisted lesson traces to a real, specific event from this session — not generic platitudes.
- Every persisted lesson was explicitly sorted into proved or merely-suggested.
- Nothing written duplicates an existing memory topic; existing files were updated in place.
- Memory index or rule files reflect all changes.
- Final report is concise and actionable.
- Scope boundary respected: no project code or business logic modified during hindsight pass.
