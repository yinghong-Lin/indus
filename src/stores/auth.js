import { defineStore } from "pinia"
import { userAPI } from "../api/user"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    access_token: localStorage.getItem("access_token"), // 注意这里的拼写
    refresh_token: localStorage.getItem("refresh_token"),
    isLoading: false,
  }),

  getters: {
    // 修正 getter 以使用正确的 token 变量名
    isAuthenticated: (state) => !!state.access_token,
    userRole: (state) => state.user?.role || "user",
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await userAPI.login(credentials)
        // 确保从响应中获取正确的字段
        const user = response.data.user
        const access_token = response.data.access_token
        const refresh_token = response.data.refresh_token

        this.user = user
        this.accsee_token = access_token // 使用正确的变量名
        this.refresh_token = refresh_token

        localStorage.setItem("user", JSON.stringify(user)) // 存储对象需要序列化
        localStorage.setItem("accsee_token", access_token)
        localStorage.setItem("refresh_token", refresh_token)

        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "登录失败",
        }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        if (this.user?.id) {
          await userAPI.logout(this.user.id)
        }
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

    async refreshTokenAction() {
      if (!this.refresh_token) return false

      try {
        const response = await userAPI.refreshToken(this.refresh_token)
        this.access_token = response.access_token
        // 修正 localStorage.setItem 的键名
        localStorage.setItem("access_token", response.access_token)
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },

    async getCurrentUser() {
      if (!this.access_token) return

      try {
        const user = await userAPI.getCurrentUser()
        this.user = user
      } catch (error) {
        console.error("Get current user error:", error)
        this.logout()
      }
    },
  },
})
