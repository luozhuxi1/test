# API 模块开发文档

## 目录结构

```
src/
├── api/
│   ├── index.js          # 统一导出
│   ├── request.js        # HTTP 请求封装
│   └── todo.js           # Todo 相关 API
├── main.js
└── App.vue
```

## 模块说明

### 1. request.js - HTTP 请求封装

使用原生 `fetch` API，无需额外安装依赖。

**主要功能：**
- 统一的请求/响应处理
- 自动 JSON 解析
- 自定义错误类 `HttpError`
- 便捷的 HTTP 方法封装

**使用方法：**
```javascript
import { http, request, HttpError } from './api/request.js'

// 方式一：使用便捷方法
const data = await http.get('/api/todos')
await http.post('/api/todos', { text: '新待办' })
await http.put('/api/todos/1', { completed: true })
await http.delete('/api/todos/1')

// 方式二：使用通用 request 方法
const data = await request('/api/todos', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
})
```

**环境变量：**
```bash
# .env 文件
VITE_API_BASE_URL=http://localhost:3000
```

### 2. todo.js - Todo API 接口

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `getAllTodos(params)` | 获取待办列表 | `{ filter?: 'all'\|'active'\|'completed' }` | `Promise<Array>` |
| `getTodo(id)` | 获取单个待办 | `id: number` | `Promise<Object>` |
| `createTodo(data)` | 创建待办 | `{ text: string, completed?: boolean }` | `Promise<Object>` |
| `updateTodo(id, data)` | 更新待办 | `id: number, data: Object` | `Promise<Object>` |
| `deleteTodo(id)` | 删除待办 | `id: number` | `Promise<void>` |
| `clearCompleted()` | 清除已完成 | - | `Promise<void>` |

**使用示例：**
```javascript
import { todoApi } from './api/index.js'

// 获取所有待办
const todos = await todoApi.getAllTodos()

// 创建待办
const newTodo = await todoApi.createTodo({ text: '学习 API 模块' })

// 更新待办
await todoApi.updateTodo(newTodo.id, { completed: true })

// 删除待办
await todoApi.deleteTodo(newTodo.id)

// 清除已完成
await todoApi.clearCompleted()
```

### 3. index.js - 统一导出

```javascript
// 按需导入
import { http, todoApi, getAllTodos, HttpError } from './api/index.js'

// 或全部导入
import * as api from './api/index.js'
```

## API 接口规范

### 后端接口要求

后端需要提供以下 RESTful 接口：

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/todos` | 获取待办列表 |
| GET | `/api/todos/:id` | 获取单个待办 |
| POST | `/api/todos` | 创建待办 |
| PUT | `/api/todos/:id` | 更新待办 |
| DELETE | `/api/todos/:id` | 删除待办 |
| DELETE | `/api/todos/completed` | 清除已完成 |

### 数据格式

**Todo 对象：**
```json
{
  "id": 1,
  "text": "学习 Vue 3",
  "completed": false
}
```

**错误响应：**
```json
{
  "message": "错误信息"
}
```

## 降级模式

当 API 服务不可用时，应用会自动切换到**本地模式**，使用 `localStorage` 存储数据。

本地模式特性：
- 数据保存在浏览器本地
- 刷新页面数据不丢失
- 不影响正常使用

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置后端地址**（可选）
   ```bash
   # 创建 .env 文件
   echo "VITE_API_BASE_URL=http://localhost:3000" > .env
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 扩展新模块

添加新的 API 模块（例如 `user.js`）：

```javascript
// src/api/user.js
import { http } from './request.js'

const API_PREFIX = '/api/users'

export async function getUserProfile(id) {
  return http.get(`${API_PREFIX}/${id}`)
}

export async function updateUserProfile(id, data) {
  return http.put(`${API_PREFIX}/${id}`, data)
}

export default {
  getUserProfile,
  updateUserProfile
}
```

然后在 `index.js` 中导出：

```javascript
export { default as userApi } from './user.js'
```

## 注意事项

1. **CORS 配置** - 后端需要配置跨域允许
2. **错误处理** - 使用 `try-catch` 包裹 API 调用
3. **加载状态** - 在请求时显示 loading 提示
4. **超时处理** - 如需超时控制，可使用 `AbortController`
