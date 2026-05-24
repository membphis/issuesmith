# Skill: issuesmith-start

通过创建隔离的 git worktree 和分支来启动 Issue 的开发。一条指令完成所有操作：读取 Issue → 推导分支名 → 创建 worktree → 安装依赖。

**重要：此过程不写入任何本地文件。** 整个过程通过 git 命令和 shell 操作完成。

---

## 步骤 1：确定 Issue 编号

如果用户以参数形式提供了 Issue 编号（如 `/ism:start 6`），直接使用该编号，跳到步骤 2。

如果没有提供编号，列出最近的 open Issues 供用户选择：

```bash
gh issue list --state open --json number,title,labels --limit 20 --repo <owner>/<repo>
```

清晰地展示列表，让用户按编号选择。

## 步骤 2：读取 Issue

获取完整的 Issue 内容：

```bash
gh issue view <N> --json title,body,labels --repo <owner>/<repo>
```

提取：
- **Title** — 用于推导分支短名
- **Labels** — 用于推导分支前缀
- **Body** — 用于上下文（展示 Goal、Non-goals、AC 摘要）

## 步骤 3：推导分支名和 worktree 路径

### 从标签推导分支前缀

| 标签 | 前缀 |
|------|------|
| `enhancement` | `feat/` |
| `bug` | `fix/` |
| `documentation` | `docs/` |
| `performance` | `perf/` |
| `refactor` | `refactor/` |

如果没有识别到标签，默认使用 `feat/`。如果有多个识别到的标签，使用第一个匹配的。

### 从标题推导短名

将 Issue 标题转换为 kebab-case 短名：
1. 去掉类型前缀（如 `[Feature]: `、`[Bug]: `、`[Perf]: `、`[Docs]: `、`[Refactor]: `）
2. 转换为小写
3. 将空格和特殊字符替换为连字符
4. 移除连续连字符
5. 去掉首尾连字符

示例：`[Feature]: 添加暗色模式开关` → `add-dark-mode-toggle`（如果是英文标题）

### 确定仓库名和 worktree 路径

从 `git remote get-url origin` 提取仓库名（路径的最后一段，去掉 `.git`）。

分支名：`<prefix><short-name>`（如 `feat/add-dark-mode-toggle`）
Worktree 路径：`../<repo>-<short-name>`（如 `../issuesmith-add-dark-mode-toggle`）

## 步骤 4：与用户确认

展示推导结果并请求确认：

```
准备创建 worktree：

  Issue:        #<N> — <title>
  分支:         <prefix><short-name>
  Worktree:     ../<repo>-<short-name>
  基准分支:     main

是否继续？你可以修改分支名或路径。
```

如果用户想修改分支名或路径，接受其输入后继续。如果用户拒绝，中止操作。

## 步骤 5：创建 worktree

执行以下命令：

```bash
# 拉取远端最新代码
git fetch origin

# 基于 main 创建新分支的 worktree
git worktree add -b <branch> ../<repo>-<short-name> main
```

如果 `git worktree add` 失败（如分支或路径已存在），清晰报告错误并建议：
- 用 `git worktree list` 查看已有 worktree
- 用 `git branch` 查看已有分支
- 换一个不同的短名或清理已有的

## 步骤 6：自动检测依赖并安装

在新创建的 worktree 目录中，检测项目类型并安装依赖：

1. 检查 `package.json` → 运行 `npm install`
2. 如果 `package.json` 有对应的 lockfile（`yarn.lock`、`pnpm-lock.yaml`），优先使用 `yarn` 或 `pnpm`
3. 检查 `requirements.txt` 或 `pyproject.toml` → 运行 `pip install -r requirements.txt` 或 `pip install -e .`
4. 检查其他常见模式（`Gemfile`、`Cargo.toml`、`go.mod`、`composer.json`）

在新 worktree 目录内执行安装命令。

如果未找到可识别的依赖文件，静默跳过此步骤。

## 步骤 7：展示完成摘要

显示：

```
Worktree 创建成功。

  Issue:        #<N> — <title>
  分支:         <branch>
  Worktree:     ../<repo>-<short-name>
  依赖:         <已安装 | 未检测到>

下一步：
  cd ../<repo>-<short-name>
  # 开始实现 Issue
```

---

**行为准则**
- **不写本地文件** — 不创建 `.opencode/scratch/` 或任何中间文件。一切通过 git 命令和 shell 完成。
- **始终先确认再创建** — 在向用户展示推导出的分支名和路径并获得明确确认之前，绝不创建 worktree。
- **推导而非臆测** — 分支名和前缀来源于 Issue 的标题和标签，不凭空编造。
- **优雅处理错误** — 如果 git 命令失败，解释原因并给出修复建议。
- **不依赖 `openspec` CLI** — 此 skill 不依赖 OpenSpec 或除了 `gh` 和 `git` 之外的任何外部 CLI。
