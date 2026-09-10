## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 5. Documentation Grounding & Knowledge Base (`grounded-docs` MCP)

**Always ground in official, indexed documentation before implementing.**

- **Check First:** Before writing code for external libraries, APIs, or tools, check if the library is indexed using `list_libraries` and query relevant syntax/APIs with `search_docs`.
- **Index On-Demand:** When working with a library or package not yet indexed (or when a specific version is required), proactively use `scrape_docs` to index its official documentation site or repository so it remains available for all future sessions.
- **Single Page Lookups:** Use `fetch_url` to quickly ingest single documentation pages or reference links into clean Markdown.

---

## 6. One-Click Email & Short URLs (Shlink)

**When suggesting emails or drafting messages, provide 1-click compose links shortened via Shlink.**

- **Shlink Endpoint:** `https://go.sahil.dedyn.io`
- **API Key:** `$SHLINK_API_KEY` (retrieved from `$SHLINK_API_KEY` or read directly from `~/.env` / `~/dots/.env`)
- **Compose Link Formats:**
  - **Mobile / Android (Opens Gmail App):** `mailto:recipient@example.com?subject=URL_ENCODED_SUBJECT&body=URL_ENCODED_BODY`
  - **Web (Opens Gmail Web):** `https://mail.google.com/mail/?view=cm&fs=1&to=recipient@example.com&su=URL_ENCODED_SUBJECT&body=URL_ENCODED_BODY`
- **Behavior:** Whenever drafting or recommending an email for the user to send, construct the pre-filled compose link, shorten it via Shlink REST API (`POST /rest/v3/short-urls`), and provide the shortened `https://go.sahil.dedyn.io/...` link so a single click/tap opens Gmail with the recipient, subject, and body ready to send.

---

## 7. Package Management Standards (`uv` for Python, `pacman` for System Tools)

- **Python Packages:** Always use `uv` (`uv pip install`, `uv run`, `uv tool run`, `uv add`) for all Python dependencies, package management, and isolated environments. Never invoke bare/unmanaged `pip`.
- **System Tools & CLI Binaries:** Prefer the native Arch Linux package manager `pacman` (e.g. `sudo pacman -S yt-dlp`) for system binaries, CLI tools, and system-level dependencies.

---

## 8. Terminal Diagrams & Flowcharts (Mermaid ASCII & Visuals)

**When showing diagrams, workflows, or architectures, always display them in readable ASCII / Unicode diagram format instead of just raw code blocks.**

- **Terminal Width Constraints (< 100 cols):** ASCII diagrams must be vertically stacked, compact, and fit within standard terminal widths (< 80-100 columns). Never lay out wide parallel subgraphs horizontally that trigger terminal width overflow warnings.
- **Visual Artifacts & Kitty Protocol:** For wide, multi-branch, or complex diagrams, render an image artifact and provide the `kitten icat` / `viu` command or artifact link alongside the compact ASCII view so it scales smoothly at any window size.
