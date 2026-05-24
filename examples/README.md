# IssueSmith 端到端示例

本文档通过一个具体场景，完整展示如何用 IssueSmith 工作流完成一次 idea → PR → 合并的闭环。

> 示例为操作流演示（只展示输入步骤和命令），不包含命令的实际输出。

## 场景

你正在开发一个名为 `todo-app` 的个人项目。最近用户反馈希望在任务列表中快速查找任务。你决定添加**搜索功能**：在列表上方加一个搜索框，输入关键词即时过滤任务。

## 第 1 步：创建 Issue

使用 `/ism:create` 指令创建 Issue，逐节引导填写。

---

### Issue 内容

**Title:** [Feature]: 添加任务搜索功能

**Background:**

当前 todo-app 只能按默认顺序浏览任务。当任务数量超过 20 条时，用户需要手动上下滚动来定位特定任务，体验较差。搜索功能是最直接的解决方案，也是用户多次反馈的需求。

**Goal:**

在任务列表页面上方添加搜索框，支持按任务标题实时过滤。用户在搜索框中输入关键词，列表实时更新只显示匹配的任务。

**Non-goals:**

- 不支持按标签、日期或其他字段搜索（本次只支持标题）
- 不支持全文搜索或模糊匹配
- 不添加搜索历史或建议功能
- 不改动后端 API（纯客户端过滤）

**Acceptance Criteria:**

- [ ] 任务列表上方显示搜索框
- [ ] 输入关键词后列表实时过滤只显示标题匹配的任务（大小写不敏感）
- [ ] 清空搜索框后恢复显示全部任务
- [ ] 搜索无结果时显示"没有找到匹配的任务"提示
- [ ] 搜索过滤与其他视图（已完成/未完成筛选）互不干扰
- [ ] 单元测试覆盖搜索过滤逻辑

**Task Checklist:**

- [ ] 1. 在 `src/components/TaskList.tsx` 中添加搜索框 UI 组件
- [ ] 2. 实现搜索过滤逻辑（`filterTasks` 函数，大小写不敏感）
- [ ] 3. 添加搜索无结果的空状态提示
- [ ] 4. 确保搜索过滤与已完成/未完成筛选兼容
- [ ] 5. 编写 `filterTasks` 单元测试
- [ ] 6. 编写 TaskList 搜索交互集成测试
- [ ] 7. 手动验证各 AC 场景
- [ ] 8. 运行 `npm test && npm run lint`

**Notes / Decisions:**

- 搜索方式选择实时过滤而非按回车触发：减少交互步数，适合列表当前规模
- 如果任务数量增长到 500+，后续可考虑添加防抖（debounce）或迁移到后端搜索

---

## 第 2 步：启动开发

使用 `/ism:start 42` 指令一键创建 worktree。AI 会自动读取 Issue #42，推导分支名和 worktree 路径，确认后创建并安装依赖：

```bash
/ism:start 42
```

你也可以手动创建 worktree：

```bash
# 确保主仓库是最新的
cd ~/projects/todo-app
git fetch origin
git checkout main
git pull origin main

# 基于 main 创建新的 feature worktree
git worktree add -b feat/task-search .ism/search main

# 进入 worktree 开始开发
cd .ism/search

# 安装依赖（如果项目需要）
npm install
```

此时你的主仓库 `~/projects/todo-app` 仍在 main 分支上，可以随时处理其他任务。开发工作在 `.ism/search` 中进行。

> 如需同时开发另一个 Issue，可以再创建一个 worktree：
> ```bash
> git worktree add -b feat/another-feature .ism/another main
> ```

## 第 3 步：执行开发

### 推荐方式：使用 `/ism:implement`

直接使用内置指令，AI 自动读取 Issue、拆解任务、按纪律逐项实现：

```
/ism:implement
```

AI 会进入实现模式：前置校验 worktree → 定位第一个未勾选的 task → 拆解为小步 → 测试先行 → 逐步实现 → 验证 → 提交 → 更新 Issue checklist。

### 手动方式：拆解任务并逐项实现

如果需要更细粒度的控制，可以手动让 AI 读取 Issue 并拆解：

```
请阅读 Issue #42，按 Task Checklist 逐项实现。
```

本地拆解应进一步细化每一步为可独立提交的小单元：

```
Task 1: 添加搜索框 UI
  - 1.1 在 TaskList 组件中引入 SearchInput 子组件
  - 1.2 添加 searchQuery state
  - 1.3 处理 onChange 事件绑定

Task 2: 实现过滤逻辑
  - 2.1 编写 filterTasks 纯函数（标题 contains + 大小写不敏感）
  - 2.2 在 TaskList 中集成 filterTasks
  - 2.3 处理空搜索框时的全部显示逻辑

Task 3: 空状态提示
  - 3.1 添加 EmptyState 组件（"没有找到匹配的任务"）
  - 3.2 条件渲染：无结果 → 显示 EmptyState

Task 4: 筛选兼容
  - 4.1 将 searchQuery 和 statusFilter 组合为链式过滤
  - 4.2 确保修改 statusFilter 时搜索内容保持

Task 5: 测试
  - 5.1 编写 filterTasks 单元测试（空字符串、精确匹配、部分匹配、大小写混合）
  - 5.2 编写 TaskList 集成测试（输入搜索、清空搜索、无结果状态）
```

### 3.2 核心行为：先写测试

按照 IssueSmith 开发纪律，先编写测试：

```ts
// src/utils/__tests__/filterTasks.test.ts
import { filterTasks } from '../filterTasks';

const tasks = [
  { id: 1, title: '买牛奶', completed: false },
  { id: 2, title: '写周报', completed: true },
  { id: 3, title: 'Code Review PR #41', completed: false },
];

test('空搜索返回全部任务', () => {
  expect(filterTasks(tasks, '')).toHaveLength(3);
});

test('精确匹配标题', () => {
  expect(filterTasks(tasks, '买牛奶')).toHaveLength(1);
});

test('部分匹配标题', () => {
  expect(filterTasks(tasks, '牛奶')).toHaveLength(1);
});

test('大小写不敏感匹配', () => {
  expect(filterTasks(tasks, 'code review')).toHaveLength(1);
});

test('无匹配返回空数组', () => {
  expect(filterTasks(tasks, '不存在')).toHaveLength(0);
});
```

### 3.3 实现功能

按拆解步骤实现。每完成一个小步骤后提交：

```bash
git add src/utils/filterTasks.ts src/utils/__tests__/filterTasks.test.ts
git commit -m "feat: add filterTasks utility with case-insensitive search"
```

### 3.4 边开发边更新 Issue

在实现过程中，如果发现 scope 需要调整，更新 Issue。例如：实现搜索框时发现需要添加 debounce（300ms），在 Issue 评论区记录这个决策，并将决定更新到 Notes / Decisions。

完成后在 Issue 的 Task Checklist 中勾选已完成项。

### 3.5 运行验证

```bash
npm test       # 确保所有测试通过
npm run lint   # 确保代码风格无报错
```

## 第 4 步：收尾

### 推荐方式：使用 `/ism:finish`

`/ism:implement 42` 全部完成后会自动引导进入此步骤。也可以手动执行：

```
/ism:finish
```

AI 会执行：最终验证 → 逐项核对 AC → 清理检查 → 推送 → 创建 PR → 提交后自检（利用 CI 等待期做验证 + code review）→ CI 通过 → 由你选择合并方式。

### 手动方式：创建 PR

```bash
git push origin feat/task-search
```

### 4.2 填写 PR 描述

按照 `.github/pull_request_template.md` 模板填写（模板可从本项目的 `.github/pull_request_template.md` 复制）。以下是完整填写示例：

---

**## 关联 Issue**

Closes #42

**## 做了什么**

- 在 TaskList 组件中添加搜索框 UI
- 实现 `filterTasks` 工具函数，支持按标题实时过滤（大小写不敏感）
- 添加搜索无结果时的空状态提示
- 确保搜索过滤与已完成/未完成筛选互不干扰
- 编写 `filterTasks` 单元测试和 TaskList 集成测试

**## 为什么这样做**

- **选择实时过滤而非回车触发搜索**：当前 todo-app 的任务列表规模较小（< 100 条），实时过滤比 enter-to-search 更流畅，减少一次交互。如果后续任务数增长到 500+，可以引入 debounce。
- **纯客户端过滤**：不需要后端改动，实现简单且满足当前需求。后端搜索留给后续 issue。
- **搜索范围限定标题**：控制 scope，先解决最高优的用户反馈。标签/日期搜索可在后续迭代中补充。

**## 如何验证**

- [x] 运行测试通过（`npm test`）
- [x] 手动验证如下场景：
  - 在搜索框输入"牛奶"，列表只显示"买牛奶"
  - 输入"CODE review"，显示"Code Review PR #41"（大小写不敏感）
  - 清空搜索框，列表恢复显示全部任务
  - 切换到"已完成"筛选，搜索"周报"，仍显示"写周报"
  - 输入"xyz"，显示"没有找到匹配的任务"

**## Breaking Changes**

无

**## Docs / ADR 更新**

- [x] docs/README.md — 更新功能列表，添加搜索功能说明
- [ ] docs/adr/ — 不需要：纯前端过滤是当前规模下显而易见的方案

**## Review Checklist**

- [x] Acceptance Criteria 全部满足
- [x] 代码符合项目现有风格
- [x] 核心变更包含测试
- [x] 没有遗留调试代码或临时 hack

---

### 4.3 AI Review

在创建 PR 后，建议让 AI 工具做一次 review：

```
请 review 当前 PR 的变更，关注：
1. 是否满足 Issue #42 的 Acceptance Criteria
2. 是否有潜在的 bug 或安全问题（如 XSS 在搜索框注入）
3. 代码风格是否与项目一致
4. 是否有遗漏的边界情况（空任务列表、特殊字符搜索等）
```

### 4.4 合并

确认 review 通过后合并：

```bash
gh pr merge --squash
```

## 合并后

合并后，根据变更的性质决定需要更新和清理的内容。文档更新和 ADR 决策应在实现阶段完成（`/ism:implement` 已强制执行）。

### 判断是否需要 ADR

参考 `docs/adr-policy.md` 的决策规则：

| 检查项 | 本变更的情况 | 需要 ADR？ |
|--------|-------------|-----------|
| 重要技术选型？ | 否。纯前端过滤，无新依赖。 | 否 |
| 架构模式变更？ | 否。在现有组件中添加子组件。 | 否 |
| 引入或替换核心依赖？ | 否。 | 否 |
| 非显而易见的方案？ | 否。实时过滤 + 标题匹配是常见做法。 | 否 |
| 标记废弃或移除功能？ | 否。 | 否 |

**结论：不需要创建 ADR。** 实时过滤是当前规模下显而易见的方案。如果将来迁移到后端搜索或引入 Elasticsearch，届时再创建 ADR。

### 5.2 更新当前事实文档

功能性变更需要更新 `README.md` 或相关文档，让项目文档始终反映现状：

```
git checkout main
git pull origin main

# 在 README 功能列表中追加搜索功能
# 示例：在 README 的 "功能" 部分添加：
# - [x] 任务搜索（按标题实时过滤）
```

### 5.3 清理 Worktree

```bash
# 回到主仓库目录
cd ~/projects/todo-app

# 删除 worktree
git worktree remove .ism/search

# 删除已合并的 feature 分支
git branch -d feat/task-search
```

## 完整命令速查

以下是本示例中使用的全部命令，可按顺序复制执行：

```bash
# === 第 1 步：创建 Issue ===
/ism:create

# === 第 2 步：启动开发 ===
/ism:start 42
cd .ism/search

# === 第 3 步：开发 ===
/ism:implement
cd .ism/search

# 提交变更
git add src/utils/filterTasks.ts src/utils/__tests__/filterTasks.test.ts
git commit -m "feat: add filterTasks utility with case-insensitive search"

# 验证
npm test
npm run lint

# === 第 4 步：收尾 ===
/ism:finish

# === 合并后清理 ===
cd ~/projects/todo-app
git worktree remove .ism/search
git branch -d feat/task-search
```

## 场景对比：如果变更涉及架构决策

上述搜索示例是典型的**无需 ADR** 的场景。下面是一个对比示例，展示**需要 ADR** 的情况：

> 场景：你决定将 todo-app 从 LocalStorage 迁移到 SQLite，以支持多设备同步和更复杂的查询。

在这种情况下，合并后**应该**创建 ADR：

```markdown
# ADR-0001: Use SQLite for local storage

## Status
Accepted

## Date
2025-06-15

## Background

todo-app 当前使用 LocalStorage 存储所有任务数据。随着功能增长（标签、搜索、同步），出现两个问题：
1. LocalStorage 容量限制（5-10MB），不支持复杂查询。
2. 无法跨设备同步数据。

## Decision

使用 SQLite（通过 better-sqlite3）作为本地存储引擎。

## 考虑的方案

### 方案 A: SQLite

- 优点：支持复杂 SQL 查询、容量无硬限制、生态成熟。
- 缺点：增加 native module 依赖、增加打包体积。

### 方案 B: IndexedDB

- 优点：纯浏览器 API、无额外依赖。
- 缺点：异步 API 复杂、查询能力弱于 SQLite、生态工具少。

## 影响

- [x] 需要更新 `docs/architecture.md` 中的存储层说明
- [x] 需要编写数据迁移脚本（LocalStorage → SQLite）
- [ ] 对下游消费者无影响（纯客户端应用）
- [x] 包含 breaking change：旧版本 LocalStorage 数据需要迁移

## 参与讨论

- @developer
```

## 相关文档

- [IssueSmith 项目总纲 (Issue #1)](https://github.com/membphis/issuesmith/issues/1)
- `../README.md` — 项目入口和快速开始
- `../docs/workflow.md` — 完整开发流程
- `../docs/worktree-guide.md` — Worktree 使用指南
- `../docs/adr-policy.md` — ADR 策略
- `../templates/AGENTS.md` — AI 项目规则模板
