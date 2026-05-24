---
name: using-issuesmith
description: Use when starting any conversation - establishes how to find and use IssueSmith skills, requiring skill tool invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance an IssueSmith skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

IssueSmith skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (AGENTS.md, CLAUDE.md, GEMINI.md, direct requests) — highest priority
2. **IssueSmith skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

## How to Access Skills

Use OpenCode's native `skill` tool. When you invoke a skill, its content is loaded and presented to you — follow it directly. Never use the Read tool on skill files.

## Platform Adaptation

Skills use OpenCode tool names. Tool mapping:
- `TodoWrite` → `todowrite`
- `Task` with subagents → OpenCode's subagent system (@mention)
- `Skill` tool → OpenCode's native `skill` tool
- `Read`, `Write`, `Edit`, `Bash` → Your native tools

# Using IssueSmith Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check.

## The IssueSmith Workflow

IssueSmith is a 4-step development workflow driven by GitHub Issues:

1. **Explore** (`/ism:explore` → `issuesmith-explore`) — Think before building. Explore the problem space, investigate the codebase, check existing Issues, compare options. No code written.

2. **Create** (`/ism:create` → `issuesmith-create`) — Turn ideas into structured Issues with Background, Goal, Acceptance Criteria, and Task Checklist. Published via `gh issue create`.

3. **Implement** — Build the Issue inside an isolated git worktree:
   - **Start** (`/ism:start <N>` → `issuesmith-start`) — Create worktree + branch from Issue #N, install dependencies
   - **Implement** (`/ism:implement` → `issuesmith-implement`) — Read Issue, break down tasks, TDD, verify, update Issue checklist

4. **Finish** (`/ism:finish` → `issuesmith-finish`) — Verify, push, create PR, wait for CI, handle review, merge (human confirms).

**Auxiliary skills:**
- **Verify** (`/ism:verify` → `issuesmith-verify`) — Run tests and lint, evidence before claims
- **Code Review** (`/ism:code-review` → `issuesmith-code-review`) — Systematic review across 5 dimensions

## Core Principles

- **Issue is the single source of truth** — Every change binds to an Issue. All requirements, AC, and task breakdown live there.
- **Test first, always** — Write failing tests before implementation.
- **Evidence before claims** — Never claim "done" without fresh verification output.
- **No local plan files** — Task breakdowns stay in conversation, never committed.
- **Worktree isolation** — Each Issue gets its own git worktree and branch.

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple change" | Even simple changes deserve an Issue. Check for skills. |
| "I can just fix this quickly" | Undisciplined action creates technical debt. Use the workflow. |
| "I'll skip the worktree for this" | Isolation prevents conflicts. Use `/ism:start`. |
| "The tests can wait" | They cannot. TDD is mandatory. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't need an Issue" | If it changes code, it needs an Issue. |
| "I'll just open a PR directly" | Without an Issue, there's no AC to validate against. |

## Skill Priority

When multiple IssueSmith skills could apply:

1. **Process skills first** (explore, create) — determine WHAT to build
2. **Environment skills second** (start) — set up the workspace
3. **Implementation skills third** (implement) — write the code
4. **Quality skills last** (verify, code-review, finish) — ensure correctness

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip the workflow.
