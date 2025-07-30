// mock/index.js
import Mock from 'mockjs'

// ===== 通用常量 =====
const faultTypes   = ['mechanical', 'electrical', 'hydraulic', 'control', 'sensor', 'software']
const mainTypes    = ['故障维修', '预防性维护', '应急抢修', '升级改造']
const equipmentMap = {
  1: '注塑机1号',
  2: '喷漆机1号',
  3: '丝印机1号',
  4: '烫金机1号'
}

// ===== 故障相关 =====
// 1. 获取故障列表  GET /fault/records
Mock.mock(/\/fault\/records/, 'get', ({ url }) => {
  const page      = Number(new URL('http://localhost' + url).searchParams.get('page')) || 1
  const pageSize  = 20
  const total     = Mock.Random.integer(50, 200)
  const list      = Array.from({ length: total }, (_, i) => ({
    fault_id: 'F-' + Mock.Random.string('number', 4),
    equipment_id: Mock.Random.integer(1, 4),
    equipment_name: equipmentMap[Mock.Random.integer(1, 4)],
    fault_type: Mock.Random.pick(faultTypes),
    fault_code: Mock.Random.string('upper', 2) + '-' + Mock.Random.string('number', 3),
    fault_description: Mock.Random.sentence(1, 3),
    fault_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    is_resolved: Mock.Random.boolean(),
    resolved_time: null,
    resolved_by: null,
    severity: Mock.Random.pick(['low', 'medium', 'high', 'critical']),
    created_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    updated_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }))
  const start = (page - 1) * pageSize
  return {
    code: 200,
    message: 'success',
    data: list.slice(start, start + pageSize)
  }
})

// 2. 查询 / 新增 / 更新故障  POST /fault/select
let faultStore = [] // 简易内存缓存
Mock.mock('/fault/select', 'post', ({ body }) => {
  const json = JSON.parse(body)
  // 存在 fault_id => 更新
  if (json.fault_id) {
    const idx = faultStore.findIndex(f => f.fault_id === json.fault_id)
    if (idx > -1) Object.assign(faultStore[idx], json)
    else faultStore.push({ ...json, fault_id: json.fault_id })
  } else {
    // 新增
    const newFault = {
      ...json,
      fault_id: Mock.Random.string('lower', 8) + '-' + Mock.Random.string('lower', 12),
      created_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updated_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
    faultStore.unshift(newFault)
  }
  return { code: 200, message: 'success', data: null }
})

// 3. 删除故障  DELETE /fault/delete
Mock.mock('/fault/delete', 'delete', ({ body }) => {
  const { fault_id } = JSON.parse(body)
  faultStore = faultStore.filter(f => f.fault_id !== fault_id)
  return { code: 200, message: '已删除', data: { fault_id } }
})

// ===== 维修记录相关 =====
// 1. 获取维修列表  GET /maintenance/list
Mock.mock(/\/maintenance\/list/, 'get', ({ url }) => {
  const page     = Number(new URL('http://localhost' + url).searchParams.get('page')) || 1
  const pageSize = 20
  const total    = Mock.Random.integer(50, 200)
  const list     = Array.from({ length: total }, () => ({
    maintenance_id: 'M-' + Mock.Random.string('number', 6),
    equipment_id: Mock.Random.integer(1, 4),
    equipment_name: equipmentMap[Mock.Random.integer(1, 4)],
    fault_code: Mock.Random.boolean() ? Mock.Random.string('upper', 2) + '-' + Mock.Random.string('number', 3) : null,
    fault_description: Mock.Random.sentence(10, 30),
    maintenance_type: Mock.Random.pick(mainTypes),
    maintenance_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    maintenance_measures: Mock.Random.sentence(10, 30),
    created_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    updated_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }))
  const start = (page - 1) * pageSize
  return {
    code: 200,
    message: 'success',
    data: list.slice(start, start + pageSize)
  }
})

// 2. 创建维修  POST /maintenance/create
let recordStore = []
Mock.mock('/maintenance/create', 'post', ({ body }) => {
  const json = JSON.parse(body)
  const newRecord = {
    ...json,
    maintenance_id: 'M-' + Mock.Random.string('number', 6),
    created_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    updated_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
  recordStore.unshift(newRecord)
  return { code: 200, message: '创建成功', data: newRecord }
})

// 3. 查询维修详情  POST /maintenance/select
Mock.mock('/maintenance/select', 'post', ({ body }) => {
  const { maintenance_id } = JSON.parse(body)
  const item = recordStore.find(r => r.maintenance_id === maintenance_id) || Mock.mock({
    maintenance_id,
    equipment_id: Mock.Random.integer(1, 4),
    equipment_name: equipmentMap[Mock.Random.integer(1, 4)],
    fault_code: Mock.Random.string('upper', 2) + '-' + Mock.Random.string('number', 3),
    fault_description: Mock.Random.sentence(10, 30),
    maintenance_type: Mock.Random.pick(mainTypes),
    maintenance_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    maintenance_measures: Mock.Random.sentence(10, 30),
    created_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    updated_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  })
  return { code: 200, message: 'success', data: item }
})

// 4. 更新维修  POST /maintenance/update
Mock.mock('/maintenance/update', 'post', ({ body }) => {
  const json = JSON.parse(body)
  const idx = recordStore.findIndex(r => r.maintenance_id === json.maintenance_id)
  if (idx > -1) Object.assign(recordStore[idx], json)
  return { code: 200, message: '更新成功', data: json }
})

// 5. 删除维修  DELETE /maintenance/delete
Mock.mock('/maintenance/delete', 'delete', ({ body }) => {
  const { maintenance_id } = JSON.parse(body)
  recordStore = recordStore.filter(r => r.maintenance_id !== maintenance_id)
  return { code: 200, message: '已删除', data: { maintenance_id } }
})

export default {}