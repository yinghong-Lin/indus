import Mock from 'mockjs'

const tasks = Mock.mock({
  'list|10-15': [{
    id: '@id',
    task_id: 'TASK-@datetime("YYYYMMDDHHmmss")',
    task_name: '@ctitle(4,8)',
    product_id: '@pick(["prod-001","prod-002"])',
    product_name: '@pick(["化妆品包装盒","注塑件"])',
    production_quantity: '@integer(500,5000)',
    task_priority: '@pick(["high","medium","low"])',
    leader: '@cname',
    start_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    end_time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    remark: '@cparagraph(1)',
    task_status: '@pick(["pending","running","completed"])'
  }]
}).list

// 接口规则
Mock.mock('/task/list', 'get', () => ({ code: 200, data: tasks }))
Mock.mock('/task/detail', 'post', ({ body }) => {
  const { task_id } = JSON.parse(body)
  const task = tasks.find(t => t.id === task_id || t.task_id === task_id)
  return task ? { code: 200, data: task } : { code: 404, message: '未找到' }
})
Mock.mock('/task/create', 'post', ({ body }) => {
  const data = JSON.parse(body)
  // 编辑 or 新增
  const idx = tasks.findIndex(t => t.task_id === data.task_id)
  if (idx > -1) {
    Object.assign(tasks[idx], data)
  } else {
    tasks.unshift({ id: Mock.mock('@id'), ...data })
  }
  return { code: 200, message: 'success' }
})

export default Mock