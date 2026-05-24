# Skill: issuesmith-create

Create a well-structured GitHub Issue from an idea or problem description. Guided conversation from idea to published Issue.

**IMPORTANT: Do NOT write any local files during this process.** All intermediate content stays in the conversation context. Only the final Issue is persisted via `gh issue create`.

---

**Input**: The user's request should include a description of what they want to build, fix, or improve.

**Steps**

## Step 1: Clarify the idea

If the user provides a clear description, proceed. If vague, ask open-ended questions to understand:

- What problem are you solving?
- What does success look like?
- What's explicitly out of scope?

## Step 2: Detect the issue type

From the user's description, detect the type. This affects the title prefix and internal guidance:

| Type | Title prefix | Guidance emphasis |
|------|-------------|-------------------|
| Feature / Enhancement | `[Feature]: ` | Capability description, user-facing behavior |
| Bug fix | `[Bug]: ` | Reproduction steps, expected vs actual behavior, impact |
| Performance | `[Perf]: ` | Current metrics, target metrics, measurement method |
| Documentation | `[Docs]: ` | Gap description, coverage target, audience |
| Refactoring | `[Refactor]: ` | Current pain points, target architecture, non-functional goals |

If the type is ambiguous, ask the user to confirm.

## Step 3: Generate Background

Based on the user's description and issue type, draft the **Background** section.

For each type, adapt the framing:
- **Feature**: Describe the current problem or missing capability. Why now?
- **Bug**: Describe what's broken. Include reproduction context. What's the impact?
- **Perf**: Describe the current performance issue. Where is the bottleneck? What metrics show the problem?
- **Docs**: Describe what's missing or inaccurate. Who is affected?
- **Refactor**: Describe the current pain points. What makes it hard to change or extend?

Present the draft to the user. Accept feedback, revise, then get confirmation.

## Step 4: Generate Goal

Draft the **Goal** — a concise statement of what will change once the Issue is resolved.

- One to three sentences max.
- Describes the end state, not the steps to get there.
- Should be testable: someone reading it can tell whether it's achieved.

Present to the user. Accept feedback, revise, confirm.

## Step 5: Generate Non-goals (if applicable)

If the user mentioned explicit scope boundaries, or if the topic naturally invites scope creep, draft **Non-goals**. If nothing is clearly out of scope, skip this section (it's optional).

- What is explicitly NOT included?
- What future work or separate Issues might cover?

Ask the user: "Anything you want to explicitly mark as out of scope?"

## Step 6: Generate Acceptance Criteria

Derive **Acceptance Criteria** from the Goal. AC must be a checklist of verifiable statements.

**Derivation logic:**
1. Break the Goal into observable outcomes.
2. For each outcome, write a checklist item that a person could verify.
3. Use concrete, testable language: "User can X", "System returns Y", "Page displays Z".
4. Include edge cases and error conditions if relevant.

**Format:**
```markdown
- [ ] User can <observable action>
- [ ] System <observable behavior>
- [ ] When <condition>, <expected outcome>
```

**Example:**
```
Goal: Add a dark mode toggle to settings.

- [ ] User can toggle between light and dark mode in Settings
- [ ] Theme preference persists across page reloads (localStorage)
- [ ] System respects prefers-color-scheme on first visit
- [ ] All existing pages render correctly in both themes
- [ ] Focus states and contrast ratios meet WCAG AA
```

Present the AC to the user. Accept feedback, revise, confirm.

## Step 7: Generate Task Checklist

Derive a **Task Checklist** from the Goal and Acceptance Criteria.

**Rules:**
- Group related tasks under numbered headings (e.g., `## 1. Infrastructure`)
- Use hierarchical numbering (1.1, 1.2, 2.1, etc.)
- Each task must be concrete — a single file to create, a single function to write, a single test to add
- Tasks should be ordered by dependency (foundational tasks first)
- All items start unchecked `- [ ]`

**Example:**
```markdown
## 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for theme colors
- [ ] 1.3 Implement localStorage persistence

## 2. UI Components
- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to Settings page
```

Present to the user. Accept feedback, revise, confirm.

## Step 8: Generate Notes / Decisions (if applicable)

If any technical decisions, trade-offs, or references emerged during the conversation, draft **Notes / Decisions**.

- Document why one approach was chosen over another.
- Include links to relevant docs, prior Issues, or external references.
- If nothing worth noting, skip this section (it's optional).

## Step 9: Assemble and present full draft

Combine all confirmed sections into the final Issue body:

```markdown
### Background
...

### Goal
...

### Non-goals
(omit if empty)

### Acceptance Criteria
- [ ] ...

### Task Checklist
- [ ] 1. ...

### Notes / Decisions
(omit if empty)
```

Present the complete draft to the user. Ask:
- "Ready to create this Issue? You can still make changes."

## Step 10: Create the GitHub Issue

Once the user confirms, create the Issue:

```bash
gh issue create \
  --title "<prefix><title>" \
  --body "<body>" \
  --label "<labels>"
```

**Labels by type:**
| Type | Suggested labels |
|------|-----------------|
| Feature | `enhancement` |
| Bug | `bug` |
| Perf | `performance` |
| Docs | `documentation` |
| Refactor | `refactor` |

**Important:**
- Use single quotes or heredoc for the body to avoid shell interpolation issues.
- If `gh` is not authenticated, tell the user to run `gh auth login`.
- Return the Issue URL after creation.

## Step 11: Confirm

After creation, show:
- Issue number and URL
- Summary of what was created

---

**Guardrails**
- **No local files** — Do not create `.opencode/scratch/` or any intermediate files. All drafting happens in the conversation.
- **One section at a time** — Present each section (Background, Goal, etc.) for review before moving on. Don't batch them together unless the user asks.
- **Always show the draft before creating** — Never create an Issue without user review.
- **Adapt to the issue type** — Bug reports should emphasize reproduction. Perf Issues should emphasize metrics. Adjust the framing, not the template structure.
- **Ask, don't assume** — If the user's intent is ambiguous, ask clarifying questions rather than guessing.
- **No `openspec` CLI** — This skill has zero dependency on OpenSpec or any external CLI beyond `gh`.
