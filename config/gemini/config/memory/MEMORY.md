# Antigravity Persistent Memory Index

This index tracks durable process findings, infrastructure facts, and verified guidelines discovered across sessions.

## Categories
- `process/`: Operational workflows, debugging strategies, and interaction rules.
- `infrastructure/`: Server topology, port mappings, system quirks, and container behaviors.
- `tooling/`: CLI syntax, tool-specific constraints, and library requirements.

## Log of Entries
- **2026-09-09** — [`infrastructure/opengym-architecture.md`](file:///home/sawhill/.gemini/config/memory/infrastructure/opengym-architecture.md): State file schema, day-of-week index mapping (0=Sun..6=Sat), custom vs built-in exercise ID standards on `ampere`.
- **2026-09-09** — [`tooling/remote-python-execution.md`](file:///home/sawhill/.gemini/config/memory/tooling/remote-python-execution.md): Use stdin heredocs (`ssh host python3 - << 'EOF'`) instead of inline `-c` strings to avoid quoting corruptions over SSH.
- **2026-09-09** — [`tooling/bounded-remote-searches.md`](file:///home/sawhill/.gemini/config/memory/tooling/bounded-remote-searches.md): Bound remote `find` operations with `-maxdepth` or prune package/library paths to avoid traversal hangs.
- **2026-09-09** — [`tooling/artifact-vs-config-file-writing.md`](file:///home/sawhill/.gemini/config/memory/tooling/artifact-vs-config-file-writing.md): Use `write_to_file` exclusively for artifacts in `<appDataDir>/brain/<id>/`; use shell file writing for user config/global paths.
