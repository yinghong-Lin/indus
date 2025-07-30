import request from "./index"

export const maintenanceAPI = {
  // 获取维护记录列表
  getMaintenanceList(params) {
    return request.get("/maintenance/list", { params })
  },

  // 创建维护记录
  createMaintenance(maintenanceData) {
    return request.post("/maintenance/create", maintenanceData)
  },

  // 查询维护记录
  selectMaintenance(maintenance_id) {
    return request.post("/maintenance/select", { maintenance_id })
  },

  // 更新维护记录
  updateMaintenance(maintenanceData) {
    return request.post("/maintenance/update", maintenanceData)
  },

  // 删除维护记录
  deleteMaintenance(maintenance_id) {
    return request.delete("/maintenance/delete", { data: { maintenance_id } })
  },
}
