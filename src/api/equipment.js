import request from './index'

export const equipmentAPI = {
  // 获取设备
  getEquipmentList: (params) =>
    request.get('/productionControl/getEquipmentList', { params }),

  // 搜索
  searchEquipment: (params) =>
    request.get('/productionControl/searchEquipment', { params }),

  // 单条详情
  getEquipmentById: (equipment_id) =>
    request.get('/productionControl/getEquipmentById', { params: { equipment_id } }),

  // 新增
  addEquipment: (data) =>
    request.post('/productionControl/addEquipment', data),

  // 删除
  deleteEquipment: (equipment_id) =>
    request.delete('/productionControl/deleteEquipment', { params: { equipment_id } }),

  // 整体更新
  updateEquipment: (data) =>
    request.put('/productionControl/updateEquipment', data),

  // 状态
  updateEquipmentRunStatus: (equipment_id, status) =>
    request.patch('/productionControl/updateEquipmentRunStatus', null, {
      params: { equipment_id, status }
    }),

  // 更新规格
  updateEquipmentSpec: (equipment_id, data) =>
    request.patch('/productionControl/updateEquipmentSpec', data, {
      params: { equipment_id }
    }),

  // 更新参数
  updateEquipmentSetting: (equipment_id, data) =>
    request.patch('/productionControl/updateEquipmentSetting', data, {
      params: { equipment_id }
    }),
  // 单个设备添料
  singleDeviceAddSubstance: (equipment_id) =>
    request.post('/productionControl/singleDeviceAddSubstance', null, {
      params: { equipment_id }
    }),

  // 所有设备添料
  allDeviceAddSubstance: (equipment_id) =>
    request.post('/productionControl/allDeviceAddSubstance', null, {
      params: { equipment_id }
    }),
}