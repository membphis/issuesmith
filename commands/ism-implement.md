Implement an Issue's Task Checklist with IssueSmith discipline: read the Issue, break down tasks, write tests first, implement incrementally, verify, and update the Issue.

Supports two modes:
- **Manual** (standalone `/ism:implement`): pauses between tasks for confirmation, asks before entering finish
- **Auto** (invoked internally by `/ism:finish`): no pauses between tasks, auto-proceeds to finish

Use the issuesmith-implement skill to:
- Accept an Issue number (e.g. `/ism:implement 7`) or list open Issues to pick from
- Read the Issue and parse the Task Checklist to find the next unchecked task
- Break down the current task into smaller implementable steps
- Follow discipline: understand existing code → write tests first → implement → verify → commit
- Use the AI built-in todo list feature to track each task and sub-step in real time (visible in TUI without scrolling logs); update status immediately on completion
- Track progress in conversation; resolved checklist items are listed in the PR description by `ism:finish` — the Issue itself is not modified during implementation
- Show progress summary and flow into review/PR when all tasks are done

**No local plan files are written.** Task breakdown stays in the conversation.
