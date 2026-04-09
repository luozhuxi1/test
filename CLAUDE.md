# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

Single-file Vue 3 application using Vite as the build tool.

- `src/main.js` - Entry point that mounts the Vue app
- `src/App.vue` - Main component containing the todo application logic and styles
- `src/api/` - API module for backend communication
  - `request.js` - HTTP request wrapper using native fetch
  - `todo.js` - Todo-related API endpoints
  - `index.js` - Unified module exports
- `vite.config.js` - Vite configuration with @vitejs/plugin-vue

## API Module

The API module provides a clean interface for backend communication with automatic fallback to local storage when the backend is unavailable.

- Uses native `fetch` API (no extra dependencies)
- Auto fallback to localStorage mode
- Unified error handling with `HttpError` class
- Environment variable: `VITE_API_BASE_URL`

### API Files

| File | Description |
|------|-------------|
| `src/api/request.js` | HTTP 请求封装（fetch + HttpError 错误处理 + http 便捷方法） |
| `src/api/todo.js` | Todo CRUD API（getAllTodos, createTodo, updateTodo, deleteTodo, clearCompleted） |
| `src/api/index.js` | 统一导出（todoApi, http, HttpError） |

### API 接口规范

后端需提供以下 RESTful 接口：

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/todos` | 获取待办列表 |
| GET | `/api/todos/:id` | 获取单个待办 |
| POST | `/api/todos` | 创建待办 |
| PUT | `/api/todos/:id` | 更新待办 |
| DELETE | `/api/todos/:id` | 删除待办 |
| DELETE | `/api/todos/completed` | 清除已完成 |

### 降级模式

当 API 不可用时自动切换到 localStorage 模式：
- 数据保存在浏览器本地
- 刷新页面数据不丢失
- 显示"本地模式"提示

### 使用示例

```javascript
import { todoApi, http, HttpError } from './api/index.js'

// 方式一：使用封装好的 API
const todos = await todoApi.getAllTodos()
await todoApi.createTodo({ text: '新待办' })

// 方式二：使用通用 http 方法
const data = await http.get('/api/users')
await http.post('/api/users', { name: 'test' })
```
