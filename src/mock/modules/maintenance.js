import Mock from "mockjs"

let faultData = [
  {
    fault_id: "F-001",
    fault_time: "2025-08-07T14:11:06",
    fault_code: "4",
    fault_description: "油漆不足故障",
    is_resolved: true,
    created_at: "2025-08-07T14:11:06",
    updated_at: "2025-08-07T16:06:51",
    equipment_name: "喷漆机一号",
    collection_time: "2025-08-07T06:11:06",
  },
  {
    fault_id: "F-002",
    fault_time: "2025-08-06T10:00:00",
    fault_code: "1",
    fault_description: "电机过热",
    is_resolved: false,
    created_at: "2025-08-06T09:50:00",
    updated_at: "2025-08-06T10:00:00",
    equipment_name: "注塑机一号",
    collection_time: "2025-08-06T09:45:00",
  },
  {
    fault_id: "F-003",
    fault_time: "2025-08-05T15:30:00",
    fault_code: "2",
    fault_description: "传感器故障",
    is_resolved: false,
    created_at: "2025-08-05T15:20:00",
    updated_at: "2025-08-05T15:30:00",
    equipment_name: "丝印机一号",
    collection_time: "2025-08-05T15:15:00",
  },
]

let maintenanceData = [
  {
    maintenance_id: "MAINT-004",
    equipment_id: "EQUIP003",
    equipment_name: "烫金机",
    fault_id: null,
    maintenance_type: "故障维修",
    maintenance_status: "已完成",
    maintenance_time: "2025-08-05T13:00:00",
    maintenance_measures: "准备更换输送带，已联系供应商发货，预计两天后到货",
    created_at: "2025-08-05T12:30:00",
    updated_at: "2025-08-05T12:30:00",
  },
  {
    maintenance_id: "MAINT-003",
    equipment_id: "EQUIP005",
    equipment_name: "喷漆机",
    fault_id: null,
    maintenance_type: "例行检查",
    maintenance_status: "已完成",
    maintenance_time: "2025-08-04T10:00:00",
    maintenance_measures: "检查液压管路密封性，补充液压油，测试压力正常",
    created_at: "2025-08-04T09:45:00",
    updated_at: "2025-08-04T11:00:00",
  },
  {
    maintenance_id: "MAINT-002",
    equipment_id: "EQUIP001",
    equipment_name: "注塑机",
    fault_id: null,
    maintenance_type: "预防性维护",
    maintenance_status: "未完成",
    maintenance_time: "2025-08-03T08:00:00",
    maintenance_measures: "清理电机散热片，检查轴承润滑，紧固接线端子",
    created_at: "2025-08-03T07:55:00",
    updated_at: "2025-08-03T09:30:00",
  },
  {
    maintenance_id: "MAINT-001",
    equipment_id: "EQUIP002",
    equipment_name: "丝印机",
    fault_id: null,
    maintenance_type: "故障维修",
    maintenance_status: "已完成",
    maintenance_time: "2025-08-02T14:00:00",
    maintenance_measures: "更换温度传感器，校准量程，测试运行正常",
    created_at: "2025-08-02T13:50:00",
    updated_at: "2025-08-02T15:00:00",
  },
]

// Helper to format date to ISO string
const toISOString = (dateString) => {
  if (!dateString) return null
  // If it's already an ISO string, return it
  if (dateString.endsWith("Z") || dateString.includes("T")) {
    return dateString
  }
  // Convert YYYY-MM-DD HH:mm:ss to ISO string
  const [datePart, timePart] = dateString.split(" ")
  return new Date(`${datePart}T${timePart}`).toISOString()
}

// Helper to format date to YYYY-MM-DD HH:mm:ss
const toYYYYMMDDHHmmss = (isoString) => {
  if (!isoString) return null
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取故障记录列表
Mock.mock(/\/fault\/getFaultList/, "get", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1])
  const page = Number.parseInt(params.get("page")) || 1
  const pageSize = Number.parseInt(params.get("page_size")) || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pagedData = faultData.slice(start, end)

  return {
    code: 200,
    msg: "获取故障记录列表成功",
    data: {
      Maintenances: pagedData,
      pagination: {
        total: faultData.length,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(faultData.length / pageSize),
      },
    },
  }
})

// 根据ID查询故障记录
Mock.mock(/\/fault\/gatFaultById/, "get", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1])
  const faultId = params.get("fault_id")
  const fault = faultData.find((item) => item.fault_id === faultId)

  return {
    code: 200,
    msg: "获取成功",
    data: fault || {},
  }
})

// 删除故障记录
Mock.mock(/\/fault\/deleteFault/, "delete", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1]) // DELETE uses URI params
  const faultId = params.get("fault_id")
  const initialLength = faultData.length
  faultData = faultData.filter((item) => item.fault_id !== faultId)

  if (faultData.length < initialLength) {
    return {
      code: 200,
      msg: `删除故障记录成功(ID: ${faultId})`,
      data: true,
    }
  }
  return [404, { code: 404, msg: "故障记录未找到" }]
})

// 更新故障记录状态
Mock.mock(/\/fault\/updateFaultStatus/, "patch", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1]) // PATCH uses URI params
  const faultId = params.get("fault_id")
  const isResolved = params.get("is_resolved") === "true"
  const index = faultData.findIndex((item) => item.fault_id === faultId)

  if (index !== -1) {
    faultData[index].is_resolved = isResolved
    faultData[index].updated_at = new Date().toISOString()
    return {
      code: 200,
      msg: "更新故障信息",
      data: faultData[index],
    }
  }
  return [404, { code: 404, msg: "故障记录未找到" }]
})

// 更新故障记录描述
Mock.mock(/\/fault\/updateFaultDescription/, "patch", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1]) // PATCH uses URI params
  const faultId = params.get("fault_id")
  const description = params.get("description")
  const index = faultData.findIndex((item) => item.fault_id === faultId)

  if (index !== -1) {
    faultData[index].fault_description = description
    faultData[index].updated_at = new Date().toISOString()
    return {
      code: 200,
      msg: "更新故障信息",
      data: faultData[index],
    }
  }
  return [404, { code: 404, msg: "故障记录未找到" }]
})

// 获取维修记录列表
Mock.mock(/\/maintenance\/getMaintenanceList/, "get", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1])
  const page = Number.parseInt(params.get("page")) || 1
  const pageSize = Number.parseInt(params.get("page_size")) || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pagedData = maintenanceData.slice(start, end)

  return {
    code: 200,
    msg: "获取维修记录列表成功",
    data: {
      Maintenances: pagedData,
      pagination: {
        total: maintenanceData.length,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(maintenanceData.length / pageSize),
      },
    },
  }
})

// 新增维修记录
Mock.mock(/\/maintenance\/addMaintenance/, "post", (options) => {
  const newData = JSON.parse(options.body)
  const newMaintenance = {
    maintenance_id: `MAINT-${Mock.Random.string("number", 3)}`,
    equipment_id: `EQUIP-${Mock.Random.string("number", 3)}`, // Mock equipment_id
    fault_id: newData.fault_id || null,
    maintenance_type: newData.maintenance_type,
    maintenance_status: "未完成", // Default status for new records
    maintenance_time: toISOString(newData.maintenance_time),
    maintenance_measures: newData.maintenance_measures,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    equipment_name: newData.equipment_name,
    fault_time: newData.fault_time ? toISOString(newData.fault_time) : null,
  }
  maintenanceData.unshift(newMaintenance) // Add to the beginning

  return {
    code: 200,
    msg: "新添维护记录成功",
    data: newMaintenance,
  }
})

// 根据ID查询维修记录
Mock.mock(/\/maintenance\/getMaintenanceById/, "get", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1])
  const maintenanceId = params.get("maintenance_id")
  const maintenance = maintenanceData.find((item) => item.maintenance_id === maintenanceId)

  return {
    code: 200,
    msg: "获取成功",
    data: maintenance || {},
  }
})

// 删除维修记录
Mock.mock(/\/maintenance\/deleteMaintenance/, "delete", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1]) // DELETE uses URI params
  const maintenanceId = params.get("maintenance_id")
  const initialLength = maintenanceData.length
  maintenanceData = maintenanceData.filter((item) => item.maintenance_id !== maintenanceId)

  if (maintenanceData.length < initialLength) {
    return {
      code: 200,
      msg: `已删除id为${maintenanceId}的记录`,
      data: true,
    }
  }
  return [404, { code: 404, msg: "维护记录未找到" }]
})

// 更新维修记录
Mock.mock(/\/maintenance\/updateMaintenance/, "put", (options) => {
  const updatedData = JSON.parse(options.body)
  const index = maintenanceData.findIndex((item) => item.maintenance_id === updatedData.maintenance_id)

  if (index !== -1) {
    const existingRecord = maintenanceData[index]
    const updatedRecord = {
      ...existingRecord,
      equipment_name: updatedData.equipment_name,
      fault_time: updatedData.fault_time ? toISOString(updatedData.fault_time) : null,
      maintenance_type: updatedData.maintenance_type,
      maintenance_status: updatedData.maintenance_status,
      maintenance_time: toISOString(updatedData.maintenance_time),
      maintenance_measures: updatedData.maintenance_measures,
      updated_at: new Date().toISOString(),
      // Keep equipment_id and created_at as they are not updated by PUT
      equipment_id: existingRecord.equipment_id,
      created_at: existingRecord.created_at,
    }
    maintenanceData[index] = updatedRecord
    return {
      code: 200,
      msg: "更新维护记录成功",
      data: updatedRecord,
    }
  }
  return [404, { code: 404, msg: "维护记录未找到" }]
})

// 更新维修状态
Mock.mock(/\/maintenance\/updateMaintenanceStatus/, "patch", (options) => {
  const params = new URLSearchParams(options.url.split("?")[1]) // PATCH uses URI params
  const maintenanceId = params.get("maintenance_id")
  const status = params.get("status")
  const index = maintenanceData.findIndex((item) => item.maintenance_id === maintenanceId)

  if (index !== -1) {
    maintenanceData[index].maintenance_status = status
    maintenanceData[index].updated_at = new Date().toISOString()
    return {
      code: 200,
      msg: "更新状态成功",
      data: maintenanceData[index],
    }
  }
  return [404, { code: 404, msg: "维护记录未找到" }]
})
