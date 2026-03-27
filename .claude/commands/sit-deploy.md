## SIT Deploy Skill

将当前分支 merge 到 sit_v1 并创建递增版本的 SIT tag 触发部署。

**参数：** `$ARGUMENTS`（应用名称，如 `fashion`、`admin`、`api` 等）

### 执行步骤

请严格按以下流程执行，每个关键步骤执行前先告知用户即将做什么：

1. **解析并校验参数**
   - 从 `$ARGUMENTS` 中提取 app 名称
   - 合法应用名：`fashion`、`admin`、`api`、`res`、`catalog`、`wfj`、`track`、`fa`
   - 如果参数为空或不合法，列出可用应用名并终止

2. **记录当前分支**
   - 执行 `git branch --show-current` 保存当前分支名，后续要切回

3. **切换到 sit_v1 并 merge**
   - `git checkout sit_v1`
   - `git pull origin sit_v1`
   - `git merge <原分支名>`
   - 如果 merge 出现冲突，**立即停止**，提示用户手动解决冲突后再继续

4. **Push sit_v1**
   - `git push origin sit_v1`

5. **查找最新 SIT tag 并递增版本**
   - 执行 `git tag -l "<app>-sit-v*" --sort=-v:refname` 取第一条结果
   - 解析版本号格式 `major.minor.patch.build`
   - 将最后一位 build 号 +1 生成新版本
   - 示例：`fashion-sit-v0.7.1.7` → `fashion-sit-v0.7.1.8`
   - 如果找不到已有 tag，询问用户指定初始版本号

6. **确认新 tag**
   - 向用户展示即将创建的新 tag 名称，等待确认

7. **创建并推送 tag**
   - `git tag <新tag名>`
   - `git push origin <新tag名>`

8. **切回原分支**
   - `git checkout <原分支名>`

9. **输出部署摘要**
   - 显示：合并的源分支、新创建的 tag、上一个 tag
   - 提示：Azure Pipeline 将自动触发部署
