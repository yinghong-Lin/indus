import axios from "axios"
import { useAuthStore } from "../stores/auth"
import { ElMessage } from "element-plus"

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || "/api"
  }
  return "http://127.0.0.1:8000/api"
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.access_token) {
      config.headers.Authorization = `Bearer ${authStore.access_token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：处理token无效/过期
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const authStore = useAuthStore()
    // 401：token无效或过期
    if (error.response?.status === 401) {
      // 尝试刷新token
      const refreshed = await authStore.refreshTokenAction()
      if (!refreshed) {
        // 刷新失败：清除token并跳转登录页
        authStore.access_token = null
        authStore.refresh_token = null
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(error)
      }
      // 刷新成功：重新发送原请求
      return api.request(error.config)
    }
    // 其他错误处理（保持原有逻辑）
    if (error.response?.status >= 500) {
      ElMessage.error("服务器错误，请稍后重试")
    } else if (error.response?.status >= 400) {
      ElMessage.error(error.response.data?.msg || "请求失败") // 文档中消息字段为msg
    } else if (error.code === "ECONNABORTED") {
      ElMessage.error("请求超时，请检查网络连接")
    } else {
      ElMessage.error("网络错误，请检查网络连接")
    }
    return Promise.reject(error)
  }
)

export default api