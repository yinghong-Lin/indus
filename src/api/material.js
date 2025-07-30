import request from "./index"

export const materialAPI = {
  // 获取原料列表
  getMaterialList(params) {
    return request.get("/material/list", { params })
  },

  // 创建原料
  createMaterial(materialData) {
    return request.post("/material/create", materialData)
  },

  // 查询原料
  selectMaterial(material_name) {
    return request.post("/material/select", { material_name })
  },

  // 更新原料
  updateMaterial(materialData) {
    return request.post("/material/update", materialData)
  },

  // 删除原料
  deleteMaterial(material_name) {
    return request.delete("/material/delete", { data: { material_name } })
  },
}
