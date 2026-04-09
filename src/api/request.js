/**
 * HTTP 请求封装
 * 使用原生 fetch API，无需额外依赖
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * 请求封装
 * @param {string} url - 请求地址
 * @param {object} options - 请求选项
 * @returns {Promise<any>}
 */
export async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  }

  try {
    const response = await fetch(fullUrl, config)

    // 处理非成功状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new HttpError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        errorData
      )
    }

    // 处理无返回内容的情况
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text()
  } catch (error) {
    // 网络错误或其他 fetch 错误
    if (!(error instanceof HttpError)) {
      throw new HttpError(
        `Network Error: ${error.message}`,
        0,
        { originalError: error }
      )
    }
    throw error
  }
}

/**
 * 便捷请求方法
 */
export const http = {
  get(url, params) {
    const queryString = params ? new URLSearchParams(params).toString() : ''
    const fullUrl = queryString ? `${url}?${queryString}` : url
    return request(fullUrl, { method: 'GET' })
  },

  post(url, data) {
    return request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  put(url, data) {
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  patch(url, data) {
    return request(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  delete(url) {
    return request(url, { method: 'DELETE' })
  }
}

/**
 * 自定义错误类
 */
export class HttpError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

export default request
