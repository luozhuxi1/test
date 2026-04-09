## Issue Fixer

自动修复 GitHub Issue 并在完成后发送飞书通知。

**参数：** `$ARGUMENTS`（GitHub Issue 编号，如 `7`、`#12`）

### 与 git-issue-workflow 的区别

- `git-issue-workflow`：侧重 issue 生命周期管理（创建、分配、状态流转）
- `issue-fixer`：侧重**自动分析并修复 issue**，包含代码修改、测试验证、PR 创建，并在完成后发送飞书通知

### 重要：命令执行规范

- **禁止使用 `cd && git` 组合命令**（会触发 bare repository 安全检查，无法通过 allow 列表跳过）
- 正确做法：先单独执行 `cd <目录>` 切换目录，再单独执行 `git`/`gh`/`npm`/`curl` 等命令
- 所有 shell 命令都应单独执行，不要用 `cd <dir> && <command>` 链式写法

### 执行步骤

请严格按以下流程执行：

1. **解析 Issue 编号**
   - 从 `$ARGUMENTS` 中提取 issue 编号（去除 `#` 前缀）
   - 如果参数为空，提示用户输入 issue 编号并终止

2. **获取 Issue 详情**
   - 执行 `gh issue view <编号>` 获取 issue 标题、描述、标签
   - 向用户展示 issue 摘要，确认开始修复

3. **创建修复分支**
   - 基于主分支创建新分支：`fix/issue-<编号>-<简短描述>`
   - `git checkout -b fix/issue-<编号>-<简短描述>`

4. **分析问题并实施修复**
   - 根据 issue 描述分析代码，定位问题
   - 实施修复，确保改动最小化且准确
   - 如果问题不明确或过于复杂，向用户说明情况并请求指导

5. **验证修复**
   - 如果项目有测试，运行 `npm test` 验证
   - 如果项目有构建，运行 `npm run build` 确保不破坏构建

6. **提交代码**
   - `git add <修改的文件>`
   - 提交信息格式：`fix: <修复描述> (closes #<编号>)`

7. **推送并创建 PR**
   - `git push origin <分支名>`
   - 使用 `gh pr create` 创建 PR，标题关联 issue
   - PR body 中包含 `Closes #<编号>`

8. **关闭 Issue**
   - 执行 `gh issue close <编号>` 关闭对应 issue

9. **发送飞书通知**
   - 从 `.env` 文件读取 `FEISHU_WEBHOOK_URL`
   - 如果未配置 webhook URL，跳过通知并提示用户配置
   - 使用 curl 发送飞书消息，内容包含：
     - Issue 编号和标题
     - 修复分支名
     - PR 链接
     - 修复摘要
   - 飞书消息格式（使用 `--data-binary @-` + heredoc 避免 Windows 中文乱码）：
     ```bash
     curl -X POST "$FEISHU_WEBHOOK_URL" \
       -H "Content-Type: application/json; charset=utf-8" \
       --data-binary @- <<'EOF'
     {
       "msg_type": "interactive",
       "card": {
         "header": {
           "title": {"tag": "plain_text", "content": "Issue #<编号> 已修复"},
           "template": "green"
         },
         "elements": [
           {"tag": "div", "text": {"tag": "lark_md", "content": "**Issue:** #<编号> <标题>\n**分支:** <分支名>\n**PR:** <PR链接>\n**摘要:** <修复描述>"}},
           {"tag": "action", "actions": [{"tag": "button", "text": {"tag": "plain_text", "content": "查看 PR"}, "url": "<PR链接>", "type": "primary"}]}
         ]
       }
     }
     EOF
     ```

10. **输出修复摘要**
   - 显示：issue 编号、修复分支、PR 链接、飞书通知状态
