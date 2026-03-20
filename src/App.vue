<template>
  <div class="todo-container">
    <h1>待办事项</h1>

    <!-- 输入区域 -->
    <div class="input-section">
      <input
        v-model="newTodo"
        @keyup.enter="addTodo"
        type="text"
        placeholder="添加新的待办事项..."
        class="todo-input"
      />
      <button @click="addTodo" class="add-btn">添加</button>
    </div>

    <!-- 筛选选项 -->
    <div class="filter-section">
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
    <ul class="todo-list">
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
    <p v-if="filteredTodos.length === 0" class="empty-message">
      暂无待办事项
    </p>

    <!-- 底部统计 -->
    <div class="footer">
      <span>{{ activeCount }} 项进行中</span>
      <button @click="clearCompleted" class="clear-btn" v-if="completedCount > 0">
        清除已完成 ({{ completedCount }})
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoApp',
  data() {
    return {
      newTodo: '',
      filter: 'all', // all, active, completed
      todos: [
        { id: 1, text: '学习 Vue 3', completed: false },
        { id: 2, text: '完成项目演示', completed: true },
        { id: 3, text: '阅读技术文档', completed: false },
      ]
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
  methods: {
    addTodo() {
      if (this.newTodo.trim() === '') return

      this.todos.unshift({
        id: Date.now(),
        text: this.newTodo.trim(),
        completed: false
      })
      this.newTodo = ''
    },
    deleteTodo(id) {
      this.todos = this.todos.filter(todo => todo.id !== id)
    },
    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed)
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
