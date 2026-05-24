# AI 项目规则（IssueSmith 工作流）

> 将此文件复制为项目根目录的 `AGENTS.md`（或 `CLAUDE.md` / `GEMINI.md`），AI 编程工具将自动读取并遵守以下流程。

## 核心原则

你是本项目的 AI 开发助手。请严格遵守以下 IssueSmith 工作流，确保每次开发都有清晰的上下文、可追溯的决策和高质量的交付。

## 信息分层规则

本项目的所有信息按以下四层存放和管理，你必须始终清楚每一层的定位：

| 层级 | 位置 | 生命周期 | 说明 |
|------|------|----------|------|
| **Issue / PR** | GitHub | 持久化 | 变更上下文和讨论记录，是需求的唯一真相来源 |
| **Repo docs** | `docs/` | 持续维护 | 当前事实文档和关键决策：README、架构说明、ADR 等 |
| **Tests** | 仓库 | 持续维护 | 可执行行为约束，确保代码正确性 |
| **Local scratch** | 本地 | 临时 | 开发 plan、任务拆解、AI 中间推理，**不入库** |

关键规则：
- **永远不要将本地 plan 或中间推理提交到仓库。**
- **当需要记录技术决策时，参考 `docs/adr-policy.md` 判断是否应创建 ADR。**

## IssueSmith 工作流

每个非琐碎的开发任务必须严格按照以下流程执行：

### 1. 读取 Issue

- 任务开始时，必须先完整读取对应的 GitHub Issue。
- 理解 Background、Goal、Non-goals、Acceptance Criteria 和 Task Checklist。
- 如果还有不明确的地方，**先提出问题，不要猜测**。

### 2. 拆解任务

- 将 Issue 中的 Task Checklist 进一步拆解为可执行的小步骤。
- 每个步骤应足够小，能在一次对话中完成。
- 本地 plan 可以写下来帮助思考，但**不要提交到仓库**。

### 3. 创建 Worktree / Branch

- 每个实现任务使用独立分支或 worktree：
  ```bash
  git worktree add -b feat/<short-name> ../<repo>-<short-name> main
  ```
- Worktree 确保开发隔离，不影响主工作区。
- 详细命令和常见场景参考 `docs/worktree-guide.md`。

### 4. 实现

执行实现时遵守以下纪律：

- **先理解 Issue**：不要跳过 Issue 直接改代码。
- **按 checklist 拆小步**：每完成一步，更新 Issue 或本地 checklist。
- **核心行为优先写测试**：对于新功能或 bug fix，先写测试再写实现。
- **实现后运行验证**：执行项目中的测试命令和 lint 命令，确保通过。
- **边开发边更新 Issue**：完成后勾选对应的 checklist 项。

### 5. 验证

合并前必须完成以下验证：

- 运行完整测试套件。
- 对照 Issue 的 Acceptance Criteria 逐项检查。
- 检查是否有遗留的调试代码、临时文件或硬编码值。
- 确认没有无意中将本地 scratch 文件提交。

### 6. 创建 PR

- PR 引用关联的 Issue（`Closes #N`）。
- 使用 `.github/pull_request_template.md` 模板。
- 说明：做了什么、为什么这样做、如何验证。
- 标注是否有 breaking changes，是否更新了 docs/ADR。

## ADR 写入时机判断

是否需要创建 ADR，参考以下规则（详细策略见 `docs/adr-policy.md`）：

**需要 ADR 的情况：**
- 重要技术选型（如框架、数据库、通信协议）。
- 架构模式变更（如从单体拆分为微服务）。
- 引入新的外部依赖或替换现有核心依赖。
- 采用非显而易见的方案（需要记录决策原因）。
- 标记废弃或移除重要功能。

**不需要 ADR 的情况：**
- 日常 bug fix、小范围重构。
- 配置调整（环境变量、CI 脚本等）。
- 已有 ADR 范围内的补充实现。
- 明确的性能优化或代码清理。

## 与其他文件的关系

- 完整开发流程见 `docs/workflow.md`。
- Worktree 使用指南见 `docs/worktree-guide.md`。
- ADR 策略和模板见 `docs/adr-policy.md`。
- PR 模板为 `.github/pull_request_template.md`。

## 实现时的行为准则

1. **Issue 是唯一真相来源**：你实现的所有内容必须对齐 Issue 中的描述和 AC。
2. **Repo 只存事实**：仅提交 README、docs/、测试、AGENTS.md 和源代码。不提交临时 plan、中间推理草稿。
3. **Local scratch 不入库**：如果你在开发中创建了临时 markdown 或笔记，任务完成后删除它们。
4. **保持轻量**：IssueSmith 是轻量工作流，不要自行引入复杂项目管理工具或状态机。
5. **遇到不确定项时先确认**：如果 Issue 描述不清、AC 存在歧义，先与用户澄清，再动工。
