# Skill: issuesmith-implement

进入 IssueSmith 实现模式。读取 Issue，按 Task Checklist 逐项实现，遵守测试先行、小步提交、边开发边更新 Issue 的纪律。

**重要：不写入任何本地 plan 文件。** 任务拆解仅存于对话中，不入库。

---

## Step 1: Determine the Issue

If the user provides an Issue number (e.g. `/ism:implement 7`), use it directly and skip to Step 2.

If no number is given, list recent open Issues:

```bash
gh issue list --state open --json number,title,labels --limit 20
```

Present the list clearly and let the user pick by number.

## Step 2: Read the Issue

```bash
gh issue view <N> --json title,body,labels
```

Extract and internalize:
- **Title** — what this is about
- **Background** — why this matters
- **Goal** — what success looks like
- **Non-goals** — explicit scope boundaries (respect them)
- **Acceptance Criteria** — the testable outcomes to satisfy
- **Task Checklist** — the implementation tasks, some may be checked `[x]`, some `[ ]`
- **Notes/Decisions** — important context and trade-offs

## Step 3: Assess current state

Parse the Task Checklist from the Issue body. Count completed (`[x]`) vs remaining (`[ ]`) tasks.

**If all tasks are done:**
- Congratulate the user
- Show a summary of what was accomplished
- Suggest: "All tasks complete. Ready for review and PR? Consider running tests one final time, then create a PR."

**If there are remaining tasks:**
- Identify the **first unchecked task** as the current focus
- Show a progress summary (e.g. "3/8 tasks done, starting task 4")

## Step 4: Break down the current task

Take the current unchecked task and break it into smaller, implementable sub-steps. Each sub-step should be:
- A single file to create/modify, a single function to write, or a single test to add
- Concrete enough to complete in one focused iteration
- Ordered by dependency

Present the breakdown to the user for confirmation. Example:

```
Task 4: Add filterTasks utility with case-insensitive search

  - 4.1 Create src/utils/filterTasks.ts with filterTasks function
  - 4.2 Write unit tests in src/utils/__tests__/filterTasks.test.ts
  - 4.3 Integrate filterTasks into TaskList component
  - 4.4 Run npm test && npm run lint
  - 4.5 Git commit

Look good? I'll start with 4.1 and 4.2 together (tests first).
```

**Keep breakdowns in the conversation only. Never write them to local files.**

## Step 5: Implement sub-steps with discipline

For each sub-step, follow this cycle:

### 5.1 Understand
- Read relevant existing code before writing anything
- Understand patterns, naming conventions, and dependencies in the codebase
- If anything is unclear about the Issue's intent, ask the user — don't guess

### 5.2 Write tests first
- For new features and bug fixes: write the test before the implementation
- Tests should cover the happy path, edge cases, and error conditions
- Verify the test fails (red phase) before writing implementation

### 5.3 Implement
- Write the minimal code to make the test pass
- Follow the existing code style and conventions
- Avoid over-engineering: stick to the Non-goals in the Issue

### 5.4 Verify
- Run the project's test command (detect from `package.json` scripts, `Makefile`, etc.)
- Run the project's lint command if available
- Fix any failures before moving on

### 5.5 Commit
- Stage only the files relevant to this sub-step
- Write a descriptive commit message following the repo's convention
  - Feature: `feat: <description>`
  - Fix: `fix: <description>`
  - Refactor: `refactor: <description>`
  - Test: `test: <description>`

```bash
git add <files>
git commit -m "<type>: <description>"
```

## Step 6: Update the Issue

After completing each **top-level Task Checklist item** (not every sub-step commit), update the Issue to check it off:

- Read the current Issue body
- Change `- [ ] <task description>` to `- [x] <task description>` for the completed task
- Update via `gh issue edit <N> --body "<updated body>"`

**Important:** Preserve the exact Issue body formatting. Only change the checkbox for the completed task. Use `gh issue view <N> --json body` to get the current body before editing.

Show the user what was updated.

## Step 7: Continue or pause

After updating the Issue, show progress:

```
Task 4 complete. Progress: 4/8 tasks done.

Next up: Task 5 — <description>. Continue?
```

If the user wants to continue, go back to Step 3 (re-read the Issue to get the latest state, pick the next unchecked task).

If all tasks are complete, show the final progress and suggest:

```
All 8/8 tasks complete.

Acceptance Criteria checklist:
- [ ] Run full test suite and lint
- [ ] Verify each AC item manually
- [ ] Create a PR referencing this Issue

Want me to help with review and PR next?
```

---

## Guardrails

- **No local plan files** — Task breakdowns stay in the conversation. Never create `.opencode/scratch/` or intermediate markdown files.
- **Issue is the source of truth** — Always read the Issue before implementing. Align every change with the Goal, AC, and Non-goals.
- **Tests first for core behavior** — New features and bug fixes require tests written before implementation. Refactoring and docs changes may skip this.
- **Small commits** — Commit each logical unit independently. Don't batch unrelated changes.
- **Update Issue after each task** — Keep the Issue in sync. Completed tasks should be checked off immediately.
- **Ask, don't guess** — If the Issue is ambiguous, ask the user for clarification rather than assuming.
- **Respect Non-goals** — Don't expand scope. If the user asks for something marked as out-of-scope, remind them and suggest a new Issue.
- **No dependency on `openspec` CLI** — This skill uses only `gh` and `git`.
