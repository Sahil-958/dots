# AI Instance Governance Rules

These RULES must be followed at all times.

This document defines mandatory operating principles for all AI instances. It ensures consistent behaviour, robust execution, and secure collaboration across tasks and services.

---

## Code Quality Standards

1. All scripts must implement structured error handling with specific failure modes.
2. Every function must include a concise, purpose-driven docstring.
3. Scripts must verify preconditions before executing critical or irreversible operations.
4. Long-running operations must implement timeout and cancellation mechanisms.
5. File and path operations must verify existence and permissions before granting access.

---

## Documentation Protocols

1. Documentation must be synchronised with code changes—no outdated references.
2. Markdown files must use consistent heading hierarchies and section formats.
3. Code snippets in documentation must be executable, tested, and reflect real use cases.
4. Each doc must clearly outline: purpose, usage, parameters, and examples.
5. Technical terms must be explained inline or linked to a canonical definition.

---

## Task Management Rules

1. Tasks must be clear, specific, and actionable—avoid ambiguity.
2. Every task must be assigned a responsible agent, explicitly tagged.
3. Complex tasks must be broken into atomic, trackable subtasks.
4. No task may conflict with or bypass existing validated system behaviour.
5. Security-related tasks must undergo mandatory review by a designated reviewer agent.
6. Agents must update task status and outcomes in the shared task file.
7. Dependencies between tasks must be explicitly declared.
8. Agents must escalate ambiguous, contradictory, or unscoped tasks for clarification.

---

## Security Compliance Guidelines

1. Hardcoded credentials are strictly forbidden—use secure storage mechanisms.
2. All inputs must be validated, sanitised, and type-checked before processing.
3. Avoid using eval, unsanitised shell calls, or any form of command injection vectors.
4. File and process operations must follow the principle of least privilege.
5. All sensitive operations must be logged, excluding sensitive data values.
6. Agents must check system-level permissions before accessing protected services or paths.

---

## Process Execution Requirements

1. Agents must log all actions with appropriate severity (INFO, WARNING, ERROR, etc.).
2. Any failed task must include a clear, human-readable error report.
3. Agents must respect system resource limits, especially memory and CPU usage.
4. Long-running tasks must expose progress indicators or checkpoints.
5. Retry logic must include exponential backoff and failure limits.

---

## Core Operational Principles

1. Agents must never use mock, fallback, or synthetic data in production tasks.
2. Error handling logic must be designed using test-first principles.
3. Agents must always act based on verifiable evidence, not assumptions.
4. All preconditions must be explicitly validated before any destructive or high-impact operation.
5. All decisions must be traceable to logs, data, or configuration files.

---

## Design Philosophy Principles

### KISS (Keep It Simple, Stupid)

• Solutions must be straightforward and easy to understand.  
• Avoid over-engineering or unnecessary abstraction.  
• Prioritise code readability and maintainability.

### YAGNI (You Aren’t Gonna Need It)

• Do not add speculative features or future-proofing unless explicitly required.  
• Focus only on immediate requirements and deliverables.  
• Minimise code bloat and long-term technical debt.

### SOLID Principles

1. Single Responsibility Principle — each module or function should do one thing only.
2. Open-Closed Principle — software entities should be open for extension but closed for modification.
3. Liskov Substitution Principle — derived classes must be substitutable for their base types.
4. Interface Segregation Principle — prefer many specific interfaces over one general-purpose interface.
5. Dependency Inversion Principle — depend on abstractions, not concrete implementations.

---

## System Extension Guidelines

1. All new agents must conform to existing interface, logging, and task structures.
2. Utility functions must be unit tested and peer reviewed before shared use.
3. All configuration changes must be reflected in the system manifest with version stamps.
4. New features must maintain backward compatibility unless justified and documented.
5. All changes must include a performance impact assessment.

---

## Quality Assurance Procedures

1. A reviewer agent must review all changes involving security, system config, or agent roles.
2. Documentation must be proofread for clarity, consistency, and technical correctness.
3. User-facing output (logs, messages, errors) must be clear, non-technical, and actionable.
4. All error messages should suggest remediation paths or diagnostic steps.
5. All major updates must include a rollback plan or safe revert mechanism.

---

## Testing & Simulation Rules

1. All new logic must include unit and integration tests.
2. Simulated or test data must be clearly marked and never promoted to production.
3. All tests must pass in continuous integration pipelines before deployment.
4. Code coverage should exceed defined thresholds (e.g. 85%).
5. Regression tests must be defined and executed for all high-impact updates.
6. Agents must log test outcomes in separate test logs, not production logs.

---

## Change Tracking & Governance

1. All configuration or rule changes must be documented in the system manifest and changelog.
2. Agents must record the source, timestamp, and rationale when modifying shared assets.
3. All updates must increment the internal system version where applicable.
4. A rollback or undo plan must be defined for every major change.
5. Audit trails must be preserved for all task-modifying operations.
