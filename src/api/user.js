import request from "./index"
export const userAPI = {
  // 登录接口：路径匹配文档，参数为user_name/password
  login(credentials) {
    return request.post("/user/login", credentials)
  },
  // 登出接口：文档无需user_id，移除请求体参数
  logout() {
    return request.post("/user/logout")
  },
  // 添加用户接口：路径与文档一致，请求体包含完整用户信息
  addUser(userData) {
    return request.post("/user/admin/add", userData)
  },
  // 删除用户接口：文档要求user_name为query参数，修正为params传递
  deleteUser(user_name) {
    return request.delete("/user/admin/delete", { params: { user_name } })
  },
  // 获取用户列表：修正路径为文档的/getUserList
  getUserList(params) {
    return request.get("/user/getUserList", { params })
  },
  // 更新用户接口：修正路径，user_id包含在请求体中
  updateUser(userData) {
    return request.put("/user/admin/updateUser", userData)
  },
}