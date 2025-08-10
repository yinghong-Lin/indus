import { defineStore } from 'pinia'
import request from '../api/index'
import { userAPI } from '../api/user'

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    access_token: localStorage.getItem("access_token"),
    refresh_token: localStorage.getItem("refresh_token"),
    isLoading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.access_token, // 检测token是否存在
    userRole: (state) => state.user?.role_name || "user", // 匹配文档的role_name字段
    username: (state) => state.user?.user_name || "",
  },
  actions: {
    // 登录：复用现有逻辑，确保与文档响应字段匹配
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await userAPI.login(credentials)
        const { user, access_token, refresh_token } = response.data // 文档中data包含的字段
        this.user = user
        this.access_token = access_token
        this.refresh_token = refresh_token
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("access_token", access_token)
        localStorage.setItem("refresh_token", refresh_token)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.msg || "登录失败", // 文档中响应消息字段为msg
        }
      } finally {
        this.isLoading = false
      }
    },

    // 登出：移除user_id参数，匹配文档接口
    async logout() {
      try {
        await userAPI.logout() // 文档中登出无需参数
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        this.user = null
        this.access_token = null
        this.refresh_token = null
        localStorage.removeItem("user")
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
    },

  },
})