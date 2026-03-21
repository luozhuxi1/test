<template>
  <div class="todo-container">
    <h1>待办事项</h1>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="loadTodos" class="retry-btn">重试</button>
    </div>

    <!-- 本地模式提示 -->
    <div v-if="useLocalMode" class="local-mode-notice">
      本地模式 - 数据仅保存在当前设备
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      加载中...
    </div>

    <!-- 输入区域 -->
    <div class="input-section" v-show="!loading">
      <input
        v-model="newTodo"
        @keyup.enter="addTodo"
        type="text"
        placeholder="添加新的待办事项..."
        class="todo-input"
        :disabled="loading"
      />
      <button @click="addTodo" class="add-btn" :disabled="loading">添加</button>
    </div>

    <!-- 筛选选项 -->
    <div class="filter-section" v-show="!loading">
      <button
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        全部
      </button>
      <button
        :class="{ active: filter === 'active' }"
        @click="filter = 'active'"
      >
        进行中
      </button>
      <button
        :class="{ active: filter === 'completed' }"
        @click="filter = 'completed'"
      >
        已完成
      </button>
    </div>

    <!-- 待办列表 -->
    <ul class="todo-list" v-show="!loading">
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="todo-item"
        :class="{ completed: todo.completed }"
      >
        <input
          type="checkbox"
          v-model="todo.completed"
          class="checkbox"
        />
        <span class="todo-text">{{ todo.text }}</span>
        <button @click="deleteTodo(todo.id)" class="delete-btn">删除</button>
      </li>
    </ul>

    <!-- 空状态提示 -->
    <p v-if="!loading && filteredTodos.length === 0" class="empty-message">
      暂无待办事项
    </p>

    <!-- 底部统计 -->
    <div class="footer" v-show="!loading && todos.length > 0">
      <span>{{ activeCount }} 项进行中</span>
      <button @click="clearCompleted" class="clear-btn" v-if="completedCount > 0">
        清除已完成 ({{ completedCount }})
      </button>
    </div>
  </div>
</template>

<script>
import { todoApi, HttpError } from './api/index.js'

export default {
  name: 'TodoApp',
  data() {
    return {
      newTodo: '',
      filter: 'all', // all, active, completed
      todos: [],
      loading: false,
      error: null,
      useLocalMode: false // 当 API 不可用时启用本地模式
    }
  },
  computed: {
    filteredTodos() {
      if (this.filter === 'active') {
        return this.todos.filter(todo => !todo.completed)
      }
      if (this.filter === 'completed') {
        return this.todos.filter(todo => todo.completed)
      }
      return this.todos
    },
    activeCount() {
      return this.todos.filter(todo => !todo.completed).length
    },
    completedCount() {
      return this.todos.filter(todo => todo.completed).length
    }
  },
  async mounted() {
    await this.loadTodos()
  },
  methods: {
    /**
     * 加载待办列表
     */
    async loadTodos() {
      this.loading = true
      this.error = null

      try {
        if (this.useLocalMode) {
          const stored = localStorage.getItem('todos')
          this.todos = stored ? JSON.parse(stored) : []
        } else {
          this.todos = await todoApi.getAllTodos()
        }
      } catch (error) {
        console.warn('API 加载失败，切换到本地模式:', error.message)
        this.useLocalMode = true
        this.error = null
        const stored = localStorage.getItem('todos')
        this.todos = stored ? JSON.parse(stored) : []
      } finally {
        this.loading = false
      }
    },

    /**
     * 添加待办
     */
    async addTodo() {
      if (this.newTodo.trim() === '') return

      const todoData = {
        text: this.newTodo.trim(),
        completed: false
      }

      try {
        if (this.useLocalMode) {
          const newTodo = {
            id: Date.now(),
            ...todoData
          }
          this.todos.unshift(newTodo)
          this.saveToLocal()
        } else {
          const newTodo = await todoApi.createTodo(todoData)
          this.todos.unshift(newTodo)
        }
        this.newTodo = ''
        this.error = null
      } catch (error) {
        this.handleError(error, '添加失败')
      }
    },

    /**
     * 删除待办
     */
    async deleteTodo(id) {
      try {
        if (this.useLocalMode) {
          this.todos = this.todos.filter(todo => todo.id !== id)
          this.saveToLocal()
        } else {
          await todoApi.deleteTodo(id)
          this.todos = this.todos.filter(todo => todo.id !== id)
        }
        this.error = null
      } catch (error) {
        this.handleError(error, '删除失败')
      }
    },

    /**
     * 清除已完成
     */
    async clearCompleted() {
      try {
        if (this.useLocalMode) {
          this.todos = this.todos.filter(todo => !todo.completed)
          this.saveToLocal()
        } else {
          await todoApi.clearCompleted()
          this.todos = this.todos.filter(todo => !todo.completed)
        }
        this.error = null
      } catch (error) {
        this.handleError(error, '清除失败')
      }
    },

    /**
     * 保存待办状态变更（用于本地模式）
     */
    saveToLocal() {
      localStorage.setItem('todos', JSON.stringify(this.todos))
    },

    /**
     * 统一错误处理
     */
    handleError(error, defaultMessage) {
      if (error instanceof HttpError && error.status === 0) {
        // 网络错误，切换到本地模式
        this.useLocalMode = true
        this.error = '网络连接失败，已切换到本地模式'
        console.warn('切换到本地存储模式')
      } else {
        this.error = error.message || defaultMessage
      }
    }
  }
}
</script>

<style scoped>
.todo-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 24px;
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  color: #ff4d4f;
  font-size: 14px;
}

.retry-btn {
  padding: 4px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #ff7875;
}

/* 本地模式提示 */
.local-mode-notice {
  padding: 8px 16px;
  margin-bottom: 16px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  color: #0958d9;
  font-size: 13px;
  text-align: center;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 16px;
}

.input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.todo-input:focus {
  outline: none;
  border-color: #42b983;
}

.todo-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.add-btn {
  padding: 12px 24px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #369970;
}

.add-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.filter-section {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-section button {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-section button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #f9f9f9;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.delete-btn {
  padding: 6px 12px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #ee5a5a;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 20px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
  color: #666;
}

.clear-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #e0e0e0;
}
</style>
