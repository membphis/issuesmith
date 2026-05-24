# Worktree 使用指南

本指南介绍如何在 IssueSmith 工作流中使用 `git worktree` 进行隔离开发，包含常用命令、工作流示例和问题排查。

## 什么是 Git Worktree

`git worktree` 允许你在同一个仓库中同时 checkout 多个分支到不同目录。每个 worktree 拥有独立的工作区，互不干扰。

在 IssueSmith 工作流中，worktree 让你可以：

- **同时开发多个 Issue**，每个 Issue 在独立目录中工作。
- **避免 stash / WIP 提交**，切换任务时不需要保存未完成的工作。
- **保持主工作区干净**，每个 feature 有自己独立的 `node_modules`、构建产物等。
- **并行测试**，在一个 worktree 开发的同时，在另一个 worktree 运行长时间测试。

## 前提条件

`git worktree` 是 Git 自带的命令（Git 2.5+），无需额外安装。验证是否可用：

```bash
git worktree --help
```

## 基本命令

### 查看现有 Worktree

```bash
# 列出所有 worktree（含路径、分支、commit hash）
git worktree list
```

输出示例：

```
/Users/me/work/issuesmith    abc1234 [main]
/Users/me/work/issuesmith-f1 def5678 [feat/my-feature]
```

### 创建 Worktree

```bash
# 基于已有分支创建 worktree
git worktree add <path> <branch>

# 创建新分支并创建 worktree
git worktree add -b <new-branch> <path> <base-branch>

# 示例：基于 main 创建 feat/my-feature 分支的 worktree
git fetch origin
git worktree add -b feat/my-feature ../repo-my-feature main
```

**路径建议**：
- 将 worktree 放在主仓库的相邻目录：`../<repo>-<feature-name>`
- 目录名与分支名对应，方便识别。

### 切换到已有 Worktree

```bash
# 直接 cd 进入 worktree 目录
cd ../repo-my-feature

# 确保分支是最新的
git pull origin main
```

### 删除 Worktree

```bash
# 删除 worktree（同时删除目录）
git worktree remove <path>

# 如果目录已手动删除，用 prune 清理
git worktree prune

# 示例
git worktree remove ../repo-my-feature
```

**注意**：删除前确保变更已推送或不再需要。如果有未合并的变更，`remove` 会提示先合并或推送。

### 删除对应的分支

```bash
# worktree 删除后，如果分支已合并到 main，可以删除
git branch -d feat/my-feature

# 如果分支未合并但确定不需要，使用 -D 强制删除
git branch -D feat/my-feature
```

## 常见工作流

### 场景 1：从 Issue 开始一个新功能

```bash
# 1. 确保主仓库是最新的
cd /path/to/issuesmith
git fetch origin
git checkout main
git pull origin main

# 2. 创建新 worktree 用于开发
git worktree add -b feat/add-login ../issuesmith-login main

# 3. 进入 worktree，开始开发
cd ../issuesmith-login

# 4. 安装依赖（如果项目需要）
npm install

# 5. 开发、提交
# ...

# 6. 推送分支
git push origin feat/add-login

# 7. 创建 PR、review、合并

# 8. 合并后清理
cd /path/to/issuesmith
git worktree remove ../issuesmith-login
git branch -d feat/add-login
```

### 场景 2：同时开发两个 Issue

```bash
# Issue #3: 创建模板文件
git worktree add -b feat/templates ../issuesmith-templates main

# Issue #4: 实现某个功能
git worktree add -b feat/new-api ../issuesmith-api main

# 在两个终端窗口分别工作
# 终端 1: cd ../issuesmith-templates
# 终端 2: cd ../issuesmith-api

# 互相不干扰，不需要 stash 或切换分支
```

### 场景 3：在 worktree 中做 Code Review

```bash
# 基于 PR 分支创建临时 worktree 用于 review
git fetch origin pull/5/head:pr-5
git worktree add ../issuesmith-review-5 pr-5

# 查看代码、运行测试
cd ../issuesmith-review-5
npm test

# Review 完成后清理
cd /path/to/issuesmith
git worktree remove ../issuesmith-review-5
git branch -D pr-5
```

### 场景 4：同步 main 最新代码到 worktree

```bash
# 在你的 worktree 中
cd ../repo-my-feature

# 拉取最新 main
git fetch origin
git merge origin/main

# 或使用 rebase
git rebase origin/main

# 解决冲突（如有）
# 继续工作
```

## 注意事项

### 同一分支只能在一个 Worktree 中 Checkout

Git 不允许同一个分支在多个 worktree 中被 checkout。如果你尝试：

```bash
git worktree add ../repo-other main  # 报错：main is already checked out
```

解决方法：创建新分支或使用不同的基础分支。

### 共享 .git 目录

所有 worktree 共享主仓库的 `.git` 目录。每个 worktree 只有自己的 `HEAD`、`index` 等本地状态。这意味着：

- `git stash` 的作用域是每个 worktree 独立的。
- `.gitignore`、hooks 等配置来自主仓库。
- 在任意 worktree 中 `git fetch` 会更新共享的远程引用。

### 文件系统注意事项

- 不要在多个 worktree 中同时编辑同一个文件（虽然文件系统可能允许）。
- 不同 worktree 的 `node_modules`、构建产物等是独立的，需要在各自的 worktree 中分别安装。
- 使用 `.gitignore` 排除特定于 IDE 的临时文件，避免跨 worktree 干扰。

## 问题排查

### worktree 目录被外部删除

如果你手动删除了 worktree 目录，Git 中还残留引用：

```bash
# 清理过期的 worktree 引用
git worktree prune

# 验证
git worktree list
```

### 删除 worktree 失败——有未推送的变更

```bash
# --force 强制删除（会丢失未推送的变更，慎用）
git worktree remove --force ../repo-my-feature
```

### 在不支持的磁盘或文件系统上使用

某些网络文件系统或容器化环境可能不完全支持 worktree。如果遇到问题，使用传统的 `git checkout -b` 切换分支即可，核心开发流程不变。

## 相关文档

- `docs/workflow.md` — IssueSmith 完整开发流程（含 worktree 在第 3 步的说明）
- `AGENTS.md` — AI 项目规则（含 worktree 创建指令）
