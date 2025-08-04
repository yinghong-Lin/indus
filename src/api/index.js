import axios from "axios"
import { useAuthStore } from "../stores/auth"
import { ElMessage } from "element-plus"

// 获取API基础URL
const getApiBaseUrl = () => {
  // //开发环境(启用mock)
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || "/api"
  }
  //生产环境
  return "http://127.0.0.1:8000/api"
}

// 创建axios实例
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.access_token) {
      // Corrected spelling
      config.headers.Authorization = `Bearer ${authStore.access_token}` // Corrected spelling
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const authStore = useAuthStore()

    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      const refreshed = await authStore.refreshTokenAction()
      if (!refreshed) {
        // 刷新失败，跳转到登录页
        window.location.href = "/login"
        return Promise.reject(error)
      }
      // 重新发送原请求
      return api.request(error.config)
    }

    if (error.response?.status >= 500) {
      ElMessage.error("服务器错误，请稍后重试")
    } else if (error.response?.status >= 400) {
      ElMessage.error(error.response.data?.message || "请求失败")
    } else if (error.code === "ECONNABORTED") {
      ElMessage.error("请求超时，请检查网络连接")
    } else {
      ElMessage.error("网络错误，请检查网络连接")
    }

    return Promise.reject(error)
  },
)

export default api
