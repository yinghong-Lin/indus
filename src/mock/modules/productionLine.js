import Mock from "mockjs"

// 模拟设备数据
const generateEquipment = () => {
  const equipmentList = [
    "注塑机", "丝印机", "喷漆机", "烫金机",
  ]
  const equipment = []
  equipmentList.forEach((name, index) => {
    equipment.push({
      equipment_id: Mock.Random.guid(),
      equipment_name: `${name}${index + 1}`
    })
  })
  return equipment
}
const equipmentData = generateEquipment()

// 产线基础配置（仅保留两种状态）
const lineStatuses = ["未运行", "运行中"] 
const lineTypes = ["装配线"]

// 初始产线数据
const productionLines = [
  {
    line_id: "3dec489d-23e8-41b2-a89a-a89b647e22ee",
    line_name: "智能装配线A",
    line_type: "装配线",
    line_status: "未运行", // 默认状态为未运行
    created_at: "2025-08-09T20:34:21",
    updated_at: "2025-08-09T20:39:48",
    process_steps: [
      {
        step_name: "零件预装",
        step_order: 1,
        step_description: "自动装配基础零件",
        equipment: [equipmentData[0].equipment_id, equipmentData[1].equipment_id]
      },
      {
        step_name: "质量检测",
        step_order: 2,
        step_description: "视觉系统自动检测",
        equipment: [equipmentData[2].equipment_id]
      }
    ]
  }
]

// 获取产线列表
Mock.mock(/\/api\/productionLine\/getProductLineList/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const page = Number(u.searchParams.get("page") || 1)
  const page_size = Number(u.searchParams.get("page_size") || 10)

  const start = (page - 1) * page_size
  const end = start + page_size
  const list = productionLines.slice(start, end)

  return {
    code: 200,
    msg: "获取产线列表成功",
    data: {
      ProductionLines: list.map(line => ({
        line_id: line.line_id,
        line_name: line.line_name,
        line_type: line.line_type,
        line_status: line.line_status,
        created_at: line.created_at,
        updated_at: line.updated_at
      })),
      pagination: {
        total: productionLines.length,
        page,
        page_size,
        total_pages: Math.ceil(productionLines.length / page_size)
      }
    }
  }
})

// 根据ID获取产线详情
Mock.mock(/\/api\/productionLine\/getProductionLineById/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const line_id = u.searchParams.get("line_id")

  const line = productionLines.find(item => item.line_id === line_id)
  if (line) {
    // 补充设备名称
    const stepsWithEquipmentNames = line.process_steps.map(step => ({
      ...step,
      equipment_names: step.equipment.map(equipId => {
        const equip = equipmentData.find(e => e.equipment_id === equipId)
        return equip ? equip.equipment_name : `未知设备(${equipId})`
      })
    }))
    return {
      code: 200,
      msg: "获取成功",
      data: { ...line, process_steps: stepsWithEquipmentNames }
    }
  }
  return { code: 404, msg: "产线不存在", data: null }
})

// 新增产线
Mock.mock(/\/api\/productionLine\/addProductionLine/, "post", ({ body }) => {
  try {
    const data = JSON.parse(body)
    if (!data.line_name || !data.line_type || !data.process_steps) {
      return { code: 400, msg: "缺少必填字段", data: null }
    }

    const newLine = {
      line_id: Mock.Random.guid(),
      line_status: "未运行", // 新增产线默认状态
      created_at: new Date().toISOString().slice(0, 19),
      updated_at: new Date().toISOString().slice(0, 19),
      ...data
    }
    productionLines.unshift(newLine)

    return {
      code: 200,
      msg: "创建产线成功",
      data: {
        line_id: newLine.line_id,
        line_name: newLine.line_name,
        line_type: newLine.line_type,
        line_status: newLine.line_status,
        created_at: newLine.created_at,
        updated_at: newLine.updated_at
      }
    }
  } catch (error) {
    return { code: 500, msg: "服务器错误", data: null }
  }
})

// 删除产线
Mock.mock(/\/api\/productionLine\/deleteProductionLine/, "delete", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const line_id = u.searchParams.get("line_id")

  const index = productionLines.findIndex(item => item.line_id === line_id)
  if (index > -1) {
    productionLines.splice(index, 1)
    return { code: 200, msg: "删除产线成功", data: true }
  }
  return { code: 404, msg: "产线不存在", data: false }
})

// 更新产线状态（修复参数解析逻辑）
Mock.mock(/\/api\/productionLine\/updateProductionLineStatus/, "put", ({ url }) => {
  // 正确解析URL参数
  const u = new URL("http://localhost" + url)
  const line_id = u.searchParams.get("line_id")
  const status = u.searchParams.get("status")

  // 验证状态是否合法
  if (!lineStatuses.includes(status)) {
    return { code: 400, msg: "不支持的状态值", data: false }
  }

  const line = productionLines.find(item => item.line_id === line_id)
  if (line) {
    line.line_status = status
    line.updated_at = new Date().toISOString().slice(0, 19)
    return { 
      code: 200, 
      msg: "状态更新成功", 
      data: { // 返回更新后的完整数据（符合接口文档）
        line_id: line.line_id,
        line_name: line.line_name,
        line_type: line.line_type,
        line_status: line.line_status,
        created_at: line.created_at,
        updated_at: line.updated_at
      }
    }
  }
  return { code: 404, msg: "产线不存在", data: false }
})

// 设备搜索接口
Mock.mock(/\/api\/productionControl\/searchEquipment/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const keyword = u.searchParams.get("keyword") || ""

  const filtered = equipmentData.filter(equip => 
    equip.equipment_name.toLowerCase().includes(keyword.toLowerCase())
  )
  return {
    code: 200,
    msg: "搜索设备成功",
    data: { equipments: filtered, total: filtered.length }
  }
})

console.log("[Mock] 产线接口（含设备模拟）已启动")