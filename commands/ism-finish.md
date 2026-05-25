Smart entry command. Auto-detects project state and performs the right action:

- **No worktree** → asks for Issue number → auto-creates worktree → implements → PR
- **In worktree, implementation incomplete** → auto-implements remaining tasks → PR
- **Implementation complete** → directly runs final verification, PR creation, CI waiting, AI review, third-party review handling, merge, and worktree cleanup

Use the issuesmith-finish skill to:
- Detect current state (worktree check) and branch accordingly
- Run final verification (tests + lint) with fresh evidence
- Self-check during CI wait: verification-before-completion pattern + AI code review
- Check every Acceptance Criteria item against the Issue
- Push and create a PR via `gh pr create` with auto-filled template
- Wait for CI to pass, handle third-party review comments
- Merge when all conditions are met, then suggest worktree cleanup

**No local files are written.** PR body is composed from Issue context and conversation history.
