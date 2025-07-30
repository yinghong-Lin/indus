import api from "./index"

export const monitoringAPI = {
  // 获取工艺参数
  getProcessParameters: () => {
    return api.get("/monitoring/process-parameters")
  },

  // 获取实时设备数据
  getRealtime: () => {
    return api.get("/monitoring/realtime")
  },

  // 获取报警数据
  getAlarms: () => {
    return api.get("/monitoring/alarms")
  },

  // 获取设备状态
  getDeviceStatus: () => {
    return api.get("/monitoring/device-status")
  },

  // 获取生产数据
  getProductionData: (params = {}) => {
    return api.get("/monitoring/production-data", { params })
  },
}
