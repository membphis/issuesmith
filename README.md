# IssueSmith

用 GitHub Issue 驱动 AI 开发闭环：从想法到合并，四步五指令。

## 核心理念

**Issue 是唯一真相来源。** 每个变更绑定一个 Issue，承载需求、验收标准和任务拆分。用 worktree 隔离开发，用验证和 review 作为合并门禁。临时 plan 不入库。

## 快速开始

### 前置条件

- GitHub 仓库 + AI 编程工具（Claude Code / Codex / Cursor 等）
- `git worktree`（Git 自带）+ `gh` CLI

### 第一步：创建 Issue

把想法转化为结构化 Issue。

```
/ism:explore
```

思考伙伴模式。探索问题空间、对比方案，不写代码。

```
/ism:create
```

逐节引导生成 Issue（Background → Goal → AC → Tasks），确认后发布。

### 第二步：启动开发

基于 Issue 创建隔离的 worktree 和分支。

读取 Issue #3，自动推导分支名，创建 worktree 并安装依赖。

```
/ism:start 3
```

### 第三步：执行开发

在 worktree 内按 Task Checklist 逐项实现。

前置校验 worktree 环境，拆解任务，测试先行，逐项实现，每完成一项同步勾选 Issue。全部完成后自动引导进入第四步。

```
/ism:implement
```

### 第四步：收尾

验证、创建 PR、review、合并。

最终验证 → AC 检查 → 推送 → 创建 PR → CI 等待 → AI review → 由你选择合并方式。

```
/ism:finish
```

### 辅助指令

```
/ism:verify
```
运行测试和 lint，证据先于声称。

```
/ism:code-review
```
对当前分支做系统化 review，分级输出。

### 配置

将 `templates/AGENTS.md` 复制为 `AGENTS.md`（或 `CLAUDE.md` / `GEMINI.md`），让 AI 按 IssueSmith 流程工作。

## 项目结构

```
issuesmith/
├── README.md               # 项目入口
├── AGENTS.md               # AI 项目规则
├── commands/               # /ism:* 指令入口
├── skills/                 # 内置 skill
├── .github/
│   ├── ISSUE_TEMPLATE/     # Issue 模板
│   └── pull_request_template.md
├── templates/
│   └── AGENTS.md           # 可复制的 AI 规则模板
├── examples/
│   └── README.md           # 端到端示例
└── docs/
    ├── workflow.md         # 详细流程
    ├── adr-policy.md       # ADR 策略
    └── worktree-guide.md   # Worktree 指南
```

## 许可证

MIT
