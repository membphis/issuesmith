Create a Pull Request from the current worktree with final verification, AC check, AI code review, and PR template auto-fill.

Use the issuesmith-review skill to:
- Run final verification (tests + lint) — evidence before claims
- Check every Acceptance Criteria item against the Issue
- Auto-detect the Issue number from the current worktree branch
- Push the branch and create a PR via `gh pr create` using the PR template
- Auto-fill PR template from Issue context (Background, Goal, AC)
- Offer AI code review before merging
- Clean up: suggest worktree removal after merge

**No local files are written.** PR body is composed from Issue context and conversation history.
