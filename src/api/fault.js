import request from "./index"

export const faultAPI = {
  // 获取故障记录列表
  getFaultRecords: (params) => request.get("/fault/getFaultList", { params }),

  // 根据ID查询故障记录
  selectFaultById: (fault_id) => request.get("/fault/gatFaultById", { params: { fault_id } }),

  // 删除故障记录
  deleteFault: (fault_id) => request.delete("/fault/deleteFault", { params: { fault_id } }),

  // 更新故障记录状态
  updateFaultStatus: (fault_id, is_resolved) =>
    request.patch("/fault/updateFaultStatus", null, {
      params: { fault_id, is_resolved },
    }),

  // 更新故障记录描述
  updateFaultDescription: (fault_id, description) =>
    request.patch("/fault/updateFaultDescription", null, {
      params: { fault_id, description },
    }),
}
