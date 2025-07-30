import Mock from "mockjs"

// 产品列表
const products = [
  { product_id: "123e4567-e89b-12d3-a456-426614174000", product_name: "化妆品包装盒" },
  { product_id: "123e4567-e89b-12d3-a456-426614174001", product_name: "注塑件" },
  { product_id: "123e4567-e89b-12d3-a456-426614174002", product_name: "丝印标签" },
  { product_id: "123e4567-e89b-12d3-a456-426614174003", product_name: "烫金标识" },
]

// 产线列表
const productionLines = [
  { line_id: "802a4a6d-632a-11f0-9c9d-7413ea8f7cac", line_name: "生产线1", capacity: 1000 },
  { line_id: "802a4a6d-632a-11f0-9c9d-7413ea8f7cad", line_name: "生产线2", capacity: 800 },
  { line_id: "802a4a6d-632a-11f0-9c9d-7413ea8f7cae", line_name: "生产线3", capacity: 1200 },
]

// 获取生产数据列表接口
Mock.mock(/\/production\/data\/list/, "get", (options) => {
  const url = new URL("http://localhost" + options.url)
  const page = Number.parseInt(url.searchParams.get("page")) || 1
  const page_size = Number.parseInt(url.searchParams.get("page_size")) || 20

  const productionData = Mock.mock({
    "list|20-30": [
      {
        "production_data_id|+1": () =>
          `${Mock.Random.string("lower", 8)}-${Mock.Random.string("lower", 4)}-${Mock.Random.string("lower", 4)}-${Mock.Random.string("lower", 4)}-${Mock.Random.string("lower", 12)}`,
        line_id: () => Mock.Random.pick(productionLines).line_id,
        line_name: function () {
          const line = productionLines.find((l) => l.line_id === this.line_id)
          return line ? line.line_name : "未知产线"
        },
        product_id: () => Mock.Random.pick(products).product_id,
        product_name: function () {
          const product = products.find((p) => p.product_id === this.product_id)
          return product ? product.product_name : "未知产品"
        },
        production_quantity: "@natural(500, 2000)",
        production_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
        shift: "@pick(['早班', '中班', '晚班'])",
        operator: "@cname",
        quality_rate: "@float(95, 99, 1, 1)",
        efficiency: "@float(80, 95, 1, 1)",
        defect_quantity: "@natural(0, 50)",
        energy_consumption: "@float(100, 500, 1, 1)",
        created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
        updated_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      },
    ],
  }).list

  const total = productionData.length
  const start = (page - 1) * page_size
  const end = start + page_size
  const list = productionData.slice(start, end)

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

// 查询生产数据接口
Mock.mock("/production/data/select", "post", (options) => {
  const { production_data_id } = JSON.parse(options.body)

  return Mock.mock({
    code: 200,
    message: "success",
    data: {
      production_data_id: production_data_id,
      line_id: () => Mock.Random.pick(productionLines).line_id,
      line_name: function () {
        const line = productionLines.find((l) => l.line_id === this.line_id)
        return line ? line.line_name : "未知产线"
      },
      product_id: () => Mock.Random.pick(products).product_id,
      product_name: function () {
        const product = products.find((p) => p.product_id === this.product_id)
        return product ? product.product_name : "未知产品"
      },
      production_quantity: "@natural(500, 2000)",
      production_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      shift: "@pick(['早班', '中班', '晚班'])",
      operator: "@cname",
      quality_rate: "@float(95, 99, 1, 1)",
      efficiency: "@float(80, 95, 1, 1)",
      defect_quantity: "@natural(0, 50)",
      energy_consumption: "@float(100, 500, 1, 1)",
      raw_materials_used: Mock.mock({
        "list|2-5": [
          {
            material_name: "@pick(['聚乙烯树脂', 'PVC粉料', '丙烯酸树脂', '钛白粉'])",
            quantity_used: "@natural(10, 100)",
            unit: "@pick(['千克', '升', '个'])",
          },
        ],
      }).list,
      created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      updated_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
    },
  })
})

// 获取产线列表接口
Mock.mock(/\/production\/line\/list/, "get", (options) => {
  const url = new URL("http://localhost" + options.url)
  const page = Number.parseInt(url.searchParams.get("page")) || 1
  const page_size = Number.parseInt(url.searchParams.get("page_size")) || 20

  const lines = productionLines.map((line) => ({
    ...line,
    status: Mock.Random.pick(["运行中", "停机", "维护中"]),
    current_product: Mock.Random.pick(products).product_name,
    efficiency: Mock.Random.float(75, 95, 1, 1),
    output_today: Mock.Random.natural(200, 800),
    workers_count: Mock.Random.natural(5, 15),
    shift: Mock.Random.pick(["早班", "中班", "晚班"]),
    last_maintenance: Mock.Random.date("yyyy-MM-dd"),
    created_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    updated_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
  }))

  const total = lines.length
  const start = (page - 1) * page_size
  const end = start + page_size
  const list = lines.slice(start, end)

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

// 查询产线接口
Mock.mock("/production/line/select", "post", (options) => {
  const { line_id } = JSON.parse(options.body)

  const line = productionLines.find((l) => l.line_id === line_id)

  return Mock.mock({
    code: 200,
    message: "success",
    data: {
      line_id: line_id,
      line_name: line ? line.line_name : "未知产线",
      capacity: line ? line.capacity : 1000,
      status: "@pick(['运行中', '停机', '维护中'])",
      current_product: () => Mock.Random.pick(products).product_name,
      efficiency: "@float(75, 95, 1, 1)",
      output_today: "@natural(200, 800)",
      workers_count: "@natural(5, 15)",
      shift: "@pick(['早班', '中班', '晚班'])",
      last_maintenance: "@date('yyyy-MM-dd')",
      equipment_list: Mock.mock({
        "list|3-6": [
          {
            equipment_id: () => `eq-${Mock.Random.string("number", 3)}`,
            equipment_name: "@pick(['注塑机1号', '喷漆机1号', '丝印机1号', '烫金机1号'])",
            status: "@pick(['运行中', '停机', '维护中'])",
          },
        ],
      }).list,
      created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      updated_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
    },
  })
})

export default {}
