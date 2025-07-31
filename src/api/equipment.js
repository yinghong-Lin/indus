import request from './index'

export const equipmentAPI = {
  // 列表分页
  getEquipmentList: (params) =>
    request.get('/productionControl/getEquipmentList', { params }),

  // 搜索分页
  searchEquipment: (params) =>
    request.get('/productionControl/searchEquipment', { params }),

  // 单条详情
  getEquipmentById: (equipment_id) =>
    request.get('/productionControl/getEquipmentById', { params: { equipment_id }}),

  // 新增
  addEquipment: (data) =>
    request.post('/productionControl/addEquipment', data),

  // 删除
  deleteEquipment: (equipment_id) =>
    request.delete('/productionControl/deleteEquipment', { params: { equipment_id }}),

  // 整体更新
  updateEquipment: (data) =>
    request.put('/productionControl/updateEquipment', data),

  // 状态
  updateEquipmentRunStatus: (equipment_id, status) =>
    request.patch('/productionControl/updateEquipmentRunStatus', null, {
      params: { equipment_id, status }
    }),

  // 规格
  updateEquipmentSpec: (equipment_id, data) =>
    request.patch('/productionControl/updateEquipmentSpec', data, {
      params: { equipment_id }
    }),

  // 设置
  updateEquipmentSetting: (equipment_id, data) =>
    request.patch('/productionControl/updateEquipmentSetting', data, {
      params: { equipment_id }
    })
}