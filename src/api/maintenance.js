import request from "./index"

export const maintenanceAPI = {
  // 获取维护记录列表
  getMaintenanceList: (params) => request.get("/maintenance/getMaintenanceList", { params }),

  // 创建维护记录
  createMaintenance: (data) => request.post("/maintenance/addMaintenance", data),

  // 根据ID查询维护记录
  selectMaintenanceById: (maintenance_id) =>
    request.get("/maintenance/getMaintenanceById", { params: { maintenance_id } }),

  // 更新维护记录
  updateMaintenance: (data) => request.put("/maintenance/updateMaintenance", data),

  // 删除维护记录
  deleteMaintenance: (maintenance_id) =>
    request.delete("/maintenance/deleteMaintenance", { params: { maintenance_id } }),

  // 更新维护状态
  updateMaintenanceStatus: (maintenance_id, status) =>
    request.patch("/maintenance/updateMaintenanceStatus", null, {
      params: { maintenance_id, status },
    }),
}
