import request from "./index"

export const userAPI = {
  // 用户登录
  login(credentials) {
    return request.post("/user/login", credentials)
  },

  // 用户登出
  logout(user_id) {
    return request.post("/user/logout", { user_id })
  },

  // 刷新token
  refreshToken(refreshToken) {
    return request.post("/user/refresh", { refreshToken })
  },


  // 添加用户
  addUser(userData) {
    return request.post("/user/admin/add", userData)
  },

  // 删除用户
  deleteUser(username) {
    return request.delete("/user/admin/delete", { data: { username } })
  },

  // 获取用户列表
  getUserList(params) {
    return request.get("/user/list", { params })
  },

  // 更新用户信息
  updateUser(userId, userData) {
    return request.put(`/user/update/${userId}`, userData)
  },
}
