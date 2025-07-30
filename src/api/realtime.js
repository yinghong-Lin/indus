import request from "./index"

export const realtimeAPI = {
  // 获取实时数据列表
  getAllRealtime() {
    return request.get("/realtime/all")
  },
}
