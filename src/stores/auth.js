import { defineStore } from "pinia"
import { userAPI } from "../api/user"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token"),
    refreshToken: localStorage.getItem("refreshToken"),
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || "user",
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await userAPI.login(credentials)
        this.user = response.user
        this.token = response.token
        this.refreshToken = response.refreshToken

        localStorage.setItem("token", response.token)
        localStorage.setItem("refreshToken", response.refreshToken)

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
        this.token = null
        this.refreshToken = null
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
      }
    },

    async refreshTokenAction() {
      if (!this.refreshToken) return false

      try {
        const response = await userAPI.refreshToken(this.refreshToken)
        this.token = response.token
        localStorage.setItem("token", response.token)
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },

    async getCurrentUser() {
      if (!this.token) return

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
