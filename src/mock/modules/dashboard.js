import Mock from 'mockjs'

/* ------------------ 常量 ------------------ */
const equipmentTypes = {
  IM: '注塑机',
  PT: '喷漆机',
  SS: '丝印机',
  HS: '烫金机',
}

const equipmentStatuses = ['运行中', '维修中', '故障', '停机']
const alarmLevels = ['致命', '严重', '警告', '提示']

/* ------------------ 生成器 ------------------ */
const generateDashboardDevices = () => {
  const devices = []
  const types = Object.keys(equipmentTypes)

  types.forEach((type) => {
    for (let i = 1; i <= 3; i++) {
      const id = `${type}${String(i).padStart(3, '0')}`
      devices.push({
        equipment_id: id,
        equipment_name: `${equipmentTypes[type]}${i}号`,
        equipment_type: equipmentTypes[type],
        equipment_status: Mock.Random.pick(equipmentStatuses),
        location: `${equipmentTypes[type]}车间${String.fromCharCode(64 + i)}-${String(i).padStart(2, '0')}`,
      })
    }
  })
  return devices
}

const generateAlarms = () =>
  Array.from({ length: 20 }, () => ({
    alarm_id: Mock.Random.id(),
    alarm_code: Mock.Random.string('upper', 4, 6),
    alarm_detail: Mock.Random.csentence(5, 10),
    alarm_level: Mock.Random.pick(alarmLevels),
    alarm_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
  }))

const generateRealtimeData = () =>
  Array.from({ length: 60 }, (_, i) => [
    new Date(Date.now() - (59 - i) * 60 * 1000),
    Mock.Random.integer(10, 100),
  ])

/* ------------------ mock 数据 ------------------ */
const dashboardDevices = generateDashboardDevices()
const dashboardAlarms = generateAlarms()

/* ------------------ 接口拦截 ------------------ */
// 1. 设备列表
Mock.mock('/api/dashboard/devices', 'get', () => ({
  code: 200,
  message: 'success',
  data: dashboardDevices,
}))

// 2. 报警列表（最近 20 条）
Mock.mock('/api/dashboard/alarms', 'get', () => ({
  code: 200,
  message: 'success',
  data: dashboardAlarms,
}))

// 3. 单设备实时趋势（60 分钟）
Mock.mock(/\/api\/dashboard\/realtime\/\w+\/\w+/, 'get', () => ({
  code: 200,
  message: 'success',
  data: generateRealtimeData(),
}))

console.log('✅ Dashboard mock loaded')