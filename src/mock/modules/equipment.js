import Mock from "mockjs"

// 设备类型映射
const equipmentTypes = {
  IM: "注塑机",
  PT: "喷漆机",
  SS: "丝印机",
  HS: "烫金机",
}

// 设备状态
const equipmentStatuses = ["运行中", "维修中", "故障", "停机"]

// 生成设备数据
const generateEquipment = () => {
  const equipment = []
  const types = ["IM", "PT", "SS", "HS"]

  types.forEach((type) => {
    for (let i = 1; i <= 3; i++) {
      const id = `${type}${String(i).padStart(3, "0")}`
      equipment.push({
        equipment_id: id,
        equipment_name: `${equipmentTypes[type]}${i}号`,
        equipment_type: equipmentTypes[type],
        equipment_status: Mock.Random.pick(equipmentStatuses),
        location: `${equipmentTypes[type]}车间${String.fromCharCode(64 + i)}-${String(i).padStart(2, "0")}`,
        manufacturer: Mock.Random.pick(["海天国际", "震雄集团", "伊之密", "博创智能", "力劲科技"]),
        model: Mock.Random.string("upper", 3, 5) + Mock.Random.natural(100, 999),
        purchase_date: Mock.Random.date("yyyy-MM-dd"),
        warranty_date: Mock.Random.date("yyyy-MM-dd"),
        spec: generateEquipmentSpec(type),
        parameters: generateEquipmentParameters(type),
        realtime: generateRealtimeData(type),
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
        shot_weight: Mock.Random.natural(200, 500),
      }
    case "PT":
      return {
        max_spray_pressure: Mock.Random.float(0.5, 1.0, 1, 1),
        spray_width: Mock.Random.natural(200, 400),
        drying_power: Mock.Random.natural(5, 12),
        paint_capacity: Mock.Random.natural(50, 100),
        booth_size: `${Mock.Random.natural(3, 6)}x${Mock.Random.natural(3, 6)}x${Mock.Random.natural(3, 4)}`,
      }
    case "SS":
      return {
        max_printing_pressure: Mock.Random.float(0.8, 1.5, 1, 1),
        printing_area: `${Mock.Random.natural(150, 250)}x${Mock.Random.natural(200, 350)}`,
        max_speed: Mock.Random.natural(40, 80),
        ink_capacity: Mock.Random.natural(20, 50),
        screen_size: `${Mock.Random.natural(300, 500)}x${Mock.Random.natural(400, 600)}`,
      }
    case "HS":
      return {
        max_stamping_temp: Mock.Random.natural(180, 250),
        max_pressure: Mock.Random.natural(2000, 4000),
        stamping_area: `${Mock.Random.natural(100, 200)}x${Mock.Random.natural(150, 250)}`,
        foil_width: Mock.Random.natural(100, 300),
        heating_time: Mock.Random.natural(30, 120),
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
        cooling_time: Mock.Random.natural(10, 30),
      }
    case "PT":
      return {
        spray_pressure: Mock.Random.float(0.3, 0.7, 1, 2),
        spray_distance: Mock.Random.natural(150, 250),
        spray_speed: Mock.Random.float(0.8, 1.5, 1, 1),
        drying_temp: Mock.Random.natural(60, 80),
        paint_flow_rate: Mock.Random.float(100, 300, 1, 1),
        atomization_pressure: Mock.Random.float(2, 5, 1, 1),
      }
    case "SS":
      return {
        printing_pressure: Mock.Random.float(0.4, 0.8, 1, 2),
        printing_speed: Mock.Random.float(0.6, 1.2, 1, 1),
        ink_viscosity: Mock.Random.float(10, 16, 1, 1),
        ink_drying_time: Mock.Random.natural(20, 40),
        squeegee_angle: Mock.Random.natural(45, 75),
        off_contact: Mock.Random.float(1, 3, 1, 1),
      }
    case "HS":
      return {
        stamping_temp_range: `${Mock.Random.natural(150, 170)}-${Mock.Random.natural(180, 200)}℃`,
        stamping_pressure_range: `${Mock.Random.float(1.2, 1.8, 1, 1)}-${Mock.Random.float(1.8, 2.5, 1, 1)}MPa`,
        stamping_time_range: `${Mock.Random.float(0.8, 1.2, 1, 1)}-${Mock.Random.float(1.5, 2.5, 1, 1)}s`,
        foil_speed_range: `${Mock.Random.natural(3, 5)}-${Mock.Random.natural(6, 8)}m/min`,
        heating_time: Mock.Random.natural(60, 180),
        cooling_time: Mock.Random.natural(30, 90),
      }
    default:
      return {}
  }
}

// 生成实时数据
const generateRealtimeData = (type) => {
  const baseData = {
    collection_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    status: Mock.Random.pick(["running", "warning", "stopped", "maintenance"]),
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
        cycle_time: Mock.Random.natural(45, 120),
        shot_count: Mock.Random.natural(1000, 5000),
      }
    case "PT":
      return {
        ...baseData,
        spray_pressure: Mock.Random.float(0.4, 0.6, 1, 2),
        spray_distance: Mock.Random.natural(180, 220),
        spray_speed: Mock.Random.float(1.0, 1.3, 1, 1),
        drying_temp: Mock.Random.natural(65, 75),
        efficiency: Mock.Random.natural(80, 95),
        paint_consumption: Mock.Random.float(50, 150, 1, 1),
        booth_humidity: Mock.Random.natural(40, 60),
      }
    case "SS":
      return {
        ...baseData,
        printing_pressure: Mock.Random.float(0.5, 0.7, 1, 2),
        printing_speed: Mock.Random.float(0.8, 1.1, 1, 1),
        ink_viscosity: Mock.Random.float(11, 14, 1, 1),
        ink_drying_time: Mock.Random.natural(25, 35),
        efficiency: Mock.Random.natural(80, 95),
        print_count: Mock.Random.natural(500, 2000),
        registration_accuracy: Mock.Random.float(0.05, 0.15, 2, 2),
      }
    case "HS":
      return {
        ...baseData,
        stamping_temp: Mock.Random.natural(160, 180),
        stamping_pressure: Mock.Random.float(1.5, 2.0, 1, 1),
        stamping_time: Mock.Random.float(1.0, 1.8, 1, 1),
        foil_speed: Mock.Random.float(4.5, 6.5, 1, 1),
        efficiency: Mock.Random.natural(80, 95),
        foil_consumption: Mock.Random.float(10, 30, 1, 1),
        stamping_count: Mock.Random.natural(800, 3000),
      }
    default:
      return baseData
  }
}

// 初始化设备数据
const equipmentData = generateEquipment()

// 设备列表接口
Mock.mock(/\/equipment\/list/, "get", (options) => {
  const url = new URL("http://localhost" + options.url)
  const page = Number.parseInt(url.searchParams.get("page")) || 1
  const page_size = Number.parseInt(url.searchParams.get("page_size")) || 20

  const total = equipmentData.length
  const start = (page - 1) * page_size
  const end = start + page_size
  const list = equipmentData.slice(start, end)

  return {
    code: 200,
    message: "success",
    data: {
      list,
      total,
      page,
      page_size,
      total_pages: Math.ceil(total / page_size),
    },
  }
})

// 获取设备规格接口
Mock.mock("/equipment/spec", "post", (options) => {
  const { equipment_name } = JSON.parse(options.body)
  const equipment = equipmentData.find((item) => item.equipment_name === equipment_name)

  if (equipment) {
    return {
      code: 200,
      message: "success",
      data: {
        equipment_name: equipment.equipment_name,
        equipment_type: equipment.equipment_type,
        spec: equipment.spec,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
      },
    }
  } else {
    return {
      code: 404,
      message: "设备不存在",
      data: null,
    }
  }
})

// 查询设备详情接口
Mock.mock("/equipment/detail", "post", (options) => {
  const { equipment_name } = JSON.parse(options.body)
  const equipment = equipmentData.find((item) => item.equipment_name === equipment_name)

  if (equipment) {
    return {
      code: 200,
      message: "success",
      data: equipment,
    }
  } else {
    return {
      code: 404,
      message: "设备不存在",
      data: null,
    }
  }
})

export default {}
