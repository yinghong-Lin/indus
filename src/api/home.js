import request from "./index"

export const homeAPI = {
  // 根据类型获取设备名及设备运行状态接口
  getEquipmentNameAndStatusByType: (equipment_type = "all") =>
    request.get("/home/getEquipmentNameAndStatusByType", {
      params: { equipment_type },
    }),

  // 一键更改设备运行状态接口
  updateAllEquipmentStatus: (equipment_status) =>
    request.patch("/home/updateAllEquipmentStatus", null, {
      params: { equipment_status },
    }),

  // 获取运行中任务列表接口
  getInProgressProductionTask: () => request.get("/home/getInProgressProductionTask"),
}
