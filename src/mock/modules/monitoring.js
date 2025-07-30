import Mock from 'mockjs'

/* ======== 基础常量 ======== */
const TYPES = ['注塑机', '喷漆机', '丝印机', '烫金机']
const STATUS = ['正常', '故障', '维修中', '停机']
const LEVELS = ['warning', 'serious', 'critical']

/* ======== 1. 工艺参数 ======== */
const processParams = Mock.mock({
  注塑机: {
    setting_id: 1,
    heating_temp_range: '180~230 ℃',
    injection_pressure: '@float(110,130,1,1)',
    injection_speed: '@integer(75,85)',
    screw_speed: '@integer(115,125)',
    holding_pressure: '@float(78,82,1,1)'
  },
  喷漆机: {
    setting_id: 2,
    spray_pressure: '@float(0.45,0.55,1,2)',
    spray_distance: '@integer(190,210)',
    spray_speed: '@float(1.1,1.3,1,1)',
    drying_temp: '@integer(65,75)'
  },
  丝印机: {
    setting_id: 3,
    printing_pressure: '@float(0.55,0.65,1,2)',
    printing_speed: '@float(0.9,1.1,1,1)',
    ink_viscosity: '@float(11.5,13.5,1,1)',
    ink_drying_time: '@integer(28,32)'
  },
  烫金机: {
    setting_id: 4,
    stamping_temp_range: '160~200 ℃',
    stamping_pressure_range: '1.5~2.0 MPa',
    stamping_time_range: '1.0~2.0 s',
    foil_speed_range: '4~6 m/min'
  }
})

/* ======== 2. 实时设备 ======== */
const realtimeDevices = []
TYPES.forEach(type => {
  const count = Mock.mock('@integer(2,4)') // 每类 2~4 台
  for (let i = 1; i <= count; i++) {
    const base = {
      device_id: `${type}-${i.toString().padStart(2, '0')}`,
      device_name: `${type}${i}号`,
      type,
      status: Mock.Random.pick(STATUS),
      collection_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
    switch (type) {
      case '注塑机':
        base.data = {
          温度: `${Mock.mock('@integer(180,230)')}℃`,
          压力: `${Mock.mock('@float(110,130,1,1)')} MPa`,
          速度: `${Mock.mock('@integer(75,85)')} mm/s`
        }
        break
      case '喷漆机':
        base.data = {
          压力: `${Mock.mock('@float(0.4,0.6,1,2)')} MPa`,
          距离: `${Mock.mock('@integer(190,210)')} mm`,
          温度: `${Mock.mock('@integer(65,75)')}°C`
        }
        break
      case '丝印机':
        base.data = {
          压力: `${Mock.mock('@float(0.5,0.7,1,2)')} MPa`,
          速度: `${Mock.mock('@float(0.9,1.1,1,1)')} m/s`,
          粘度: `${Mock.mock('@float(11,14,1,1)')} Pa·s`
        }
        break
      case '烫金机':
        base.data = {
          温度: `${Mock.mock('@integer(160,200)')}°C`,
          压力: `${Mock.mock('@float(1.5,2.0,1,1)')} MPa`,
          时间: `${Mock.mock('@float(1.0,2.0,1,1)')} s`
        }
        break
    }
    realtimeDevices.push(base)
  }
})

/* ======== 3. 报警记录 ======== */
const alarms = Mock.mock({
  'list|8-12': [{
    alarm_id: '@id',
    alarm_code: /AL\d{3}/,
    alarm_detail: '@cparagraph(1)',
    alarm_level: () => Mock.Random.pick(LEVELS),
    alarm_time: '@datetime'
  }]
}).list

/* ======== 4. 设备状态（可合并到 realtime） ======== */
const deviceStatus = realtimeDevices.reduce((acc, cur) => {
  acc[cur.device_id] = cur.status
  return acc
}, {})

/* ======== 5. 生产数据（分页） ======== */
const productionData = (params = {}) => {
  const page = Number(params.page) || 1
  const page_size = Number(params.page_size) || 10
  const total = 50
  const list = Mock.mock({
    [`list|${page_size}`]: [{
      id: '@id',
      device_name: '@pick(TYPES)@integer(1,4)号',
      product_code: /P[A-Z]\d{4}/,
      plan_qty: '@integer(1000,2000)',
      actual_qty: '@integer(800,2200)',
      pass_rate: '@float(85,99,1,1)',
      start_time: '@datetime',
      end_time: '@datetime'
    }]
  }).list
  return {
    list,
    total,
    page,
    page_size,
    total_pages: Math.ceil(total / page_size)
  }
}

/* ========= Mock 规则 ========= */
Mock.mock('/monitoring/process-parameters', 'get', () => ({ code: 200, data: processParams }))
Mock.mock('/monitoring/realtime', 'get', () => ({ code: 200, data: realtimeDevices }))
Mock.mock('/monitoring/alarms', 'get', () => ({ code: 200, data: alarms }))
Mock.mock('/monitoring/device-status', 'get', () => ({ code: 200, data: deviceStatus }))
Mock.mock(/\/monitoring\/production-data/, 'get', ({ url }) => {
  const params = Object.fromEntries(new URL('http://localhost' + url).searchParams.entries())
  return { code: 200, data: productionData(params) }
})

export default Mock