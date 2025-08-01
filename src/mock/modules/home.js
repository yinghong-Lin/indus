import Mock from "mockjs"
import dayjs from "dayjs"

const equipmentStatusTypes = {
  hot_stamping: "烫金机",
  injection_molding: "注塑机",
  spray_painting: "喷漆机",
  screen_printing: "丝印机",
}
const equipmentStatuses = ["OFF", "ON_IDLE", "ON_RUNNING"]

// 模拟所有设备的状态数据，包含 location
const homeEquipmentData = []
for (const type in equipmentStatusTypes) {
  for (let i = 1; i <= Mock.Random.natural(3, 5); i++) {
    homeEquipmentData.push({
      equipment_id: Mock.Random.guid(),
      equipment_name: `${equipmentStatusTypes[type]}${i}号`,
      equipment_status: Mock.Random.pick(equipmentStatuses),
      equipment_type: type,
      location: Mock.Random.pick(["生产区域A", "生产区域B", "生产区域C", "生产区域D"]), // Added location
    })
  }
}

// 模拟进行中的任务列表
const inProgressTasksData = Mock.mock({
  "tasks|5-10": [
    {
      task_id: "@guid",
      task_name: () =>
        `${Mock.Random.pick(["智能手机X", "智能手表Y", "平板电脑A", "无线耳机B", "笔记本电脑Z"])}生产线-第${Mock.Random.natural(1, 5)}批次`,
      product_name: () =>
        Mock.Random.pick(["化妆品包装盒", "注塑件", "智能手机X", "智能手表Y", "无线耳机B", "平板电脑A"]),
      production_quantity: Mock.Random.natural(100, 2000),
      production_progress: Mock.Random.float(0.1, 0.99, 2, 2),
      task_priority: Mock.Random.natural(1, 3), // 1:高, 2:中, 3:低
      start_time: dayjs(Mock.Random.datetime()).format("YYYY-MM-DDTHH:mm:ss"), // ISO 8601 without milliseconds
      end_time: dayjs(Mock.Random.datetime()).add(Mock.Random.natural(1, 3), "day").format("YYYY-MM-DDTHH:mm:ss"), // ISO 8601 without milliseconds
      actual_end_time: null,
      task_status: "in_progress",
      created_at: dayjs(Mock.Random.datetime()).format("YYYY-MM-DDTHH:mm:ss"), // ISO 8601 without milliseconds
      updated_at: dayjs().format("YYYY-MM-DDTHH:mm:ss"), // ISO 8601 without milliseconds
    },
  ],
}).tasks

// GET 根据类型获取设备名及设备运行状态接口
Mock.mock(/\/api\/home\/getEquipmentNameAndStatusByType/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const equipment_type = u.searchParams.get("equipment_type")

  let filteredData = [...homeEquipmentData]
  if (equipment_type !== "all") {
    filteredData = filteredData.filter((item) => item.equipment_type === equipment_type)
  }

  // Filter out 'location' from the response data to strictly match the API documentation
  const responseData = filteredData.map(({ location, ...rest }) => rest)

  return {
    code: 200,
    msg: "获取成功",
    data: responseData,
  }
})

// PATCH 一键更改设备运行状态接口
Mock.mock(/\/api\/home\/updateAllEquipmentStatus/, "patch", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const equipment_status = u.searchParams.get("equipment_status")

  homeEquipmentData.forEach((eq) => {
    eq.equipment_status = equipment_status
  })

  return {
    code: 200,
    msg: `已将所有设备状态更新为${equipment_status}`,
    data: true,
  }
})

// GET 获取运行中任务列表接口
Mock.mock(/\/api\/home\/getInProgressProductionTask/, "get", () => {
  return {
    code: 200,
    msg: "获取成功",
    data: inProgressTasksData,
  }
})

console.log("[Mock] 主页面接口已启动！")
