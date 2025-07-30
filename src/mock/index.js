import Mock from "mockjs"

// 设备类型映射
const equipmentTypes = {
  IM: "注塑机",
  PT: "喷漆机",
  SS: "丝印机",
  HS: "烫金机",
}

// 设备状态
const equipmentStatuses = ["running", "warning", "stopped", "maintenance"]

// 故障类型
const faultTypes = ["mechanical", "electrical", "hydraulic", "control", "sensor"]

// 任务优先级
const taskPriorities = ["low", "medium", "high", "urgent"]

// 任务状态
const taskStatuses = ["pending", "running", "completed", "cancelled"]

// 报警级别
const alarmLevels = ["warning", "serious", "critical"]

// 生成设备数据
const generateEquipment = () => {
  const equipment = []
  const types = ["IM", "PT", "SS", "HS"]

  types.forEach((type) => {
    for (let i = 1; i <= 2; i++) {
      const id = `${type}${String(i).padStart(3, "0")}`
      equipment.push({
        equipment_id: id,
        equipment_name: `${equipmentTypes[type]}${i}号`,
        equipment_type: equipmentTypes[type],
        equipment_status: Mock.Random.pick(equipmentStatuses),
        location: `${equipmentTypes[type]}车间${String.fromCharCode(64 + i)}-${String(i).padStart(2, "0")}`,
        manufacturer: Mock.Random.pick(["海天国际", "震雄集团", "伊之密", "博创智能"]),
        model: Mock.Random.string("upper", 3, 5) + Mock.Random.natural(100, 999),
        purchase_date: Mock.Random.date("yyyy-MM-dd"),
        warranty_date: Mock.Random.date("yyyy-MM-dd"),
        spec: generateEquipmentSpec(type),
        parameters: generateEquipmentParameters(type),
        realtime: generateRealtimeData(type),
        maintenance_records: generateMaintenanceRecords(),
      })
    }
  })

  return equipment
}

// 生成设备规格
const generateEquipmentSpec = (type) => {
  switch (type) {
    case "IM":
      return {
        max_clamping_force: Mock.Random.natural(1200, 2000),
        injection_volume: Mock.Random.natural(300, 600),
        heating_power: Mock.Random.natural(10, 20),
        max_injection_pressure: Mock.Random.natural(150, 250),
        screw_diameter: Mock.Random.natural(35, 55),
      }
    case "PT":
      return {
        max_spray_pressure: Mock.Random.float(0.5, 1.0, 1, 1),
        spray_width: Mock.Random.natural(200, 400),
        drying_power: Mock.Random.natural(5, 12),
        paint_capacity: Mock.Random.natural(50, 100),
      }
    case "SS":
      return {
        max_printing_pressure: Mock.Random.float(0.8, 1.5, 1, 1),
        printing_area: `${Mock.Random.natural(150, 250)}x${Mock.Random.natural(200, 350)}`,
        max_speed: Mock.Random.natural(40, 80),
        ink_capacity: Mock.Random.natural(20, 50),
      }
    case "HS":
      return {
        max_stamping_temp: Mock.Random.natural(180, 250),
        max_pressure: Mock.Random.natural(2000, 4000),
        stamping_area: `${Mock.Random.natural(100, 200)}x${Mock.Random.natural(150, 250)}`,
        foil_width: Mock.Random.natural(100, 300),
      }
    default:
      return {}
  }
}

// 生成设备参数
const generateEquipmentParameters = (type) => {
  switch (type) {
    case "IM":
      return {
        heating_temp_range: `${Mock.Random.natural(180, 200)}-${Mock.Random.natural(220, 250)}℃`,
        injection_pressure: Mock.Random.natural(100, 150),
        injection_speed: Mock.Random.natural(60, 100),
        screw_speed: Mock.Random.natural(80, 150),
        holding_pressure: Mock.Random.float(60, 100, 1, 1),
      }
    case "PT":
      return {
        spray_pressure: Mock.Random.float(0.3, 0.7, 1, 2),
        spray_distance: Mock.Random.natural(150, 250),
        spray_speed: Mock.Random.float(0.8, 1.5, 1, 1),
        drying_temp: Mock.Random.natural(60, 80),
      }
    case "SS":
      return {
        printing_pressure: Mock.Random.float(0.4, 0.8, 1, 2),
        printing_speed: Mock.Random.float(0.6, 1.2, 1, 1),
        ink_viscosity: Mock.Random.float(10, 16, 1, 1),
        ink_drying_time: Mock.Random.natural(20, 40),
      }
    case "HS":
      return {
        stamping_temp_range: `${Mock.Random.natural(150, 170)}-${Mock.Random.natural(180, 200)}℃`,
        stamping_pressure_range: `${Mock.Random.float(1.2, 1.8, 1, 1)}-${Mock.Random.float(1.8, 2.5, 1, 1)}MPa`,
        stamping_time_range: `${Mock.Random.float(0.8, 1.2, 1, 1)}-${Mock.Random.float(1.5, 2.5, 1, 1)}s`,
        foil_speed_range: `${Mock.Random.natural(3, 5)}-${Mock.Random.natural(6, 8)}m/min`,
      }
    default:
      return {}
  }
}

// 生成实时数据
const generateRealtimeData = (type) => {
  const baseData = {
    collection_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
  }

  switch (type) {
    case "IM":
      return {
        ...baseData,
        heating_temp_range: `${Mock.Random.natural(180, 200)}-${Mock.Random.natural(210, 230)}℃`,
        injection_pressure: Mock.Random.float(100, 130, 1, 1),
        injection_speed: Mock.Random.natural(70, 90),
        screw_speed: Mock.Random.natural(100, 130),
        efficiency: Mock.Random.natural(80, 95),
      }
    case "PT":
      return {
        ...baseData,
        spray_pressure: Mock.Random.float(0.4, 0.6, 1, 2),
        spray_distance: Mock.Random.natural(180, 220),
        spray_speed: Mock.Random.float(1.0, 1.3, 1, 1),
        drying_temp: Mock.Random.natural(65, 75),
        efficiency: Mock.Random.natural(80, 95),
      }
    case "SS":
      return {
        ...baseData,
        printing_pressure: Mock.Random.float(0.5, 0.7, 1, 2),
        printing_speed: Mock.Random.float(0.8, 1.1, 1, 1),
        ink_viscosity: Mock.Random.float(11, 14, 1, 1),
        ink_drying_time: Mock.Random.natural(25, 35),
        efficiency: Mock.Random.natural(80, 95),
      }
    case "HS":
      return {
        ...baseData,
        stamping_temp: Mock.Random.natural(160, 180),
        stamping_pressure: Mock.Random.float(1.5, 2.0, 1, 1),
        stamping_time: Mock.Random.float(1.0, 1.8, 1, 1),
        foil_speed: Mock.Random.float(4.5, 6.5, 1, 1),
        efficiency: Mock.Random.natural(80, 95),
      }
    default:
      return baseData
  }
}

// 生成维修记录
const generateMaintenanceRecords = () => {
  return Mock.mock({
    "records|2-5": [
      {
        "id|+1": 1,
        date: '@date("yyyy-MM-dd")',
        type: '@pick(["定期保养", "故障维修", "预防性维护", "紧急维修"])',
        description: "@sentence(10, 20)",
        technician: "@cname",
        cost: "@natural(300, 2000)",
      },
    ],
  }).records
}

// 生成历史数据
const generateHistoryData = (hours = 24) => {
  const data = []
  const now = new Date()

  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.toISOString(),
      temperature: Mock.Random.float(180, 220, 1, 1),
      pressure: Mock.Random.float(100, 150, 1, 1),
      speed: Mock.Random.float(70, 100, 1, 1),
      efficiency: Mock.Random.float(80, 95, 1, 1),
    })
  }

  return data
}

// 初始化设备数据
const equipmentData = generateEquipment()

// 导入各模块的 Mock 数据
import "./modules/alarm"
import "./modules/dashboard"
import "./modules/equipment"
import "./modules/fault"
import "./modules/form"
import "./modules/maintenance"
import "./modules/material"
import "./modules/monitoring"
import "./modules/product"
import "./modules/production"
import "./modules/realtime"
import "./modules/task"
import "./modules/user"
import "./modules/role"


// 设置Mock配置
Mock.setup({
  timeout: "200-600", // 设置响应时间
})

console.log("Mock.js 已启动")

export default Mock
