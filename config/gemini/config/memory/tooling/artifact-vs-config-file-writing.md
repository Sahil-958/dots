# File Creation Constraints: Artifacts vs Global Configs

- **Date:** 2026-09-09
- **Type:** Tooling / Antigravity Harness
- **Status:** Proved (Verified in session 58f60b5e)

## Rule
- Use `write_to_file` with `ArtifactMetadata` **strictly** for artifact documents located within `<appDataDir>/brain/<conversation-id>/`.
- For global configuration files (e.g. `~/.gemini/config/skills/`, `~/.gemini/config/memory/`, `~/.claude/`), write files using shell redirection via `run_command` (`cat << 'EOF' > <path>`).

## Why
The Antigravity harness validates `write_to_file` calls containing `ArtifactMetadata` and strictly rejects paths outside the active conversation's artifact directory.
