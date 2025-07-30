import Mock from 'mockjs'

/* 1. 设备列表 */
Mock.mock('/api/devices', 'get', {
  code: 200,
  data: [
    { equipment_id: 1, equipment_name: '注塑机-1#', equipment_type: 'injection', equipment_status: 'normal', location: '注塑车间-A' },
    { equipment_id: 2, equipment_name: '注塑机-2#', equipment_type: 'injection', equipment_status: 'fault',   location: '注塑车间-A' },
    { equipment_id: 3, equipment_name: '丝印机-1#', equipment_type: 'screen',    equipment_status: 'normal',  location: '丝印车间-B' },
    { equipment_id: 4, equipment_name: '丝印机-2#', equipment_type: 'screen',    equipment_status: 'repair',  location: '丝印车间-B' },
    { equipment_id: 5, equipment_name: '喷漆机-1#', equipment_type: 'spray',     equipment_status: 'normal',  location: '喷漆车间-C' },
    { equipment_id: 6, equipment_name: '烫金机-1#', equipment_type: 'hot',       equipment_status: 'normal',  location: '烫金车间-D' }
  ]
})

/* 2. 报警列表 */
Mock.mock('/api/alarms', 'get', {
  code: 200,
  'data|10-15': [{
    alarm_code: '@upper(@word(3,5))',
    alarm_detail: '@sentence(3,5)',
    alarm_level: '@pick(["警告","严重","致命"])',
    alarm_time: '@datetime'
  }]
})

/* 3. 实时趋势（支持任何 type 与 id） */
Mock.mock(/\/api\/trend\/\w+\/\d+/, 'get', options => {
  // 解析路径参数
  const [, type, id] = options.url.match(/\/api\/trend\/(\w+)\/(\d+)/)
  // 生成 60 个点，1 分钟间隔
  const points = []
  for (let i = 60; i >= 0; i--) {
    // 根据设备类型给不同基线
    const base = type === 'injection' ? 200
               : type === 'screen'    ? 80
               : type === 'spray'     ? 0.5
               : 180
    points.push([
      new Date(Date.now() - i * 60_000),
      +(base + (Math.random() - 0.5) * 20).toFixed(2)
    ])
  }
  return { code: 200, data: points }
})

/* 4. 如有其它接口，继续往下写...
   Mock.mock('/api/xxx', 'post', {...})
*/

console.log('[Mock] 规则注册完成')