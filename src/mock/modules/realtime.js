import Mock from "mockjs"

// 设备类型和名称
const deviceTypes = ["注塑机", "喷漆机", "丝印机", "烫金机"]
const deviceNames = {
  注塑机: ["注塑机1号", "注塑机2号", "注塑机3号"],
  喷漆机: ["喷漆机1号", "喷漆机2号", "喷漆机3号"],
  丝印机: ["丝印机1号", "丝印机2号", "丝印机3号"],
  烫金机: ["烫金机1号", "烫金机2号", "烫金机3号"],
}

// 设备状态
const deviceStatuses = ["正常", "故障", "维修中"]

// 实时数据接口
Mock.mock("/realtime/all", "get", () => {
  const devices = []

  deviceTypes.forEach((type) => {
    deviceNames[type].forEach((name, index) => {
      let deviceData = {}

      // 根据设备类型生成不同的实时数据
      switch (type) {
        case "注塑机":
          deviceData = {
            温度: `${Mock.Random.natural(180, 220)}℃`,
            压力: `${Mock.Random.natural(100, 150)}MPa`,
            速度: `${Mock.Random.natural(60, 100)}mm/s`,
            产量: `${Mock.Random.natural(800, 1200)}件/h`,
          }
          break
        case "喷漆机":
          deviceData = {
            喷涂压力: `${Mock.Random.float(0.3, 0.8, 1, 1)}MPa`,
            喷涂距离: `${Mock.Random.natural(150, 250)}mm`,
            烘干温度: `${Mock.Random.natural(60, 80)}℃`,
            产量: `${Mock.Random.natural(600, 1000)}件/h`,
          }
          break
        case "丝印机":
          deviceData = {
            印刷压力: `${Mock.Random.float(0.4, 0.8, 1, 1)}MPa`,
            印刷速度: `${Mock.Random.float(0.8, 1.2, 1, 1)}m/s`,
            油墨粘度: `${Mock.Random.float(10, 15, 1, 1)}Pa·s`,
            产量: `${Mock.Random.natural(500, 900)}件/h`,
          }
          break
        case "烫金机":
          deviceData = {
            烫金温度: `${Mock.Random.natural(150, 180)}℃`,
            烫金压力: `${Mock.Random.float(1.2, 2.5, 1, 1)}MPa`,
            金箔速度: `${Mock.Random.natural(3, 8)}m/min`,
            产量: `${Mock.Random.natural(400, 800)}件/h`,
          }
          break
      }

      devices.push({
        device_id: `${type.substring(0, 2)}-${String(index + 1).padStart(3, "0")}`,
        device_name: name,
        device_type: type,
        status: Mock.Random.pick(deviceStatuses),
        data: deviceData,
        collection_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
      })
    })
  })

  return {
    code: 200,
    message: "success",
    data: {
      devices: devices,
      total: devices.length,
      update_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    },
  }
})

export default {}
