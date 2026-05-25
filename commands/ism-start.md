Start development for an Issue by creating an isolated git worktree and branch.

Supports two modes:
- **Manual** (standalone `/ism:start`): confirms branch name before creating
- **Auto** (invoked internally by `/ism:finish`): skips confirmation, auto-proceeds to implementation

Use the issuesmith-start skill to:
- Accept an Issue number (e.g. `/ism:start 3`) or list open Issues to pick from
- Read the Issue to auto-derive branch name from title and labels
- Confirm branch name and worktree path with you before creating (manual mode only)
- Create the worktree: `git worktree add -b <branch> .ism/<name> main`
- Auto-detect and install dependencies (npm, pip, etc.)
- Show the worktree path and next steps when done

**No local files are written.** The entire process happens via git commands.
