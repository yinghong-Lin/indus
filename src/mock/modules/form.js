import Mock from "mockjs"

// 设备状态统计接口
Mock.mock("/form/equipment-status", "post", (options) => {
  const body = JSON.parse(options.body)
  const { equipment_type } = body

  return {
    code: 200,
    message: "success",
    data: {
      equipment_type: equipment_type,
      status_counts: {
        正常: Mock.Random.natural(3, 8),
        故障: Mock.Random.natural(0, 2),
        维修中: Mock.Random.natural(0, 3),
        停机: Mock.Random.natural(0, 2),
      },
      total_count: Mock.Random.natural(5, 15),
      online_rate: Mock.Random.float(75, 95, 1, 1),
      avg_efficiency: Mock.Random.float(80, 95, 1, 1),
      last_update: Mock.Random.datetime(),
    },
  }
})

// 获取设备参数接口
Mock.mock("/form/get-params", "post", (options) => {
  const body = JSON.parse(options.body)
  const { equipment_type } = body

  let params = {}
  switch (equipment_type) {
    case "注塑机":
      params = {
        setting_id: "setting-001",
        heating_temp_range: "180-220",
        injection_pressure: 120,
        injection_speed: 80,
        screw_speed: 120,
        holding_pressure: 80.5,
        cooling_time: 15,
      }
      break
    case "丝印机":
      params = {
        setting_id: "setting-002",
        ink_viscosity: 12.5,
        printing_speed: 1.0,
        ink_drying_time: 30,
        printing_pressure: 0.8,
        ink_type_template_type: "UV油墨+聚酯网版",
      }
      break
    case "喷漆机":
      params = {
        setting_id: "setting-003",
        spray_pressure: 0.5,
        spray_distance: 200,
        spray_speed: 1.2,
        drying_temp: 70,
        drying_time: 20,
      }
      break
    case "烫金机":
      params = {
        setting_id: "setting-004",
        stamping_temp_range: "160-180",
        stamping_pressure_range: "1.5-2.0",
        stamping_time_range: "1.0-2.0",
        foil_speed_range: "4-6",
      }
      break
  }

  return {
    code: 200,
    message: "success",
    data: params,
  }
})

// 调节设备参数接口
Mock.mock("/form/update-params", "post", (options) => {
  const body = JSON.parse(options.body)
  return {
    code: 200,
    message: "参数更新成功",
    data: {
      setting_id: body.setting_id,
      params: body.params,
      affected_equipment_count: Mock.Random.natural(2, 6),
      update_time: Mock.Random.datetime(),
      operator: "当前用户",
    },
  }
})

// 设备状态数据接口
// Mock.mock("/api/form/equipment-status-data", "post", (options) => {
//   const body = JSON.parse(options.body)
//   return Mock.mock({
//     code: 200,
//     message: "success",
//     data: {
//       "equipment_list|5-12": [
//         {
//           "equipment_id|+1": 1,
//           equipment_name: () => {
//             const types = ["注塑机", "喷漆机", "丝印机", "烫金机"]
//             const type = Mock.Random.pick(types)
//             return `${type}${Mock.Random.natural(1, 5)}号`
//           },
//           equipment_type: "@pick(['注塑机', '喷漆机', '丝印机', '烫金机'])",
//           status: "@pick(['正常', '故障', '维修中', '停机'])",
//           efficiency: "@natural(70, 98)",
//           output: "@natural(800, 2000)",
//           runtime: "@float(8, 24, 1, 1)",
//           temperature: "@natural(60, 200)",
//           pressure: "@float(0.5, 2.5, 1, 1)",
//           last_maintenance: "@date",
//           location: () => {
//             const areas = ["A", "B", "C", "D"]
//             return `${Mock.Random.pick(areas)}车间-${Mock.Random.natural(1, 20)}`
//           },
//         },
//       ],
//       summary: {
//         total_equipment: "@natural(5, 12)",
//         online_equipment: "@natural(4, 10)",
//         avg_efficiency: "@float(82, 92, 1, 1)",
//         total_output: "@natural(8000, 20000)",
//       },
//     },
//   })
// })

export default {}
