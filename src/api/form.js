import request from "./index"

export const formAPI = {
  // 获取设备状态统计
  getEquipmentStatus(equipment_type) {
    return request.post("/form/equipment-status", {
      equipment_type: equipment_type,
    })
  },

  // 获取设备参数
  getEquipmentParams(equipment_type) {
    return request.post("/form/get-params", {
      equipment_type: equipment_type,
    })
  },

  // 调节设备参数
  updateEquipmentParams(setting_id, params) {
    return request.post("/form/update-params", {
      setting_id,
      params,
    })
  },
}
