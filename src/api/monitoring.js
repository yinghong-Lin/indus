import request from './index'
export const monitoringAPI = {
  // 获取设备最晚实时数据接口 (HTTP GET)
  getLastRealtimeData: (equipment_id) =>
    request.get('/productionMonitor/getLastRealtimeData', { params: { equipment_id } }),
  // 获取报警记录列表接口
  getAlarmList: (page = 1, page_size = 10) =>
    request.get('/productionMonitor/getAlarmList', { params: { page, page_size } }),
  // 根据id获取报警记录信息接口
  getAlarmById: (alarm_id) => request.get('/productionMonitor/getAlarmById', { params: { alarm_id } }),
  // 删除报警记录接口
  deleteAlarm: (alarm_id) => request.delete('/productionMonitor/deleteAlarm', { params: { alarm_id } }),
  // 更新报警记录级别
  updateAlarmLevel: (alarm_id, level) =>
    request.patch('/productionMonitor/updateAlarmLevel', null, { params: { alarm_id, level } }),
  // 更新报警记录状态
  updateAlarmStatus: (alarm_id, status) =>
    request.patch('/productionMonitor/updateAlarmStatus', null, { params: { alarm_id, status } }),
  // 根据设备类型获取设备运行状况接口
  getEquipmentStatusByType: (equipment_type = 'all') =>
    request.get('/productionMonitor/getEquipmentStatusByType', { params: { equipment_type } }),
  // 单个设备添料接口
  addSubstanceToDevice: (equipment_id) =>
    request.post('/productionMonitor/singleDeviceAddSubstance', null, { params: { equipment_id } })
};