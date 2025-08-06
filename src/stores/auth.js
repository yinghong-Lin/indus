import { defineStore } from 'pinia'
import { userAPI } from '../api/user'

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null, // 从 localStorage 加载 user
    access_token: localStorage.getItem("access_token"),
    refresh_token: localStorage.getItem("refresh_token"),
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.access_token,
    userRole: (state) => state.user?.role || "user",
    username: (state) => state.user?.user_name || "",
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await userAPI.login(credentials)
        const user = response.data.user
        const access_token = response.data.access_token
        const refresh_token = response.data.refresh_token

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

  },
})