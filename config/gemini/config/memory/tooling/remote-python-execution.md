# Remote Python Execution over SSH

- **Date:** 2026-09-09
- **Type:** Process / Tooling
- **Status:** Proved (Verified across 4 attempts in session 58f60b5e)

## Rule
When executing multi-line Python scripts or JSON data extraction over SSH, **never** pass inline code via `ssh host "python3 -c '...'"` or attempt complex string escaping.

Always pipe the script directly into the remote interpreter via a single-quoted heredoc:

```bash
ssh <host> python3 - << 'EOF'
import json
# multi-line code with quotes, dictionaries, and f-strings
EOF
```

## Why
Inline `python3 -c` commands undergo double shell expansion (local bash + remote SSH shell), which corrupts string quotes, causes `NameError` on inner variables, and breaks nested quotes. Single-quoted heredocs (`<< 'EOF'`) prevent local expansion and feed the exact Python script directly into stdin.
