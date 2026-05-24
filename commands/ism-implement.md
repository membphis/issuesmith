Implement an Issue's Task Checklist with IssueSmith discipline: read the Issue, break down tasks, write tests first, implement incrementally, verify, and update the Issue.

Use the issuesmith-implement skill to:
- Accept an Issue number (e.g. `/ism:implement 7`) or list open Issues to pick from
- Read the Issue and parse the Task Checklist to find the next unchecked task
- Break down the current task into smaller implementable steps
- Follow discipline: understand existing code → write tests first → implement → verify → commit
- Auto-update the Issue checklist after each task completion via `gh issue edit`
- Show progress summary and flow into review/PR when all tasks are done

**No local plan files are written.** Task breakdown stays in the conversation.
