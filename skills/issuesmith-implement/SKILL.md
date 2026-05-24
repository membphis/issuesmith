---
name: issuesmith-implement
description: Use when implementing an Issue's Task Checklist - reads the Issue first, breaks down tasks, enforces TDD, verifies every change, and updates the Issue after each task
---

# Issuesmith Implementation

## Overview

Read the Issue. Break down tasks. Write tests first. Implement. Verify. Update the Issue. Repeat.

**The Issue is the source of truth.** Every line of code must trace back to the Issue's Goal and Acceptance Criteria. Every completed task must be checked off. Every claim of "done" must be backed by verification evidence.

**Violating the letter of the rules is violating the spirit of the rules.**

## The Iron Laws

```
NO CODE WITHOUT READING THE ISSUE FIRST.
NO IMPLEMENTATION WITHOUT WATCHING A TEST FAIL.
NO TASK COMPLETE WITHOUT UPDATING THE ISSUE CHECKLIST.
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.
```

Miss any step? Start the task over.

## When to Use

**Always when implementing code:**
- New features
- Bug fixes
- Refactoring with behavioral changes
- Documentation with code examples

**Exceptions (ask your human partner):**
- Pure documentation changes (no code)
- Configuration-only changes
- Throwaway prototypes

Thinking "skip the Issue just this once"? Stop. That's rationalization.

## The Issue-First Cycle

```
┌─────────────────────────────────────────────────────┐
│                   ISSUE-FIRST CYCLE                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  READ ISSUE → BREAK DOWN → [TDD CYCLE] → VERIFY     │
│       ↑                                      │       │
│       └────── UPDATE ISSUE CHECKBOX ←────────┘       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Step 1: Read the Issue

Before touching any code, get the full Issue context:

```bash
gh issue view <N> --json title,body,labels
```

If no Issue number was provided, list open Issues first:

```bash
gh issue list --state open --json number,title,labels --limit 20
```

Internalize every section:
- **Background** — why this matters
- **Goal** — what success looks like
- **Non-goals** — explicit boundaries (do not cross them)
- **Acceptance Criteria** — the testable outcomes
- **Task Checklist** — checked `[x]` vs unchecked `[ ]`
- **Notes/Decisions** — trade-offs and context

If anything is unclear, **stop and ask**. Do not guess.

### Step 2: Assess State

Find the first unchecked task. Show progress.

```
Progress: 3/8 tasks done. Starting task 4: Add filterTasks utility.
```

All tasks done? Announce completion and suggest moving to review/PR.

### Step 3: Break Down the Current Task

Split the task into bite-sized sub-steps. Each sub-step is a single concrete action — one file to create, one function to write, one test to add.

<Good>
```
Task 4: Add filterTasks utility

  - 4.1 Write failing test for filterTasks (edge cases first)
  - 4.2 Watch test fail
  - 4.3 Write minimal filterTasks implementation
  - 4.4 Watch test pass + run full suite
  - 4.5 Integrate into TaskList component (same TDD cycle)
  - 4.6 Run lint + commit
```
Each step is one action. Tests before code. One thing at a time.
</Good>

<Bad>
```
Task 4: Add filterTasks utility

  - 4.1 Implement filterTasks and use it in TaskList
  - 4.2 Add tests
  - 4.3 Handle edge cases and error states
```
Implementation before tests. Multiple actions per step. "Handle edge cases" is a placeholder, not a step.
</Bad>

**Breakdowns stay in the conversation. Never write them to local files.**

### Step 4: The TDD Cycle

For every sub-step that produces code, follow the RED-GREEN-REFACTOR cycle:

**RED — Write the failing test**

Write one minimal test showing what should happen. One behavior. Clear name. Real code.

```
test('filterTasks matches title case-insensitively', () => {
  const tasks = [{ title: 'Buy Milk' }, { title: 'Write Code' }];
  expect(filterTasks(tasks, 'milk')).toHaveLength(1);
});
```

**Verify RED — Watch it fail (MANDATORY)**

```bash
npm test -- --testPathPattern=filterTasks
```

Confirm: test fails (not errors), failure message is expected, fails because feature missing (not typos).

**Test passes?** You're testing existing behavior. Fix the test.
**Test errors?** Fix the error, re-run until it fails correctly.

**GREEN — Minimal code**

Write the simplest code to pass the test. Nothing more.

```
function filterTasks(tasks, query) {
  return tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()));
}
```

Don't add features. Don't refactor other code. Don't "improve" beyond the test.

**Verify GREEN — Watch it pass (MANDATORY)**

```bash
npm test -- --testPathPattern=filterTasks
```

Confirm: test passes, other tests still pass, output pristine.

**Test fails?** Fix code, not test.
**Other tests fail?** Fix now. Don't push forward.

**REFACTOR — Clean up**

After green only: remove duplication, improve names, extract helpers. Keep tests green. Don't add behavior.

### Step 5: Verify Before Completion

Before claiming any task is complete, run the verification gate:

```
1. IDENTIFY: What command proves this task is done?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim
```

```bash
npm test && npm run lint
```

No claiming "should work" or "looks correct." Run the command. Read the output. THEN claim the result.

### Step 6: Commit

Stage only the files relevant to this task. Write a descriptive message:

```bash
git add <files>
git commit -m "feat: add filterTasks utility with case-insensitive matching"
```

One task = one commit. No batching unrelated changes. No "WIP" or "fix stuff" messages.

### Step 7: Update the Issue

After completing each top-level Task Checklist item, check it off:

```bash
gh issue view <N> --json body  # get current body
gh issue edit <N> --body "<updated body with - [x] for completed task>"
```

Preserve exact formatting. Only change the checkbox for the completed task. Show the user what was updated.

### Step 8: Continue or Complete

Show progress and ask:

```
Task 4 complete. Progress: 4/8 tasks done.

Next: Task 5 — Integrate filterTasks into TaskList. Continue?
```

User says continue → go back to Step 2 (re-read the Issue, pick next task).
All tasks done → final verification, suggest review/PR.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I already know what the Issue says" | Memory is not evidence. Re-read it. |
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll write tests after" | Tests passing immediately proves nothing. |
| "I'll update the Issue later" | You'll forget. Update now. |
| "Tests after achieve the same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
| "Should work now" | RUN the verification. Should ≠ does. |
| "This breakdown is just for me" | If it's not worth writing down, it's not a plan. |
| "Just this once, skip the Issue" | The Issue is your contract. Skipping it voids the contract. |
| "I'll commit all changes at the end" | Small commits = reversible steps. Big commits = unrecoverable mess. |
| "Keeping plan files local is fine" | Local plans committed accidentally become stale docs. Keep in conversation. |

## Red Flags — STOP and Correct

- Code written before reading the Issue
- Code written before watching a test fail
- Test passes immediately on first run
- Task marked complete without updating the Issue
- Claiming "done" without running verification
- Using "should", "probably", "seems to work"
- Local plan files created on disk
- Batching unrelated changes in one commit
- Implementing beyond the Issue's Non-goals
- Guessing when Issue is ambiguous (ASK instead)

**Any of these means: stop, correct, then continue.**

## Verification Checklist

Before marking any task complete:

- [ ] Read the Issue section relevant to this task
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass (fresh run, full suite)
- [ ] Linter clean (fresh run)
- [ ] Committed with descriptive message
- [ ] Updated the Issue checkbox

Can't check all boxes? You skipped a step. Go back.

## Key Patterns

**Starting a task:**
```
✅ [Read Issue] → "Task 4: Add filterTasks. 3/8 done. Breaking it down..."
❌ Jumping straight to code without acknowledging the Issue
```

**TDD:**
```
✅ Write test → Run (fail) → Write code → Run (pass) → Commit
❌ Write code → Write test → Run (pass) → "TDD done"
```

**Verification:**
```
✅ [Run npm test] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Updating Issue:**
```
✅ [gh issue edit] → "Checked off task 4 in Issue #7"
❌ "I'll update the Issue after all tasks are done"
```

**Failing test for bug fix:**
```
✅ Write test reproducing bug → Watch it fail (proves bug exists) → Fix → Watch it pass (proves fix)
❌ Fix the bug → Write test (passes immediately, proves nothing)
```

## When Stuck

| Problem | Solution |
|---------|----------|
| Issue description is ambiguous | Stop. Ask the user. Don't guess. |
| Don't know how to test | Write the assertion first. Write the wished-for API. |
| Test too complicated | Design too complicated. Simplify the interface. |
| Breaking down seems impossible | Task is too big. Ask the user to split the Issue task. |
| Verification keeps failing | Don't force through. Stop and investigate the root cause. |
| Scope expanding beyond Non-goals | Remind the user of Non-goals. Suggest a new Issue. |

## When to Stop and Ask

**Stop implementing immediately when:**
- Issue description is unclear or contradictory
- Acceptance Criteria can't be verified
- A Non-goal blocks the implementation path
- Verification fails repeatedly with no clear cause
- The task requires decisions not captured in the Issue

**Asking for clarification is faster than implementing wrong.**

## Integration

This skill works with other IssueSmith commands:
- **`/ism:start`** — Creates the isolated worktree for this implementation
- **`/ism:explore`** — Use before creating Issues to explore the problem space
- **`/ism:create`** — Creates the Issue that this skill implements

When all tasks are complete, move to review and PR creation.

## The Bottom Line

**Issue is the source of truth. Tests are the proof. Verification is the gate. The Issue checklist is the scoreboard.**

These are non-negotiable.
