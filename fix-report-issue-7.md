# Issue #7 修复报告

## 基本信息

| 项目 | 详情 |
|------|------|
| **Issue** | [#7 添加待办事项](https://github.com/luozhuxi1/test/issues/7) |
| **状态** | 已关闭 |
| **修复分支** | `fix/issue-7-empty-todo-validation` |
| **PR** | [#8 fix: add empty todo validation (#7)](https://github.com/luozhuxi1/test/pull/8) |
| **修复日期** | 2026-04-09 |

## 问题描述

添加待办事项时，如果输入内容为空，需要添加一个"待办事项不能为空"的弹窗提醒。

## 修复方案

在 `src/App.vue` 的 `addTodo()` 方法中增加空值校验：

```javascript
async addTodo() {
  if (this.newTodo.trim() === '') {
    alert('待办事项不能为空')
    return
  }
  // ...
}
```

- 点击"添加"按钮时校验
- 按回车键时校验
- 仅含空格的输入同样拦截

## 涉及文件

| 文件 | 变更 |
|------|------|
| `src/App.vue` | `addTodo()` 方法增加空输入校验逻辑 |

## 验证结果

- [x] `npm run build` 构建通过
- [x] 输入为空时点击"添加"，弹窗提示
- [x] 输入为空时按回车，弹窗提示
- [x] 输入仅含空格，弹窗提示
- [x] 输入正常内容，可正常添加

## 通知

- 飞书通知：已发送成功
