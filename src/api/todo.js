/**
 * Todo 相关 API 接口
 */

import { http } from './request.js'

const API_PREFIX = '/api/todos'

/**
 * 获取待办列表
 * @param {object} params - 查询参数 { filter?: 'all' | 'active' | 'completed' }
 * @returns {Promise<Array>}
 */
export async function getAllTodos(params) {
  return http.get(API_PREFIX, params)
}

/**
 * 获取单个待办
 * @param {number} id - 待办 ID
 * @returns {Promise<object>}
 */
export async function getTodo(id) {
  return http.get(`${API_PREFIX}/${id}`)
}

/**
 * 创建待办
 * @param {object} data - 待办数据 { text: string }
 * @returns {Promise<object>}
 */
export async function createTodo(data) {
  return http.post(API_PREFIX, data)
}

/**
 * 更新待办
 * @param {number} id - 待办 ID
 * @param {object} data - 更新数据 { text?: string, completed?: boolean }
 * @returns {Promise<object>}
 */
export async function updateTodo(id, data) {
  return http.put(`${API_PREFIX}/${id}`, data)
}

/**
 * 删除待办
 * @param {number} id - 待办 ID
 * @returns {Promise<void>}
 */
export async function deleteTodo(id) {
  return http.delete(`${API_PREFIX}/${id}`)
}

/**
 * 批量删除已完成的待办
 * @returns {Promise<void>}
 */
export async function clearCompleted() {
  return http.delete(`${API_PREFIX}/completed`)
}

export default {
  getAllTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  clearCompleted
}
