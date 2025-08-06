import request from "./index"

export const userAPI = {
  login(credentials) {
    return request.post("/user/login", credentials)
  },

  logout(user_id) {
    return request.post("/user/logout", { user_id })
  },

  addUser(userData) {
    return request.post("/user/admin/add", userData)
  },

  deleteUser(user_name) {
    return request.delete("/user/admin/delete", { data: { user_name } })
  },

  getUserList(params) {
    return request.get("/user/list", { params })
  },

  updateUser(userId, userData) {
    return request.put(`/user/update/${userId}`, userData)
  },
}