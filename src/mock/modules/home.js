import Mock from "mockjs"
import dayjs from "dayjs"

// 设备类型映射（与文档定义完全一致）
const equipmentTypeMap = {
  hot_stamping: "烫金机",
  injection_molding: "注塑机",
  spray_painting: "喷漆机",
  screen_printing: "丝印机",
}

// 设备状态集合（文档明确的三种状态）
const equipmentStatusList = ["OFF", "ON_IDLE", "ON_RUNNING"]

// 模拟设备数据（严格匹配文档返回字段）
const mockEquipmentList = []
for (const type in equipmentTypeMap) {
  // 每种设备生成1-3台（文档示例包含各类型设备）
  for (let i = 1; i <= Mock.Random.natural(1, 3); i++) {
    mockEquipmentList.push({
      equipment_id: Mock.Random.guid(), // 文档示例中的UUID格式
      equipment_name: `${equipmentTypeMap[type]}${i}号`, // 与文档示例命名规则一致
      equipment_status: Mock.Random.pick(equipmentStatusList), // 文档定义的状态值
      equipment_type: type // 文档定义的类型标识
    })
  }
}

// 模拟生产任务数据（完全遵循文档响应结构）
const mockProductionTasks = Mock.mock({
  "tasks|3-5": [
    {
      task_id: "@guid",
      task_name: () => {
        const products = ["智能手机X", "智能手表Y", "无线耳机B", "平板电脑A"]
        return `${Mock.Random.pick(products)}生产线-第${Mock.Random.natural(1, 5)}批次`
      },
      product_name: () => Mock.Random.pick(["智能手机X", "智能手表Y", "无线耳机B", "平板电脑A"]),
      production_quantity: Mock.Random.natural(200, 1200), // 文档示例中的数量范围
      production_progress: () => Mock.Random.natural(1, 99) / 100, // 整数百分比转换为小数
      task_priority: Mock.Random.natural(1, 2), // 文档示例中存在的优先级
      start_time: dayjs(Mock.Random.datetime()).format("YYYY-MM-DDTHH:mm:ss"), // 文档中的ISO格式
      end_time: dayjs(Mock.Random.datetime()).add(Mock.Random.natural(6, 24), "hour").format("YYYY-MM-DDTHH:mm:ss"),
      actual_end_time: null, // 文档示例中未完成任务的该字段为null
      task_status: "in_progress", // 文档定义的任务状态
      created_at: dayjs(Mock.Random.datetime()).subtract(Mock.Random.natural(1, 3), "day").format("YYYY-MM-DDTHH:mm:ss"),
      updated_at: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    }
  ]
}).tasks

// 1. 模拟GET根据类型获取设备名及运行状态接口（文档第一接口）
Mock.mock(/\/home\/getEquipmentNameAndStatusByType/, "get", ({ url }) => {
  const params = new URLSearchParams(url.split("?")[1])
  const equipment_type = params.get("equipment_type") || "all"
  
  let filteredData = [...mockEquipmentList]
  // 按文档定义的类型筛选（all返回全部，其他类型返回对应设备）
  if (equipment_type !== "all" && Object.keys(equipmentTypeMap).includes(equipment_type)) {
    filteredData = filteredData.filter(item => item.equipment_type === equipment_type)
  }
  
  // 严格返回文档定义的字段（无额外扩展字段）
  return {
    code: 200,
    msg: "获取成功", // 与文档响应消息一致
    data: filteredData
  }
})

// 2. 模拟PATCH一键更改设备运行状态接口（文档第二接口）
Mock.mock(/\/home\/updateAllEquipmentStatus/, "patch", ({ url }) => {
  const params = new URLSearchParams(url.split("?")[1])
  const equipment_status = params.get("equipment_status")
  
  // 校验状态是否为文档定义的有效值
  if (!equipmentStatusList.includes(equipment_status)) {
    return {
      code: 400,
      msg: "无效的设备状态",
      data: false
    }
  }
  
  // 更新所有设备状态（模拟接口副作用）
  mockEquipmentList.forEach(equipment => {
    equipment.equipment_status = equipment_status
  })
  
  // 响应格式与文档示例完全一致
  return {
    code: 200,
    msg: `已将所有设备状态更新为${equipment_status}`, // 文档示例中的消息格式
    data: true
  }
})

// 3. 模拟GET获取运行中任务列表接口（文档第三接口）
Mock.mock(/\/home\/getInProgressProductionTask/, "get", () => {
  // 模拟任务进度动态更新（保持整数百分比）
  mockProductionTasks.forEach(task => {
    if (task.production_progress < 0.95) {
      const increase = Mock.Random.natural(1, 5) / 100
      task.production_progress = Math.min(
        task.production_progress + increase,
        0.99
      )
      // 确保进度为整数百分比对应的小数（如65% → 0.65）
      task.production_progress = Math.floor(task.production_progress * 100) / 100
    }
    task.updated_at = dayjs().format("YYYY-MM-DDTHH:mm:ss")
  })
  
  // 响应结构与文档示例完全匹配
  return {
    code: 200,
    msg: "获取成功",
    data: mockProductionTasks
  }
})

console.log("[Mock] 主页面接口模拟已启动")