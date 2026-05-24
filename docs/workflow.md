# IssueSmith 完整开发流程

本文档描述从想法到合并的完整开发闭环。每一步都包含实际命令示例。

## 流程总览

```
idea → issue → worktree/branch → implementation → review → PR/merge → docs/ADR update
```

## 第 1 步：捕获想法

用自然语言描述你的想法、bug、需求或重构目标。

**关键原则**：想法应先转化为 Issue，而不是直接进入代码实现。

你可以先在自己的笔记、聊天记录或本地 scratch 文件中记录碎片想法。但一旦决定执行，就应创建一个 Issue。

## 第 2 步：创建 Issue

### 推荐方式：使用内置指令

- **`/ism:explore`** — 思考伙伴模式，探索问题空间、检查已有 Issues、对比方案。不写代码，不创建 Issue。
- **`/ism:create`** — 从想法生成完整 Issue。逐节引导（Background → Goal → Non-goals → AC → Tasks → Notes），支持 review 和修改，确认后通过 `gh issue create` 发布。


Issue 必须包含以下部分：

| 部分 | 说明 |
|------|------|
| **Background** | 为什么要做这件事 |
| **Goal** | 要达成什么目标 |
| **Non-goals** | 明确不做什么，控制范围 |
| **Acceptance Criteria** | 如何判断完成，可验证条件 |
| **Task Checklist** | 可执行的任务列表 |
| **Notes / Decisions** | 讨论中形成的重要取舍 |

**示例**（参考 [Issue #1](https://github.com/membphis/issuesmith/issues/1)）：

```
Background: AI 编程工具效率高，但个人开发流程中需求散落、历史难以复用。
Goal: 建立一套轻量个人 AI 开发流程。
Non-goals: 不替代 OpenSpec、不提供大型团队审批流。
Acceptance Criteria: 仓库能清楚说明定位、新用户能根据 README 创建任务。
Task Checklist:
  - [ ] 1. 创建 README
  - [ ] 2. 创建 Issue 模板
  - [ ] 3. 创建 PR 模板
...
```

创建 Issue 后，将想法、讨论和取舍记录在 Issue 的评论区和 Notes 字段中，而不是本地文件。

## 第 3 步：启动开发

### 推荐方式：使用内置指令

- **`/ism:start <N>`** — 基于 Issue #N 自动创建 worktree：读取 Issue → 推导分支名 → 确认 → 创建 → 安装依赖。
- **`/ism:start`** — 不带参数时，列出最近 open Issues 供你选择。

### 手动方式：创建隔离工作区

如果需要手动控制参数，可以自行创建 worktree/branch：

```bash
# 假设你的 Issue 是 #3，feature 名为 my-feature
git fetch origin
git worktree add -b feat/my-feature ../repo-my-feature main
```

进入新的 worktree 目录开始开发：

```bash
cd ../repo-my-feature
```

### 检查前置条件

1. 确保 AI 编程工具可以读取 Issue 内容。
2. 确保根目录 `AGENTS.md` 已配置，AI 工具将自动遵守 IssueSmith 流程。
3. 确保项目测试和环境已就绪。

## 第 4 步：执行开发

### 推荐方式：使用内置指令

- **`/ism:implement <N>`** — 读取 Issue #N，按 Task Checklist 逐项实现。自动拆小步、写测试、做实现、跑验证，每完成一项同步勾选 Issue。
- **`/ism:implement`** — 不带参数时，列出 open Issues 供你选择。

### 手动方式：逐项实现

如果需要更细粒度的控制，可以手动让 AI 按以下纪律执行：

1. **先理解 Issue** — 确保对 Background、Goal 和 AC 有清晰认识。
2. **先写测试** — 对于新功能或 bug fix，先写测试用例。
3. **小步提交** — 每完成一个小的可验证单元后提交。
4. **运行验证** — 实现后执行测试和 lint 命令。

```bash
# 常见验证命令示例（根据项目配置调整）
npm test
npm run lint
pytest
```

### 4.4 开发期间的 Issue 管理

- 如果遇到需要澄清的问题，在 Issue 评论区讨论，并将结论更新到 Notes / Decisions。
- 如果发现 scope 需要调整，更新 Issue 的 Non-goals 或 Acceptance Criteria（非必要时不随意扩大 scope）。
- Task Checklist 是动态的：开发中可能发现新任务或调整已有任务的顺序。

## 第 5 步：Review 和 PR

### 推荐方式：使用内置指令

- **`/ism:finish`** — 最终验证 → 逐项检查 AC → 清理检查 → 推送 → 自动填充 PR 模板 → CI 等待 → AI review → 合并。`/ism:implement` 全部任务完成后会自动引导进入此步骤。

### 手动方式：逐项执行

如果需要更细粒度的控制，可以手动按以下步骤执行：

### 5.1 自检

合并前逐项自检：

- [ ] Issue 的 Acceptance Criteria 是否全部满足？
- [ ] 是否有遗留的断点、调试代码或临时文件？
- [ ] 测试是否全部通过？
- [ ] Lint 是否无报错？
- [ ] 是否无意中提交了本地 scratch 文件？

### 5.2 创建 PR

1. 将当前 worktree 的变更推送到远程：

```bash
git push origin feat/my-feature
```

2. 在 GitHub 上创建 Pull Request，使用 `.github/pull_request_template.md` 模板。
3. PR 中必须包含：
   - 关联 Issue（`Closes #N`）
   - 做了什么
   - 为什么这样做
   - 如何验证
   - 是否有 breaking changes
   - 是否更新了 docs/ADR

### 5.3 AI Review

建议在合并前让 AI 工具做一次 code review：

```
请 review 当前 PR 的变更，关注：
1. 是否满足 Issue #N 的 Acceptance Criteria
2. 是否有潜在的 bug 或安全问题
3. 代码风格是否与项目一致
4. 是否有遗漏的边界情况
```

### 5.4 合并

确认 review 通过后合并 PR：

```bash
gh pr merge --squash
```

## 第 6 步：合并后沉淀

合并后只提交长期有价值的内容。根据变更的性质决定：

### 需要更新的内容

| 变更类型 | 需要更新的内容 |
|----------|---------------|
| 新功能 | 更新 README 或 `docs/` 下的相关文档 |
| API 变更 | 更新 API 文档、可能添加 migration 说明 |
| 架构变更 | 更新架构文档、创建 ADR |
| 配置变更 | 更新配置文档或示例 |
| 废弃功能 | 在文档中标记为 deprecated、可能需要创建 ADR |

### 不需要提交的内容

- 本地开发 plan。
- AI 中间推理草稿。
- 一次性的任务拆解笔记。
- 临时的 debug 配置。

### 清理 Worktree

合并 PR 后，清理不再需要的 worktree：

```bash
# 删除 worktree
git worktree remove ../repo-my-feature

# 如果 feature branch 已完成且已合并到 main
git branch -d feat/my-feature
```

## 快速参考

### 常用命令

```bash
# 创建 Issue（使用 /ism:explore 和 /ism:create 指令）

# 启动开发（使用 /ism:start <N> 指令）

# 执行开发（使用 /ism:implement 指令）

# Review 和 PR（使用 /ism:finish 指令）

# 手动创建 worktree
git fetch origin
git worktree add -b feat/<name> ../<repo>-<name> main

# 列出所有 worktree
git worktree list

# 进入 worktree
cd ../<repo>-<name>

# 开发完成后推送
git push origin feat/<name>

# 创建 PR
gh pr create --template .github/pull_request_template.md

# 合并 PR
gh pr merge --squash

# 清理 worktree
git worktree remove ../<repo>-<name>
git branch -d feat/<name>
```

### 相关文档

- **项目总纲**: [Issue #1 — Define IssueSmith](https://github.com/membphis/issuesmith/issues/1)
- **Worktree 指南**: `docs/worktree-guide.md`
- **ADR 策略**: `docs/adr-policy.md`
- **AI 项目规则**: `AGENTS.md`
- **README**: `README.md`
