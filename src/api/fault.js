import request from "./index"

export const faultAPI = {
  // 获取故障记录列表
  getFaultRecords(params) {
    return request.get("/fault/records", { params })
  },

  // 查询故障记录
  selectFault(fault_id) {
    return request.post("/fault/select", { fault_id })
  },

  // 删除故障记录
  deleteFault(fault_id) {
    return request.delete("/fault/delete", { data: { fault_id } })
  },
}
