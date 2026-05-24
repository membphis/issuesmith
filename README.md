# IssueSmith

Issue-first AI 开发工作流：用 GitHub Issue 驱动想法到合并的完整闭环。

## 一句话定义

**IssueSmith 是一套轻量个人 AI 开发流程，以 GitHub Issue 作为需求和任务的主载体，以 worktree 隔离开发，以 review 和验证作为合并门禁。**

## 解决什么问题

AI 编程工具写代码很快，但个人开发流程里两个常见痛点：

1. 需求、设计取舍、验收标准散落在聊天记录或本地草稿中，难以复用。
2. 详细 spec/plan 全量入库容易变成过期文档，反而污染后续 AI 对项目的理解。

IssueSmith 帮你把真正该持久化的信息放到正确位置，而不是要求你维护一套完整 spec 系统。

## 核心原则

- **Issue-first** — 每个非琐碎变更绑定一个 Issue，Issue 承载需求、讨论、验收标准和任务拆分。
- **Repo 只存事实** — 仓库只保存当前有效事实、测试、关键 ADR 和 AI 项目指令（AGENTS.md）。
- **本地 plan 不入库** — 临时开发计划只作为执行辅助，不提交到仓库。
- **Worktree 隔离** — 每个任务使用独立 worktree/branch，开发互不干扰。
- **验证门禁** — 合并前必须完成验证和 review。
- **轻量优先** — 不引入复杂状态机、审批流或完整项目管理体系。

## 适用场景

IssueSmith 适合：

- 使用 Claude Code、Codex、Cursor、Copilot CLI 等 AI 编程工具的个人开发者。
- 希望建立稳定开发纪律，但不想维护复杂企业级 spec 系统的人。
- 希望把需求沉淀在 GitHub Issue，而不是散落在聊天记录或本地 markdown 中的人。

暂不适合：

- 大型团队协作（多审批流、权限控制、复杂状态机）。
- 对所有语言和框架的深度集成。
- 替代 OpenSpec、Spec Kit 或 Superpowers 等现有工作流工具。

## 工作流概览

```
idea → issue → worktree → implementation → review → PR
```

| 阶段 | 说明 |
|------|------|
| **idea** | 用自然语言描述想法、bug 或重构目标 |
| **issue** | 转化为 GitHub Issue，包含背景、目标、验收标准、任务清单 |
| **worktree** | 基于 Issue 创建隔离分支/ worktree |
| **implementation** | 按 checklist 拆小步执行，边开发边更新 Issue 状态 |
| **review** | AI 或 self review，验证验收标准 |
| **PR** | 引用 Issue，说明做了什么、为什么、如何验证 |

## 信息分层

IssueSmith 明确区分四层信息，不同信息有不同的存放位置和生命周期：

| 层级 | 存放位置 | 生命周期 | 示例 |
|------|----------|----------|------|
| **Issue / PR** | GitHub | 持久化，作为变更上下文和讨论记录 | `#1 定义项目总纲` |
| **Repo docs** | 仓库 `docs/` | 持续维护，反映当前事实和关键决策 | `README.md`, `docs/adr/` |
| **Tests** | 仓库 | 持续维护，可执行行为约束 | 单元测试、集成测试 |
| **Local scratch** | 本地，不入库 | 临时，任务完成后可丢弃 | 开发 plan、AI 中间推理 |

## 快速开始

### 前置条件

- 一个 GitHub 仓库
- 安装并配置好一个 AI 编程工具（Claude Code / Codex / Cursor 等）
- 安装 `git worktree`（Git 自带）

### 第一步：创建你的第一个 Issue

使用内置指令创建 Issue，引导你从想法到完整 Issue：

- `/ism:explore` — 思考伙伴模式。探索问题空间、检查已有 Issues、对比方案，不写代码。
- `/ism:create` — 从想法生成 Issue。逐节引导（Background → Goal → AC → Tasks），review 后通过 `gh issue create` 发布。

### 第二步：启动开发

使用内置指令一键创建隔离开发环境，自动完成 worktree 创建、分支命名和依赖安装：

- **`/ism:start <N>`** — 基于 Issue #N 自动创建 worktree：读取 Issue → 推导分支名 → 确认 → 创建 → 安装依赖。
- **`/ism:start`** — 不带参数时，列出最近 open Issues 供你选择，再创建 worktree。

自动行为：
- 从 Issue 标签推导分支前缀（`enhancement` → `feat/`、`bug` → `fix/` 等）
- 从 Issue 标题推导分支短名（如 `添加暗色模式` → `add-dark-mode`）
- 自动检测 `package.json` / `requirements.txt` 等并安装依赖

详细命令和常见场景见 `docs/worktree-guide.md`。

### 第三步：执行开发

第二步创建好 worktree 后，在 worktree 内使用内置指令让 AI 进入 IssueSmith 实现模式，自动遵守开发纪律：前置校验 → 读取 Issue → 拆解任务 → 测试先行 → 逐项实现 → 更新 Issue。

- **`/ism:implement`** — 在当前 worktree 内执行实现模式：自动拆小步、写测试、做实现、跑验证，每完成一项同步勾选 Issue。

关键纪律：
- **必须在 worktree 内执行**（/ism:implement 会前置校验，不在 worktree 将引导执行 /ism:start）
- 核心行为先写测试再写实现
- 小步提交，每步可独立验证
- 边开发边自动更新 Issue checklist

详细流程见 `docs/workflow.md`。

### 第四步：PR、Review 和 Merge

实现完成后使用内置指令收尾开发分支。`/ism:implement` 全部任务完成后会自动引导进入此步骤。

- **`/ism:finish`** — 在当前 worktree 内收尾开发分支：最终验证 → 逐项检查 AC → 清理检查 → 推送 → 自动填充 PR 模板 → CI 等待 → AI review → 处理第三方 review → 合并 → 清理 worktree。

关键纪律：
- 证据先于声称 — 每次验证必须运行命令并读取输出
- AC 必须逐项核对，有缺口不创建 PR
- 提交前必须清理调试代码和临时文件
- 合并前必须经过 review

以上四步覆盖了开发全流程。文档更新和 ADR 决策在实现阶段已处理，本地临时文件由 `/ism:implement` 强制不入库。

### 配置 AI 编程工具

将 `templates/AGENTS.md` 复制为 `AGENTS.md`（或 `CLAUDE.md` / `GEMINI.md`），让 AI 工具按 IssueSmith 流程工作。

## 项目结构

```
issuesmith/
├── README.md               # 项目入口
├── AGENTS.md               # AI 项目规则
├── .github/
│   ├── ISSUE_TEMPLATE/     # Issue 模板
│   └── pull_request_template.md  # PR 模板
├── templates/
│   └── AGENTS.md           # 可复制的 AI 项目规则模板
├── examples/
│   └── README.md           # 端到端示例：idea → PR → 合并 → 沉淀
└── docs/
    ├── workflow.md         # 详细开发流程
    ├── adr-policy.md       # ADR 策略
    └── worktree-guide.md   # Worktree 使用指南
```

## 许可证

MIT
