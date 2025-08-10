import request from './index'

// 严格遵循产线.docx文档定义的接口
export const productionLineAPI = {
  // 获取产线列表
  getProductionLineList: (params) => 
    request.get('/productionLine/getProductLineList', { params }),

  // 根据ID获取产线详情（用于查看功能）
  getProductionLineById: (line_id) => 
    request.get('/productionLine/getProductionLineById', { params: { line_id } }),

  // 新增产线
  addProductionLine: (data) => 
    request.post('/productionLine/addProductionLine', data),

  // 删除产线
  deleteProductionLine: (line_id) => 
    request.delete('/productionLine/deleteProductionLine', { params: { line_id } }),

  // 更新产线状态
  updateProductionLineStatus: (line_id, status) => 
    request.put('/productionLine/updateProductionLineStatus', null, { 
      params: { line_id, status } 
    })
}