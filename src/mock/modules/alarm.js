import Mock from "mockjs"

// 报警级别
const alarmLevels = ["warning", "serious", "critical"]

// 设备名称
const equipmentNames = [
  "注塑机1号",
  "注塑机2号",
  "注塑机3号",
  "喷漆机1号",
  "喷漆机2号",
  "喷漆机3号",
  "丝印机1号",
  "丝印机2号",
  "丝印机3号",
  "烫金机1号",
  "烫金机2号",
  "烫金机3号",
]

// 获取报警记录列表接口
Mock.mock(/\/alarm\/records/, "get", (options) => {
  const url = new URL("http://localhost" + options.url)
  const page = Number.parseInt(url.searchParams.get("page")) || 1
  const page_size = Number.parseInt(url.searchParams.get("page_size")) || 20

  const alarms = Mock.mock({
    "list|15-30": [
      {
        "alarm_id|+1": () => `alarm-${Mock.Random.string("lower", 3)}`,
        alarm_code: () => `AL-${Mock.Random.string("upper", 2)}-${Mock.Random.string("number", 3)}`,
        alarm_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
        alarm_detail:
          "@pick(['设备温度过高', '压力异常', '速度超限', '传感器故障', '电机过载', '油墨不足', '材料卡住', '安全门未关闭'])",
        alarm_level: () => Mock.Random.pick(alarmLevels),
        equipment_name: () => Mock.Random.pick(equipmentNames),
        status: "@pick(['active', 'acknowledged', 'resolved'])",
        description: "@sentence(10, 20)",
        created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      },
    ],
  }).list

  const total = alarms.length
  const start = (page - 1) * page_size
  const end = start + page_size
  const list = alarms.slice(start, end)

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

// 查询报警记录接口
Mock.mock("/alarm/select", "post", (options) => {
  const { alarm_id } = JSON.parse(options.body)

  return Mock.mock({
    code: 200,
    message: "success",
    data: {
      alarm_id: alarm_id,
      alarm_code: () => `AL-${Mock.Random.string("upper", 2)}-${Mock.Random.string("number", 3)}`,
      alarm_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      alarm_detail: "@pick(['设备温度过高', '压力异常', '速度超限', '传感器故障'])",
      alarm_level: () => Mock.Random.pick(alarmLevels),
      equipment_name: () => Mock.Random.pick(equipmentNames),
      status: "@pick(['active', 'acknowledged', 'resolved'])",
      description: "@sentence(10, 20)",
      created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      resolved_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      resolved_by: "@cname",
    },
  })
})

// 删除报警记录接口
Mock.mock("/alarm/delete", "delete", (options) => {
  const { alarm_id } = JSON.parse(options.body)

  return {
    code: 200,
    message: "报警记录删除成功",
    data: {
      alarm_id: alarm_id,
      deleted_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    },
  }
})

export default {}
