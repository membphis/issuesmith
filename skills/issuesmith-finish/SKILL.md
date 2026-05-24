---
name: issuesmith-finish
description: 实现完成后收尾开发分支 — 最终验证、创建 PR、自检 review、等待 CI、处理第三方 review、合并、清理 worktree
---

# IssueSmith 收尾 — 完成开发分支

## 概述

验证。检查。推送。创建 PR。Review。合并。

**证据先于声称。** 每一项验证都必须有可观察的命令输出。没有证据就没有"通过"。

**违反这些规则的字面含义，就是违反其精神。**

## 铁律

```
没有新鲜的验证证据不声称通过。
没有逐项检查 AC 不创建 PR。
CI 不通过不合并。
Review 意见不逐条处理不合并。
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
┌──────────────────────────────────────────────────────────────────┐
│                    FINISH 流程                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  最终验证 → AC 检查 → 清理检查 → 推送 → 创建 PR                  │
│                                                │                  │
│                              ┌─────────────────┘                  │
│                              ▼                                    │
│                    提交后自检 (verification + code review)         │
│                         CI 并行期                                 │
│                              │                                    │
│                              ▼                                    │
│                         等待 CI 通过                              │
│                              │                                    │
│                              ▼                                    │
│                      处理第三方 Review                            │
│                              │                                    │
│                              ▼                                    │
│                            合并                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
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

### 步骤 8：提交后自检 — 利用 CI 等待期

PR 创建后 CI 通常需要时间运行。**不要在等待时闲置**，利用这段时间做质量检查，把问题发现和修复提前到 CI 期间。

**核心原则：CI 是验证，不是检查。** 能在本地发现的问题，不要等到 CI 报了才知道。

#### 8.1 最终质量验证

对当前 worktree 的变更再做一次完整的证据级验证。这对应 superpowers 的 `verification-before-completion` skill —— 证据先于声称。

```bash
# 证据 1：全量测试
<项目测试命令>  # 如: npm test、pytest、cargo test

# 证据 2：代码风格检查
<项目 lint 命令>  # 如: npm run lint、ruff check、cargo clippy
```

**MANDATORY:** 读取命令输出、确认退出码、统计失败数。不准用"之前跑过了"替代。证据必须是新鲜的。

#### 8.2 AI 自检 Review

质量验证通过后，对整个 PR 做一次 AI 自检 review。这对应 superpowers 的 `requesting-code-review` skill —— 在做外部 review 之前先自己检查一遍。

```
请 review 当前分支的变更（对比 origin/main），关注：
1. 是否满足 Issue #N 的所有 Acceptance Criteria
2. 是否有潜在的 bug 或安全问题
3. 代码风格是否与项目一致
4. 是否有遗漏的边界情况
5. 测试覆盖是否充分
6. 是否有遗留的调试代码、console.log、注释掉的代码
```

Review 发现的问题分三级：
- **Critical** — 必须立即修复（AC 缺失、安全漏洞、破坏性 bug）
- **Important** — 应在 CI 期间修复（边界情况遗漏、风格不一致、测试不足）
- **Minor** — 可选修复（命名建议、注释优化、轻微重构）

**找到 Critical 或 Important 问题？** 立即在当前 worktree 中修复、提交、推送。然后：
1. 重新运行本地验证
2. 继续等待 CI 结果
3. CI 会因为你推送了新代码而自动重跑

<Good>
```
AI Review 发现 1 个 Critical 问题：
  错误处理函数在 API 返回 500 时直接崩溃

CI 还在跑（约 2 分钟）。趁这个时间修复并推送。
  → 修复: 添加 try-catch 和空值检查
  → 验证: npm test (所有测试通过)
  → 推送: git push origin feat/my-feature
  → CI 已自动重新开始
```
问题在 CI 期间就被发现和修复。高效。
</Good>

<Bad>
```
AI Review 发现了几个问题，但先等 CI 跑完再说。
```
CI 是无辜的等待者，不是你推迟检查的借口。等 CI 跑完再修复 = 推迟发现问题 = CI 需要重跑 = 浪费时间。
</Bad>

**全部通过后开始等待 CI 完成。**

### 步骤 9：CI 校验 — 必须等待通过

CI 是外部验证的关键防线。**必须等到 CI 全部通过才能继续。**

```bash
gh pr checks <PR 编号>
```

**MANDATORY:** 在 CI 全部通过之前，不执行合并。

<Good>
```
$ gh pr checks 42
build (ubuntu-latest)    pass  1m23s
test (ubuntu-latest)     pass  2m05s
lint                     pass  0m45s
```
所有 CI 检查通过。继续。
</Good>

<Bad>
```
"CI 应该能过，我们先继续后面的步骤吧。"
```
没有确认 CI 结果就继续。等待 CI，否则 bug 会被带入合并。
</Bad>

**CI 失败？** 修复代码后重新推送，然后重新等待 CI 通过。不要跳过。

### 步骤 10：处理第三方 Review 意见

如果 PR 收到了来自他人（同事、维护者、社区）的 review comment，**不盲从、不忽视，逐条判断再行动**。

**对每条 review comment 执行以下流程：**

```
读 → 理解 → 验证 → 判断 → 回复 → 行动
```

#### 10.1 分类判断

| 类别 | 判断标准 | 行动 |
|------|---------|------|
| **合理且必须修复** | 指出真实 bug、安全漏洞、AC 遗漏 | 立即修复。修复后回复"已修复"。 |
| **合理但可商榷** | 技术方案有不同看法，但对方观点有道理 | 优先采纳。如果有更好的理由不采纳，解释清楚再决定。 |
| **主观风格偏好** | 与项目现有风格一致，只是个人偏好不同 | 以项目现有风格为准。如果风格没有统一惯例，采纳 review 意见（权威性优先）。 |
| **基于误解** | 评论者没理解设计意图或 Issue 要求 | 回复解释设计原因，引用 Issue 相关部分。不修改代码。 |
| **明显错误** | 建议会导致问题或违反 Issue Non-goals | 礼貌回复说明为什么不采纳，给出事实依据。不修改代码。 |

#### 10.2 回复规范

<Good>
```
// 合理且必须修复
"你说得对，这里的空指针确实没有防护。已在 3f2a1b8 中添加了 null check 和对应测试。感谢指出。"

// 基于误解
"这个函数用的是惰性初始化模式，在调用 getThing() 之前实例不会创建。
参见 Issue #N 的 Notes/Decisions 部分对这个模式选择的说明。"

// 明显错误
"换成 Map 确实会更快，但 Issue #N 的 Non-goals 明确写了'不改变当前存储结构'。
这个建议可以记录到后续优化的 Issue 中。"
```
有理有据，不卑不亢。每条回复都引用事实或 Issue。
</Good>

<Bad>
```
"你说得对！我马上改。"（没有理解为什么改）
"这不是问题，忽略。"（没有解释原因）
"好的。"（敷衍，不判断合理性）
```
盲从、忽视、敷衍都不行。逐条分析，逐一回复。
</Bad>

#### 10.3 修复后

修改代码解决 review 意见后：
1. 重新运行本地验证（测试 + lint）
2. 推送到 PR 分支：`git push origin <branch>`
3. **重新等待 CI 通过**（回到步骤 9）
4. 在 GitHub 上回复 "已在 commit <sha> 中修复"

### 步骤 11：合并

所有条件满足后才能合并：

- [ ] 本地全量测试通过
- [ ] CI 全部通过
- [ ] 提交后自检验证通过（证据级验证 + AI code review）
- [ ] AI self-review 无 Critical/Important 遗留
- [ ] 第三方 review 意见已全部处理（修复或回复）
- [ ] AC 全部满足

全部确认后合并：

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
| "CI 跑着呢，等它跑完再说" | 别干等。利用 CI 时间做自检和 AI review。CI 跑完才发现问题 = 浪费时间。 |
| "CI 应该能过，不用等" | 不等 CI 就合并 = 盲合。等待是必须的。 |
| "那个 review 意见不重要" | 不重要的意见也要回复。逐条处理意味着逐条回复。 |
| "review 说得对，全改" | 逐条判断合理性。盲从跟忽视一样糟糕。 |

## 红灯 — 停止并纠正

- 没跑全量测试就声称"准备好了"
- 没逐项检查 AC 就创建 PR
- PR 正文里仍有 `<!-- 填写 Issue 编号 -->` 等未替换占位符
- 提交历史里有 "WIP"、"tmp"、"debug" 等草稿提交
- Staged 文件里有临时文件或调试代码
- 测试或 lint 失败但继续创建 PR
- 有 AC 未满足但声称"全部满足"
- 跳过 AI review 直接合并
- CI 未全部通过就合并
- Review 意见未逐条回复就合并
- 盲从 review 意见，未判断合理性

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
- [ ] CI 全部通过（gh pr checks）
- [ ] AI self-review 无 Critical/Important 遗留
- [ ] 第三方 review 意见已全部处理（修复或回复）

不能全打勾？不要创建 PR。

## 与其他指令的关系

本 skill 是 IssueSmith 流程的第四步，通常在 `/ism:implement` 全部任务完成后自动进入：
- **`/ism:implement`** — 完成后自动引导到此 skill
- **`/ism:start`** — 创建此 worktree 的指令
- **`/ism:create`** — 创建此 PR 关联的 Issue

## 底线

**先验证再创建 PR。先 review 再合并。证据不在心里，在终端输出里。**

这些不可协商。
