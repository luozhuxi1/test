# 飞书 Webhook 配置

## 获取 Webhook URL

1. 在飞书群聊中添加"自定义机器人"
2. 复制生成的 webhook URL
3. 将 URL 填入下方的配置

## 配置方式

### 方式一：环境变量（推荐）

在项目根目录创建 `.env` 文件：

```bash
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 方式二：运行时提供

在执行 issue-fixer 技能时提供 webhook URL。

## 通知格式

技能完成后会发送如下格式的通知：

```
Issue 修复完成
━━━━━━━━━━━━━━━━
Issue: #123 [issue-title](url)
状态：已修复并关闭
```

## 测试 Webhook

```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "msg_type": "text",
    "content": {
      "text": "测试消息"
    }
  }'
```
