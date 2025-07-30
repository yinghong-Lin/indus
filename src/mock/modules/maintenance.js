import Mock from 'mockjs'

/* ========== 基础假数据 ========== */
const equipmentMap = {
  1: '注塑机1号',
  2: '喷漆机1号',
  3: '丝印机1号',
  4: '烫金机1号'
}

let faults = Mock.mock({
  'list|5-8': [{
    'fault_id|+1': 1000,
    'equipment_id|1-4': 1,
    equipment_name: '@pick(["注塑机1号","喷漆机1号","丝印机1号","烫金机1号"])',
    'fault_code': /F-\d{3}/,
    fault_description: '@cparagraph(1)',
    fault_time: '@datetime',
    'is_resolved|1-2': false
  }]
}).list

let records = Mock.mock({
  'list|6-10': [{
    'maintenance_id|+1': 2000,
    'equipment_id|1-4': 1,
    equipment_name: '@pick(["注塑机1号","喷漆机1号","丝印机1号","烫金机1号"])',
    'fault_id|1000-1010': 1000,
    fault_code: /F-\d{3}/,
    fault_description: '@cparagraph(1)',
    maintenance_type: '@pick(["故障维修","预防性维护"])',
    maintenance_time: '@datetime',
    maintenance_measures: '@cparagraph(2)'
  }]
}).list

/* 让 equipment_name 与 equipment_id 保持一致 */
faults.forEach(f => { f.equipment_name = equipmentMap[f.equipment_id] })
records.forEach(r => { r.equipment_name = equipmentMap[r.equipment_id] })

/* ========== Mock 规则 ========== */

// 1. 列表（支持 type=fault / type=maintenance）
Mock.mock(/\/maintenance\/list/, 'get', ({ url }) => {
  const type = new URL('http://localhost' + url).searchParams.get('type')
  return {
    code: 200,
    message: 'success',
    data: type === 'fault' ? faults : records
  }
})

// 2. 创建
Mock.mock('/maintenance/create', 'post', ({ body }) => {
  const data = JSON.parse(body)
  if (data.type === 'fault') {
    faults.unshift({
      ...data,
      fault_id: Mock.mock('@id'),
      fault_time: new Date().toISOString(),
      is_resolved: false
    })
  } else {
    records.unshift({
      ...data,
      maintenance_id: Mock.mock('@id'),
      maintenance_time: new Date().toISOString()
    })
  }
  return { code: 200, message: '创建成功' }
})

// 3. 查询单条
Mock.mock('/maintenance/select', 'post', ({ body }) => {
  const { maintenance_id } = JSON.parse(body)
  const item = [...faults, ...records].find(i => i.maintenance_id === maintenance_id || i.fault_id === maintenance_id)
  if (!item) return { code: 404, message: '未找到' }
  return { code: 200, data: item }
})

// 4. 更新（目前只演示修改故障状态）
Mock.mock('/maintenance/update', 'post', ({ body }) => {
  const { maintenance_id, is_resolved } = JSON.parse(body)
  const f = faults.find(i => i.fault_id === maintenance_id)
  if (f) f.is_resolved = is_resolved
  return { code: 200, message: '更新成功' }
})

// 5. 删除
Mock.mock('/maintenance/delete', 'delete', ({ body }) => {
  const { maintenance_id } = JSON.parse(body)
  faults  = faults.filter(f => f.fault_id !== maintenance_id)
  records = records.filter(r => r.maintenance_id !== maintenance_id)
  return { code: 200, message: '删除成功' }
})

export default Mock