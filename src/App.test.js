import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null
  },
  setItem: function(key, value) {
    this.store[key] = String(value)
  },
  removeItem: function(key) {
    delete this.store[key]
  },
  clear: function() {
    this.store = {}
  }
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock todoApi
vi.mock('./api/todo.js', () => ({
  default: {
    getAllTodos: vi.fn(() => Promise.resolve([
      { id: 1, text: '学习 Vue 3', completed: false },
      { id: 2, text: '完成项目演示', completed: true },
      { id: 3, text: '阅读技术文档', completed: false }
    ])),
    createTodo: vi.fn((data) => Promise.resolve({
      id: Date.now(),
      ...data
    })),
    deleteTodo: vi.fn((id) => Promise.resolve()),
    clearCompleted: vi.fn(() => Promise.resolve())
  },
  getAllTodos: vi.fn(() => Promise.resolve([
    { id: 1, text: '学习 Vue 3', completed: false },
    { id: 2, text: '完成项目演示', completed: true },
    { id: 3, text: '阅读技术文档', completed: false }
  ])),
  createTodo: vi.fn((data) => Promise.resolve({
    id: Date.now(),
    ...data
  })),
  deleteTodo: vi.fn((id) => Promise.resolve()),
  clearCompleted: vi.fn(() => Promise.resolve())
}))

describe('TodoApp', () => {
  let wrapper

  beforeEach(async () => {
    localStorageMock.clear()
    wrapper = mount(App, {
      attachTo: document.body
    })
    // 等待异步数据加载
    await flushPromises()
  })

  afterEach(() => {
    wrapper.unmount()
    localStorageMock.clear()
  })

  describe('初始化渲染', () => {
    it('应该正确渲染标题', () => {
      expect(wrapper.find('h1').text()).toBe('待办事项')
    })

    it('应该渲染输入框', () => {
      const input = wrapper.find('.todo-input')
      expect(input.exists()).toBe(true)
      expect(input.element.placeholder).toBe('添加新的待办事项...')
    })

    it('应该渲染添加按钮', () => {
      const addBtn = wrapper.find('.add-btn')
      expect(addBtn.exists()).toBe(true)
      expect(addBtn.text()).toBe('添加')
    })

    it('应该渲染三个筛选按钮', () => {
      const filterButtons = wrapper.findAll('.filter-section button')
      expect(filterButtons.length).toBe(3)
      expect(filterButtons[0].text()).toBe('全部')
      expect(filterButtons[1].text()).toBe('进行中')
      expect(filterButtons[2].text()).toBe('已完成')
    })

    it('应该渲染初始待办列表', () => {
      const todoItems = wrapper.findAll('.todo-item')
      expect(todoItems.length).toBe(3)
    })

    it('应该正确显示初始进行中数量', () => {
      expect(wrapper.find('.footer span').text()).toBe('2 项进行中')
    })
  })

  describe('添加待办事项', () => {
    it('应该可以添加新的待办事项', async () => {
      const input = wrapper.find('.todo-input')
      const addBtn = wrapper.find('.add-btn')

      await input.setValue('学习 TypeScript')
      await addBtn.trigger('click')
      await flushPromises()

      const todoItems = wrapper.findAll('.todo-item')
      expect(todoItems.length).toBe(4)
      expect(wrapper.find('.todo-text').text()).toBe('学习 TypeScript')
    })

    it('应该可以通过按回车键添加待办事项', async () => {
      const input = wrapper.find('.todo-input')

      await input.setValue('阅读书籍')
      await input.trigger('keyup.enter')
      await flushPromises()

      const todoItems = wrapper.findAll('.todo-item')
      expect(todoItems.length).toBe(4)
    })

    it('不应该添加空的待办事项', async () => {
      const input = wrapper.find('.todo-input')
      const addBtn = wrapper.find('.add-btn')

      await input.setValue('')
      await addBtn.trigger('click')
      await flushPromises()

      const todoItems = wrapper.findAll('.todo-item')
      expect(todoItems.length).toBe(3)
    })

    it('不应该添加只包含空格的待办事项', async () => {
      const input = wrapper.find('.todo-input')
      const addBtn = wrapper.find('.add-btn')

      await input.setValue('   ')
      await addBtn.trigger('click')
      await flushPromises()

      const todoItems = wrapper.findAll('.todo-item')
      expect(todoItems.length).toBe(3)
    })

    it('添加后应该清空输入框', async () => {
      const input = wrapper.find('.todo-input')
      const addBtn = wrapper.find('.add-btn')

      await input.setValue('新任务')
      await addBtn.trigger('click')
      await flushPromises()

      expect(input.element.value).toBe('')
    })

    it('新添加的事项应该在列表顶部', async () => {
      const input = wrapper.find('.todo-input')
      const addBtn = wrapper.find('.add-btn')

      await input.setValue('第一个新任务')
      await addBtn.trigger('click')
      await flushPromises()

      const firstTodoText = wrapper.find('.todo-item .todo-text').text()
      expect(firstTodoText).toBe('第一个新任务')
    })

    it('新添加的事项应该是未完成状态', async () => {
      const input = wrapper.find('.todo-input')
      const addBtn = wrapper.find('.add-btn')

      await input.setValue('新任务')
      await addBtn.trigger('click')
      await flushPromises()

      const firstTodo = wrapper.find('.todo-item')
      expect(firstTodo.classes()).not.toContain('completed')
    })
  })

  describe('切换完成状态', () => {
    it('应该可以通过复选框切换完成状态', async () => {
      const todos = wrapper.findAll('.todo-item')
      const checkbox = todos[0].find('.checkbox')

      await checkbox.setValue(true)
      await flushPromises()

      expect(wrapper.findAll('.todo-item')[0].classes()).toContain('completed')
    })

    it('完成后应该更新统计数量', async () => {
      const checkbox = wrapper.findAll('.todo-item')[0].find('.checkbox')

      await checkbox.setValue(true)
      await flushPromises()

      expect(wrapper.find('.footer span').text()).toBe('1 项进行中')
    })
  })

  describe('删除待办事项', () => {
    it('应该可以删除待办事项', async () => {
      const deleteBtn = wrapper.find('.delete-btn')

      await deleteBtn.trigger('click')
      await flushPromises()

      const todoItems = wrapper.findAll('.todo-item')
      expect(todoItems.length).toBe(2)
    })

    it('删除后应该正确更新统计', async () => {
      const todos = wrapper.findAll('.todo-item')
      const deleteBtn = todos[0].find('.delete-btn')

      await deleteBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('.footer span').text()).toBe('1 项进行中')
    })
  })

  describe('筛选功能', () => {
    it('默认应该显示全部', () => {
      const filterButtons = wrapper.findAll('.filter-section button')
      expect(filterButtons[0].classes()).toContain('active')
      expect(wrapper.findAll('.todo-item').length).toBe(3)
    })

    it('应该可以筛选进行中的事项', async () => {
      const filterButtons = wrapper.findAll('.filter-section button')
      const activeFilter = filterButtons[1]

      await activeFilter.trigger('click')

      expect(activeFilter.classes()).toContain('active')
      expect(wrapper.findAll('.todo-item').length).toBe(2)
    })

    it('应该可以筛选已完成的事项', async () => {
      const filterButtons = wrapper.findAll('.filter-section button')
      const completedFilter = filterButtons[2]

      await completedFilter.trigger('click')

      expect(completedFilter.classes()).toContain('active')
      expect(wrapper.findAll('.todo-item').length).toBe(1)
    })

    it('筛选后进行中应该只显示未完成的事项', async () => {
      const filterButtons = wrapper.findAll('.filter-section button')
      await filterButtons[1].trigger('click')

      const todoTexts = wrapper.findAll('.todo-text').map(el => el.text())
      expect(todoTexts).not.toContain('完成项目演示')
    })

    it('筛选已完成应该只显示已完成的事项', async () => {
      const filterButtons = wrapper.findAll('.filter-section button')
      await filterButtons[2].trigger('click')

      const todoTexts = wrapper.findAll('.todo-text').map(el => el.text())
      expect(todoTexts).toEqual(['完成项目演示'])
    })
  })

  describe('清除已完成', () => {
    it('应该可以清除所有已完成事项', async () => {
      const clearBtn = wrapper.find('.clear-btn')

      await clearBtn.trigger('click')
      await flushPromises()

      expect(wrapper.findAll('.todo-item').length).toBe(2)
    })

    it('清除后应该隐藏清除按钮', async () => {
      const clearBtn = wrapper.find('.clear-btn')
      await clearBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('.clear-btn').exists()).toBe(false)
    })

    it('清除后应该更新统计', async () => {
      const clearBtn = wrapper.find('.clear-btn')
      await clearBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('.footer span').text()).toBe('2 项进行中')
    })

    it('没有已完成事项时应该不显示清除按钮', async () => {
      const clearBtn = wrapper.find('.clear-btn')
      await clearBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('.clear-btn').exists()).toBe(false)
    })
  })

  describe('空状态显示', () => {
    it('初始状态有数据时不应该显示空状态提示', () => {
      expect(wrapper.find('.empty-message').exists()).toBe(false)
    })

    it('删除所有事项后应该显示空状态提示', async () => {
      const deleteBtns = wrapper.findAll('.delete-btn')

      for (const btn of deleteBtns) {
        await btn.trigger('click')
        await flushPromises()
      }

      expect(wrapper.find('.empty-message').exists()).toBe(true)
      expect(wrapper.find('.empty-message').text()).toBe('暂无待办事项')
    })

    it('筛选无结果时应该显示空状态提示', async () => {
      // 先将所有未完成事项标记为完成
      const todos = wrapper.findAll('.todo-item')
      for (const todo of todos) {
        if (!todo.classes().includes('completed')) {
          const checkbox = todo.find('.checkbox')
          await checkbox.setValue(true)
          await flushPromises()
        }
      }

      // 然后筛选进行中
      const filterButtons = wrapper.findAll('.filter-section button')
      await filterButtons[1].trigger('click')

      expect(wrapper.find('.empty-message').exists()).toBe(true)
    })
  })

  describe('计算属性', () => {
    it('activeCount 应该正确计算未完成数量', () => {
      const vm = wrapper.vm
      expect(vm.activeCount).toBe(2)
    })

    it('completedCount 应该正确计算已完成数量', () => {
      const vm = wrapper.vm
      expect(vm.completedCount).toBe(1)
    })

    it('filteredTodos 应该根据 filter 返回正确的列表', async () => {
      const vm = wrapper.vm

      vm.filter = 'active'
      await flushPromises()
      expect(vm.filteredTodos.length).toBe(2)

      vm.filter = 'completed'
      await flushPromises()
      expect(vm.filteredTodos.length).toBe(1)

      vm.filter = 'all'
      await flushPromises()
      expect(vm.filteredTodos.length).toBe(3)
    })
  })
})
