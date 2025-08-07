import Mock from "mockjs"
import dayjs from "dayjs"

// 模拟实时数据
const generateRealtimeData = (equipment_type, equipment_id, equipment_name) => {
  let realtime_details = {}
  switch (equipment_type) {
    case "injection_molding":
      realtime_details = {
        realtime_heating_temp: { value: Mock.Random.natural(180, 280), unit: "℃" },
        realtime_cooling_time: { value: Mock.Random.natural(10, 30), unit: "s" },
        realtime_injection_speed: { value: Mock.Random.natural(60, 120), unit: "mm/s" },
        realtime_injection_pressure: { value: Mock.Random.float(80, 150, 1, 1), unit: "MPa" },
        realtime_injection_time: { value: Mock.Random.natural(2, 5), unit: "s" },
        realtime_opening_time: { value: Mock.Random.natural(1, 3), unit: "s" },
        realtime_closing_time: { value: Mock.Random.natural(1, 2), unit: "s" },
        realtime_holding_pressure: { value: Mock.Random.float(60, 100, 1, 1), unit: "MPa" },
        realtime_holding_time: { value: Mock.Random.natural(3, 8), unit: "s" },
        realtime_injection_position: { value: Mock.Random.float(0.01, 0.1, 2, 2), unit: "mm" },
        realtime_screw_speed: { value: Mock.Random.natural(80, 200), unit: "rpm" },
      }
      break
    case "screen_printing":
      realtime_details = {
        realtime_printing_pressure: { value: Mock.Random.float(0.3, 0.7, 1, 1), unit: "MPa" },
        realtime_printing_speed: { value: Mock.Random.float(0.5, 1.0, 1, 1), unit: "m/s" },
        realtime_ink_viscosity: { value: Mock.Random.float(8, 14, 1, 1), unit: "Pa·s" },
        realtime_ink_drying_time: { value: Mock.Random.natural(20, 60), unit: "s" },
        realtime_ink_level: { value: Mock.Random.natural(60, 120), unit: "%" },// 实时油墨液位
      }
      break
    case "hot_stamping":
      realtime_details = {
        realtime_stamping_temp: { value: Mock.Random.natural(80, 150), unit: "℃" },
        realtime_stamping_pressure: { value: Mock.Random.float(0.5, 2.0, 1, 1), unit: "MPa" },
        realtime_stamping_time: { value: Mock.Random.float(0.3, 2.0, 1, 1), unit: "s" },
        realtime_foil_speed: { value: Mock.Random.float(1.5, 5.0, 1, 1), unit: "m/s" },
      }
      break
    case "spray_painting":
      realtime_details = {
        realtime_paint_viscosity: { value: Mock.Random.float(10, 20, 1, 1), unit: "Pa·s" },
        realtime_spray_pressure: { value: Mock.Random.float(0.3, 0.5, 1, 1), unit: "MPa" },
        realtime_spray_distance: { value: Mock.Random.natural(180, 250), unit: "mm" },
        realtime_spray_speed: { value: Mock.Random.float(0.8, 1.3, 1, 1), unit: "m/s" },
        realtime_drying_temp: { value: Mock.Random.natural(50, 75), unit: "℃" },
        realtime_drying_time: { value: Mock.Random.natural(15, 40), unit: "s" },
      }
      break
  }

  return {
    realtime_id: Mock.Random.guid(),
    realtime_status: {
      running: Mock.Random.boolean(),
      power_on: true,
      cycle_count: Mock.Random.natural(0, 100),
      device_ready: true,
      stamping_done: Mock.Random.boolean(),
      emergency_stop: false,
      preparation_done: Mock.Random.boolean(),
      production_stage: Mock.Random.natural(0, 5),
      production_stage_desc: Mock.Random.pick(["STANDBY", "PREPARING", "RUNNING", "PAUSED", "FINISHED", "ERROR"]),
    },
    realtime_details: realtime_details,
    collection_time: dayjs()
      .subtract(Mock.Random.natural(0, 60), "minute")
      .toISOString()
      .replace(/\.\d+Z$/, ""), // ISO 8601 without milliseconds
    equipment_name: equipment_name,
    equipment_id: equipment_id,
    equipment_type: equipment_type,
    timestamp: dayjs()
      .toISOString()
      .replace(/\.\d+Z$/, ""), // ISO 8601 without milliseconds
  }
}

// 模拟报警记录
const alarmLevels = ["严重", "警告", "致命"]
const alarmStatuses = ["已处理", "未处理"]
const alarmSourceTypes = ["网络模块", "温度传感器", "电力监测单元", "机械故障"]
const alarmCodes = ["NET_DOWN", "TEMP_OVER", "VOLTAGE_FLUCT", "MECHANICAL_FAIL"]
const alarmDetails = {
  NET_DOWN: "设备连续5分钟无心跳信号",
  TEMP_OVER: "电机温度超过安全阈值(85℃)",
  VOLTAGE_FLUCT: "输入电压波动超过±10%",
  MECHANICAL_FAIL: "设备部件磨损严重，需要维护",
}

const generateAlarm = () => {
  const alarmCode = Mock.Random.pick(alarmCodes)
  return {
    alarm_id: Mock.Random.guid(),
    alarm_source_type: Mock.Random.pick(alarmSourceTypes),
    associated_record_id: Mock.Random.guid(),
    alarm_code: alarmCode,
    alarm_level: Mock.Random.pick(alarmLevels),
    alarm_detail: alarmDetails[alarmCode],
    alarm_time: dayjs()
      .subtract(Mock.Random.natural(0, 7), "day")
      .toISOString()
      .replace(/\.\d+Z$/, ""),
    alarm_status: Mock.Random.pick(alarmStatuses),
    created_at: dayjs()
      .subtract(Mock.Random.natural(0, 7), "day")
      .toISOString()
      .replace(/\.\d+Z$/, ""),
    updated_at: dayjs()
      .toISOString()
      .replace(/\.\d+Z$/, ""),
    equipment_name: Mock.Random.pick(["烫金机一号", "注塑机一号", "喷漆机一号", "丝印机一号"]),
  }
}

const alarmData = Mock.mock({
  "Alarms|20-50": [generateAlarm],
}).Alarms

// 模拟设备运行状况
const equipmentStatusTypes = {
  hot_stamping: "烫金机",
  injection_molding: "注塑机",
  spray_painting: "喷漆机",
  screen_printing: "丝印机",
}
const equipmentStatuses = ["OFF", "ON_IDLE", "ON_RUNNING"]

const allEquipmentStatusData = []
for (const type in equipmentStatusTypes) {
  for (let i = 1; i <= Mock.Random.natural(3, 5); i++) {
    allEquipmentStatusData.push({
      equipment_id: Mock.Random.guid(),
      equipment_name: `${equipmentStatusTypes[type]}${i}号`,
      equipment_type: type,
      equipment_status: Mock.Random.pick(equipmentStatuses),
      location: Mock.Random.pick(["生产区域A", "生产区域B", "生产区域C", "生产区域D"]),
    })
  }
}

// Store real-time data for each equipment ID
const realtimeDataStore = {}
allEquipmentStatusData.forEach((eq) => {
  realtimeDataStore[eq.equipment_id] = generateRealtimeData(eq.equipment_type, eq.equipment_id, eq.equipment_name)
})

// WebSocket 模拟
setInterval(() => {
  allEquipmentStatusData.forEach((equipment) => {
    // 生成新的实时数据
    const newData = generateRealtimeData(equipment.equipment_type, equipment.equipment_id, equipment.equipment_name)
    // 更新存储的数据
    realtimeDataStore[equipment.equipment_id] = newData
  })
}, 10000) // 每10秒更新一次数据，模拟实时推送

// GET 获取设备最晚实时数据接口
Mock.mock(/\/api\/productionMonitor\/getLastRealtimeData/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const equipment_id = u.searchParams.get("equipment_id")

  const data = realtimeDataStore[equipment_id]
  if (data) {
    // Update timestamp and collection_time to simulate real-time updates
    data.timestamp = dayjs()
      .toISOString()
      .replace(/\.\d+Z$/, "")
    data.collection_time = dayjs()
      .toISOString()
      .replace(/\.\d+Z$/, "")
    return {
      code: 200,
      msg: "获取成功",
      data: data,
    }
  } else {
    return {
      code: 404,
      msg: "设备实时数据不存在",
      data: null,
    }
  }
})

// GET 获取报警记录列表接口
Mock.mock(/\/api\/productionMonitor\/getAlarmList/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const page = Number(u.searchParams.get("page") || 1)
  const page_size = Number(u.searchParams.get("page_size") || 10)

  const start = (page - 1) * page_size
  const end = start + page_size
  const list = alarmData.slice(start, end)

  return {
    code: 200,
    msg: "获取报警记录列表成功",
    data: {
      Alarms: list,
      pagination: {
        total: alarmData.length,
        page,
        page_size,
        total_pages: Math.ceil(alarmData.length / page_size),
      },
    },
  }
})

// GET 根据id获取报警记录信息接口
Mock.mock(/\/api\/productionMonitor\/getAlarmById/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const alarm_id = u.searchParams.get("alarm_id")
  const alarm = alarmData.find((a) => a.alarm_id === alarm_id)

  if (alarm) {
    return {
      code: 200,
      msg: "获取报警记录成功",
      data: alarm,
    }
  } else {
    return {
      code: 404,
      msg: "报警记录不存在",
      data: null,
    }
  }
})

// DEL 删除报警记录接口
Mock.mock(/\/api\/productionMonitor\/deleteAlarm/, "delete", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const alarm_id = u.searchParams.get("alarm_id")
  const index = alarmData.findIndex((a) => a.alarm_id === alarm_id)

  if (index > -1) {
    alarmData.splice(index, 1)
    return {
      code: 200,
      msg: `成功删除id为'${alarm_id}'的报警记录`,
      data: true,
    }
  } else {
    return {
      code: 404,
      msg: "报警记录不存在",
      data: false,
    }
  }
})

// PATCH 更新报警记录级别
Mock.mock(/\/api\/productionMonitor\/updateAlarmLevel/, "patch", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const alarm_id = u.searchParams.get("alarm_id")
  const level = u.searchParams.get("level")

  const alarm = alarmData.find((a) => a.alarm_id === alarm_id)

  if (alarm) {
    alarm.alarm_level = level
    alarm.updated_at = dayjs()
      .toISOString()
      .replace(/\.\d+Z$/, "")
    return {
      code: 200,
      msg: `更新id为${alarm_id}的报警记录级别为${level}`,
      data: alarm,
    }
  } else {
    return {
      code: 404,
      msg: "报警记录不存在",
      data: null,
    }
  }
})

// PATCH 更新报警记录状态
Mock.mock(/\/api\/productionMonitor\/updateAlarmStatus/, "patch", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const alarm_id = u.searchParams.get("alarm_id")
  const status = u.searchParams.get("status")

  const alarm = alarmData.find((a) => a.alarm_id === alarm_id)

  if (alarm) {
    alarm.alarm_status = status
    alarm.updated_at = dayjs()
      .toISOString()
      .replace(/\.\d+Z$/, "")
    return {
      code: 200,
      msg: `更新id为${alarm_id}的报警记录状态为${status}`,
      data: alarm,
    }
  } else {
    return {
      code: 404,
      msg: "报警记录不存在",
      data: null,
    }
  }
})

// GET 根据设备类型获取设备运行状况接口
Mock.mock(/\/api\/productionMonitor\/getEquipmentStatusByType/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const equipment_type = u.searchParams.get("equipment_type")

  let filteredData = [...allEquipmentStatusData]
  if (equipment_type !== "all") {
    filteredData = filteredData.filter((item) => item.equipment_type === equipment_type)
  }

  return {
    code: 200,
    msg: "获取成功",
    data: filteredData,
  }
})

console.log("[Mock] 生产监控接口已启动！")
