---
name: issue-fixer
description: 自动修复 GitHub issue 中报告的 bug。当用户提供 GitHub issue ID 或链接时，自动分析问题、定位代码、编写修复、运行测试验证、提交代码并关闭 issue。适用于本仓库的 bug 修复任务。
---

# Issue Fixer Skill

## 触发条件

当用户提供以下任一信息时触发此技能：
- GitHub issue 编号（如 `#123` 或 `issue 42`）
- GitHub issue 完整链接（如 `https://github.com/owner/repo/issues/123`）
- 明确要求修复某个 issue

## 工作流程

### 1. 获取 Issue 信息

使用 `gh issue view <issue-id>` 获取 issue 详情：

```bash
gh issue view <issue-id>
```

需要提取的关键信息：
- Issue 标题
- Issue 描述/正文
- 标签（labels）
- 关联的代码文件（如果有）

### 2. 分析问题

阅读 issue 内容，理解 bug 的具体表现：
- 错误现象是什么？
- 复现步骤是什么？
- 期望行为 vs 实际行为
- 是否有错误堆栈或截图

### 3. 定位问题代码

根据 issue 描述定位相关代码：
- 使用 `Glob` 查找相关文件
- 使用 `Grep` 搜索相关函数/变量
- 阅读相关代码理解问题根因

### 4. 编写修复

编写代码修复：
- 修改最小范围的代码
- 保持现有代码风格
- 添加必要的错误处理
- 如有必要，添加测试用例

### 5. 验证修复

按顺序执行以下验证步骤：

**5.1 运行构建**
```bash
npm run build
```
确保代码可以正常编译。

**5.2 运行测试**
```bash
npm test
```
确保所有测试通过。

**5.3 代码检查**
检查代码风格是否符合项目规范（如有配置 lint 则运行）。

### 6. 提交代码

验证通过后提交代码：

```bash
git add .
git commit -m "fix: <简短描述>

Fixes #<issue-id>
"
```

提交信息规范：
- 使用 `fix:` 前缀表示 bug 修复
- 标题简明扼要描述修复内容
- 正文包含 `Fixes #<id>` 自动关联 issue

### 7. 推送并关闭 Issue

```bash
git push
gh issue close <issue-id> --comment "已修复，代码已合并。"
```

### 8. 发送飞书通知

使用 `Bash` 调用飞书 webhook 发送完成通知：

```bash
curl -X POST "<WEBHOOK_URL>" \
  -H "Content-Type: application/json" \
  -d '{
    "msg_type": "post",
    "content": {
      "post": {
        "zh_cn": {
          "title": "Issue 修复完成",
          "content": [
            [
              {"tag": "text", "text": "Issue: #<id> "},
              {"tag": "a", "text": "<issue-title>", "href": "<issue-url>"}
            ],
            [
              {"tag": "text", "text": "状态：已修复并关闭"}
            ],
            [
              {"tag": "text", "text": "提交："}
            ]
          ]
        }
      }
    }
  }'
```

## 配置项

使用前请在项目根目录创建 `.env` 文件或在此技能配置中设置：

```bash
# 飞书 webhook URL
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
```

或在执行时由用户提供 webhook URL。

## 注意事项

1. **权限检查**：确保有权限访问 GitHub issue 和推送代码
2. **测试优先**：如果项目没有测试，建议先添加基础测试
3. **小步提交**：每个 issue 单独提交，不要合并多个修复
4. **回滚准备**：重大修改前建议创建分支备份

## 错误处理

- 如果 `gh` 命令失败，检查是否已登录：`gh auth status`
- 如果测试失败，分析是修复引入的新问题还是现有测试问题
- 如果飞书通知失败，记录错误但不影响主要流程
