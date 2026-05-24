# Installing IssueSmith for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

## Installation

Add IssueSmith to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["issuesmith@git+https://github.com/membphis/issuesmith.git"]
}
```

Restart OpenCode. The plugin installs through OpenCode's plugin manager and
registers all skills, commands, and workflow context.

Verify by asking: "What IssueSmith skills are available?"

## Usage

IssueSmith provides 7 slash commands for the development workflow:

- `/ism:explore` — Enter explore mode to think through ideas
- `/ism:create` — Create a structured GitHub Issue from your idea
- `/ism:start <N>` — Start development by creating a worktree for Issue #N
- `/ism:implement` — Implement the Issue Task Checklist
- `/ism:finish` — Finish: verify, PR, review, merge
- `/ism:verify` — Run verification — evidence before claims
- `/ism:code-review` — Systematic code review

Or use OpenCode's native `skill` tool:

```
use skill tool to load issuesmith-explore
use skill tool to load issuesmith-create
```

## Updating

OpenCode installs IssueSmith through a git-backed package spec. To pin a specific version:

```json
{
  "plugin": ["issuesmith@git+https://github.com/membphis/issuesmith.git#v1.0.0"]
}
```

## Troubleshooting

### Plugin not loading

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i issuesmith`
2. Verify the plugin line in your `opencode.json`
3. Make sure you're running a recent version of OpenCode

### Skills not found

1. Use `skill` tool to list what's discovered
2. Check that the plugin is loading (see above)

### Tool mapping

When skills reference other tools:
- `TodoWrite` → `todowrite`
- `Task` with subagents → OpenCode's subagent system (@mention)
- `Skill` tool → OpenCode's native `skill` tool
- File operations → your native tools

## Getting Help

- Report issues: https://github.com/membphis/issuesmith/issues
- Full documentation: https://github.com/membphis/issuesmith
