import request from "./index"

export const productionAPI = {
  // 获取生产数据列表
  getProductionDataList(params) {
    return request.get("/production/data/list", { params })
  },

  // 查询生产数据
  selectProductionData(production_data_id) {
    return request.post("/production/data/select", { production_data_id })
  },

  // 获取产线列表
  getProductionLineList(params) {
    return request.get("/production/line/list", { params })
  },

  // 查询产线
  selectProductionLine(line_id) {
    return request.post("/production/line/select", { line_id })
  },
}
