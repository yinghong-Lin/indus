import request from "./index"

export const roleAPI = {
  // 获取角色列表
  getRoleList(params) {
    return request.get("/role/all", { params })
  },

  // 更新角色
  updateRole(roleData) {
    return request.post("/role/update", roleData)
  },

  // 查询角色
  selectRole(params) {
    return request.post("/role/select", params)
  },

  // 获取用户角色列表
  getUserRoleList(params) {
    return request.get("/api/role/user-roles", { params })
  },

  // 创建角色
  createRole(roleData) {
    return request.post("/api/role/create", roleData)
  },

  // 删除角色
  deleteRole(roleId) {
    return request.delete(`/api/role/delete/${roleId}`)
  },
}
