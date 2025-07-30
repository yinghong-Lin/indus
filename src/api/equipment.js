import request from "./index"

export const equipmentAPI = {
  // 获取设备列表
  getEquipmentList(params) {
    return request.get("/equipment/list", { params })
  },

  // 获取设备规格
  getEquipmentSpec(equipment_name) {
    return request.post("/equipment/spec", { equipment_name })
  },

  // 查询设备详情
  getEquipmentDetail(equipment_name) {
    return request.post("/equipment/detail", { equipment_name })
  },
}
