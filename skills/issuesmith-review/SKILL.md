---
name: issuesmith-review
description: 实现完成后创建 PR — 运行最终验证、逐项检查 AC、推送分支、自动填充 PR 模板、AI 代码 review，提交前确保一切通过
---

# IssueSmith Review & PR

## 概述

验证。检查。推送。创建 PR。Review。合并。

**证据先于声称。** 每一项验证都必须有可观察的命令输出。没有证据就没有"通过"。

**违反这些规则的字面含义，就是违反其精神。**

## 铁律

```
没有新鲜的验证证据不声称通过。
没有逐项检查 AC 不创建 PR。
没有 review 不合并。
```

跳过任何一步？退回去补上。

## 前置条件

本 skill 必须在实现完成后的 worktree 中执行。如果是 `/ism:implement` 完成后自动流到这里，校验已通过。如果是手动调用，先确认：

```bash
git worktree list
```

当前目录必须是 feature worktree（不是主 worktree），且分支已有提交。

## Review 流程

```
┌──────────────────────────────────────────────────┐
│              REVIEW & PR 流程                     │
├──────────────────────────────────────────────────┤
│                                                   │
│  最终验证 → AC 检查 → 清理检查 → 推送 → 创建 PR  │
│                                              │    │
│                                    ┌─ AI Review ◄─┤
│                                    │              │
│                                    合并 ←─────────┘
│                                                   │
└──────────────────────────────────────────────────┘
```

### 步骤 1：最终验证 — 证据说话

在声称"准备好 PR"之前，**自动检测项目的测试和 lint 命令**并运行：

**检测逻辑：**
1. 检查 `package.json` 的 `scripts.test` → `npm test`（或用 `yarn`/`pnpm`）
2. 检查 `package.json` 的 `scripts.lint` → `npm run lint`
3. 检查 `Makefile` 中的 `test` 和 `lint` target → `make test && make lint`
4. 检查 `pyproject.toml` / `setup.cfg` → `pytest` / `ruff check`
5. 检查 `Cargo.toml` → `cargo test && cargo clippy`
6. 检查 `go.mod` → `go test ./...`
7. 检查其他常见模式（`Gemfile`、`mix.exs`、`composer.json` 等）

运行检测到的命令。如果项目无可检测的测试命令，明确告知用户并跳过此步。

<Good>
```
$ npm test
34/34 tests pass
$ npm run lint
0 errors, 0 warnings
```
有输出证据，可以继续。
</Good>

<Bad>
```
"测试和 lint 应该都没问题，我们可以继续创建 PR 了。"
```
没有运行命令，没有输出证据。退回去运行。
</Bad>

**验证失败？** 回到 `/ism:implement` 修复。不要带着失败的验证创建 PR。

### 步骤 2：AC 逐项检查

读取 Issue 的 Acceptance Criteria，逐项核对：

```bash
gh issue view <N> --json title,body,labels
```

提取 AC 列表，逐项检查：

```
Acceptance Criteria 检查：

- [x] 用户可以在设置中切换明暗主题 → 已实现，ThemeToggle 组件集成
- [x] 主题偏好跨页面刷新保持 → 已实现，localStorage 持久化
- [x] 系统首次访问时遵循 prefers-color-scheme → 已实现，useEffect 检测
- [x] 所有现有页面在两种主题下正确渲染 → 手动验证通过
- [x] 焦点状态和对比度满足 WCAG AA → 手动验证通过

5/5 AC 全部满足。
```

**有 AC 未满足？** 回到 `/ism:implement` 补完。不要带着缺口创建 PR。

### 步骤 3：清理检查

逐项扫描：

- [ ] 是否有遗留的 `console.log`、`debugger`、注释掉的调试代码？
- [ ] 是否有硬编码的测试值、临时文件？
- [ ] 是否有本地 scratch 文件被误加入 staged？
- [ ] Commit 历史是否干净（无 "WIP"、"fix"、"tmp" 等草稿提交）？

```bash
# 检查待提交状态
git status

# 检查未跟踪文件
git ls-files --others --exclude-standard

# 查看提交历史
git log --oneline origin/main..HEAD
```

发现问题？清理后再继续。不要带着调试代码提交 PR。

### 步骤 4：确定 Issue 编号

从当前分支名推断 Issue 编号。如果分支由 `/ism:start` 创建，Issue 编号通常可从分支名或 worktree 上下文中得知。

如果无法自动推断，列出 open Issues 让用户选择：

```bash
gh issue list --state open --json number,title,labels --limit 20
```

### 步骤 5：推送分支

```bash
git push origin <branch-name>
```

如果远程已存在分支（之前推送过），使用 `git push origin <branch-name> --force-with-lease`（仅在确认无他人基于此分支工作时使用）。

### 步骤 6：生成 PR 描述

从 Issue 上下文自动填充 PR 模板。生成后展示给用户确认：

```
## 关联 Issue
Closes #<N>

## 做了什么
（从 Task Checklist 的已完成项自动生成）

- 添加 ThemeContext，支持明暗主题切换
- 实现 localStorage 主题偏好持久化
- 添加 ThemeToggle 组件
- 编写 ThemeContext 单元测试
- 编写 ThemeToggle 交互测试

## 为什么这样做
（从 Issue 的 Notes/Decisions 提取，或根据实现过程补充）

- 选择 CSS 自定义属性而非 CSS-in-JS：零运行时开销，符合现有项目架构
- 主题切换使用 React Context：全局状态需求，无需引入额外状态管理库

## 如何验证

- [x] 运行测试通过（<自动填写检测到的测试命令及其输出摘要，如: pytest 42 passed>）
- [x] 手动验证如下场景：
  - 点击主题切换按钮，页面在明暗之间切换
  - 刷新页面，主题偏好保持
  - 首次访问时跟随系统主题设置
  - 所有组件在两种主题下样式正确

## Breaking Changes
无

## Docs / ADR 更新

- [x] docs/README.md — 添加主题切换功能说明
- [ ] docs/adr/ — 不需要（纯前端主题切换是标准做法）
```

**展示完整 PR 描述，等待用户确认后再创建。**

### 步骤 7：创建 PR

用户确认后：

```bash
gh pr create \
  --title "<PR 标题>" \
  --body "<PR 正文>" \
  --base main
```

PR 标题从 Issue 标题衍生（去掉类型前缀，如 `[Feature]: 添加暗色模式` → `添加暗色模式`）。

创建成功后展示 PR URL。

### 步骤 8：AI Code Review

创建 PR 后，建议做一次 AI code review：

```
请 review 当前 PR 的变更，关注：
1. 是否满足 Issue #N 的 Acceptance Criteria
2. 是否有潜在的 bug 或安全问题
3. 代码风格是否与项目一致
4. 是否有遗漏的边界情况
5. 测试覆盖是否充分
```

Review 发现的问题分三级：
- **Critical** — 必须修复再合并（AC 缺失、安全漏洞、破坏性 bug）
- **Important** — 应该修复（边界情况遗漏、风格不一致）
- **Minor** — 可选修复（命名建议、注释优化）

收到 review 后先讨论，再决定是否修改。修改后重新推送。

### 步骤 9：合并

Review 通过后合并：

```bash
gh pr merge --squash
```

合并后提示清理 worktree：

```
PR #N 已合并。是否清理 worktree？

  cd <主仓库目录>
  git worktree remove ../<repo>-<feature>
  git branch -d <branch>
```

## 常见自我合理化

| 借口 | 真相 |
|------|------|
| "测试之前跑过了" | 不是新鲜证据。在创建 PR 之前重新跑。 |
| "AC 我都记得，不用查" | 记忆不是证据。逐项检查。 |
| "那个 console.log 只是调试用的" | 不应该出现在 PR 里。删掉。 |
| "WIP commit 历史无所谓，squash merge 会合并" | 即使 squash，也要对自己的分支保持整洁。 |
| "应该没问题" | 运行验证。"应该" ≠ "确实"。 |
| "先创建 PR，review 时再验证" | 带着未验证的代码创建 PR 是不负责任的。先验证。 |
| "不用 AI review，我自己看过了" | 第二双眼睛总能看出你没看到的。AI review 是免费的。 |
| "CI 会帮我检查的" | CI 是最后一道防线，不是你跳过的理由。在推送之前跑本地验证。 |

## 红灯 — 停止并纠正

- 没跑全量测试就声称"准备好了"
- 没逐项检查 AC 就创建 PR
- PR 正文里仍有 `<!-- 填写 Issue 编号 -->` 等未替换占位符
- 提交历史里有 "WIP"、"tmp"、"debug" 等草稿提交
- Staged 文件里有临时文件或调试代码
- 测试或 lint 失败但继续创建 PR
- 有 AC 未满足但声称"全部满足"
- 跳过 AI review 直接合并

**出现任何一条：停下来，纠正，再继续。**

## PR 提交前验证清单

- [ ] 全量测试通过（新鲜运行，读取输出）
- [ ] Linter 无报错（新鲜运行，读取输出）
- [ ] AC 逐项核对，全部满足
- [ ] 无遗留调试代码或临时文件
- [ ] 无本地 scratch 文件被提交
- [ ] Commit 历史干净，无草稿提交
- [ ] PR 描述完整（做了什么、为什么、如何验证）
- [ ] 用户已确认 PR 描述

不能全打勾？不要创建 PR。

## 与其他指令的关系

本 skill 是 IssueSmith 流程的第四步，通常在 `/ism:implement` 全部任务完成后自动进入：
- **`/ism:implement`** — 完成后自动引导到此 skill
- **`/ism:start`** — 创建此 worktree 的指令
- **`/ism:create`** — 创建此 PR 关联的 Issue

## 底线

**先验证再创建 PR。先 review 再合并。证据不在心里，在终端输出里。**

这些不可协商。
