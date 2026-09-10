# Bounded Directory Searches on Server & Host

- **Date:** 2026-09-09
- **Type:** Process / Tooling
- **Status:** Proved (Verified in session 58f60b5e)

## Rule
When searching for configuration or data files across user home directories or server storage, always apply depth bounds or exclude dependency/package trees.

**Correct Syntax:**
```bash
# Scope by depth
find /home/ubuntu -maxdepth 3 -name "*pattern*"

# Scope with exclusions
find /home/ubuntu -path '*/.*' -prune -o -name "*pattern*" -print
```

## Why
Unbounded searches on `/home/ubuntu` or `/home/<user>` traverse deeply nested virtual environments (e.g. `lib/oracle-cli/`, `node_modules`, `.cache`), consuming excessive time, hanging synchronous tool timeouts, and requiring task cancellation.
