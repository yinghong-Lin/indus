import axios from 'axios'

// 获取所有设备基础信息
export const getDevices = () => axios.get('/api/dashboard/devices')

// 获取实时数据
export const getRealtime = (type, deviceId) =>
  axios.get(`/api/dashboard/realtime/${type}/${deviceId}`)

// 获取最近 20 条报警
export const getAlarms = () => axios.get('/api/dashboard/alarms')