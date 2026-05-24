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

每个非琐碎的开发任务按以下四步执行，使用内置 `/ism:***` 指令：

### 第一步：创建 Issue（`/ism:explore` → `/ism:create`）

- `/ism:explore` — 思考伙伴模式。探索问题空间、检查已有 Issues、对比方案。不写代码。
- `/ism:create` — 逐节引导生成 Issue（Background → Goal → Non-goals → AC → Tasks → Notes），确认后通过 `gh issue create` 发布。

如果 Issue 还有不明确的地方，**先提出问题，不要猜测**。

### 第二步：启动开发（`/ism:start`）

- `/ism:start <N>` — 读取 Issue #N，自动推导分支名，创建隔离 worktree 并安装依赖。
- 每个实现任务必须在独立 worktree 中执行，不在主仓库直接修改。

### 第三步：执行开发（`/ism:implement`）

在 worktree 内调用 `/ism:implement`，AI 会按以下纪律执行：

- **先理解 Issue**：不要跳过 Issue 直接改代码。
- **按 checklist 拆小步**：将 Task Checklist 拆解为可执行步骤，仅存于对话中，不入库。
- **核心行为优先写测试**：对于新功能或 bug fix，先写测试再写实现。
- **实现后运行验证**：执行项目中的测试命令和 lint 命令，确保通过。
- **边开发边更新 Issue**：完成后用 `gh issue edit` 勾选对应的 checklist 项。

全部任务完成后自动引导进入第四步。

### 第四步：收尾（`/ism:finish`）

- `/ism:finish` — 最终验证 → AC 检查 → 推送 → 创建 PR → CI 等待 → AI review → 由用户选择合并方式。
- 合并不自动执行，需人工确认。
- 辅助工具：`/ism:verify`（证据级验证）、`/ism:code-review`（系统化 review）。

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
- 辅助 skill：`skills/issuesmith-verify/SKILL.md`、`skills/issuesmith-code-review/SKILL.md`。

## 实现时的行为准则

1. **Issue 是唯一真相来源**：你实现的所有内容必须对齐 Issue 中的描述和 AC。
2. **Repo 只存事实**：仅提交 README、docs/、测试、AGENTS.md 和源代码。不提交临时 plan、中间推理草稿。
3. **Local scratch 不入库**：如果你在开发中创建了临时 markdown 或笔记，任务完成后删除它们。
4. **保持轻量**：IssueSmith 是轻量工作流，不要自行引入复杂项目管理工具或状态机。
5. **遇到不确定项时先确认**：如果 Issue 描述不清、AC 存在歧义，先与用户澄清，再动工。
