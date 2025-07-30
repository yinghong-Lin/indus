import Mock from "mockjs"

// 原料类型
const materialTypes = ["塑料原料", "化学原料", "金属原料", "辅助材料", "包装材料"]

// 原料状态
const materialStatuses = ["在用", "停用", "待审核", "已淘汰"]

// 单位
const units = ["千克", "吨", "升", "立方米", "个", "包", "箱"]

// 获取原料列表接口
Mock.mock(/\/material\/list/, "get", (options) => {
  const url = new URL("http://localhost" + options.url)
  const page = Number.parseInt(url.searchParams.get("page")) || 1
  const page_size = Number.parseInt(url.searchParams.get("page_size")) || 20

  const materials = Mock.mock({
    "list|20-30": [
      {
        "material_id|+1": () => `material-${Mock.Random.string("number", 6)}`,
        material_name:
          "@pick(['聚乙烯树脂', 'PVC粉料', '丙烯酸树脂', '环氧树脂', '聚氨酯', '硅胶', '钛白粉', '碳酸钙', '玻璃纤维', '阻燃剂'])",
        material_type: () => Mock.Random.pick(materialTypes),
        material_status: () => Mock.Random.pick(materialStatuses),
        material_unit: () => Mock.Random.pick(units),
        material_spec: () =>
          Mock.Random.pick(["PE100", "PVC-S", "Grade A", "Industrial", "Food Grade", "Medical Grade"]),
        material_description: "@sentence(10, 20)",
        usage_date: "@datetime('yyyy-MM-ddTHH:mm:ss')",
        discontinuation_date: function () {
          return this.material_status === "已淘汰" ? Mock.Random.datetime("yyyy-MM-ddTHH:mm:ss") : null
        },
        material_remarks: "@sentence(5, 15)",
        supplier: "@company",
        unit_price: "@float(10, 1000, 2, 2)",
        stock_quantity: "@natural(100, 10000)",
        min_stock: "@natural(50, 500)",
        created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
        updated_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      },
    ],
  }).list

  const total = materials.length
  const start = (page - 1) * page_size
  const end = start + page_size
  const list = materials.slice(start, end)

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

// 创建原料接口
Mock.mock("/material/create", "post", (options) => {
  const materialData = JSON.parse(options.body)

  return {
    code: 200,
    message: "原料创建成功",
    data: {
      material_id: `material-${Mock.Random.string("number", 6)}`,
      ...materialData,
      created_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
      updated_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    },
  }
})

// 查询原料接口
Mock.mock("/material/select", "post", (options) => {
  const { material_name } = JSON.parse(options.body)

  return Mock.mock({
    code: 200,
    message: "success",
    data: {
      material_id: () => `material-${Mock.Random.string("number", 6)}`,
      material_name: material_name,
      material_type: () => Mock.Random.pick(materialTypes),
      material_status: () => Mock.Random.pick(materialStatuses),
      material_unit: () => Mock.Random.pick(units),
      material_spec: () => Mock.Random.pick(["PE100", "PVC-S", "Grade A", "Industrial"]),
      material_description: "@sentence(10, 20)",
      usage_date: "@datetime('yyyy-MM-ddTHH:mm:ss')",
      discontinuation_date: function () {
        return this.material_status === "已淘汰" ? Mock.Random.datetime("yyyy-MM-ddTHH:mm:ss") : null
      },
      material_remarks: "@sentence(5, 15)",
      supplier: "@company",
      unit_price: "@float(10, 1000, 2, 2)",
      stock_quantity: "@natural(100, 10000)",
      min_stock: "@natural(50, 500)",
      created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      updated_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
    },
  })
})

// 更新原料接口
Mock.mock("/material/update", "post", (options) => {
  const materialData = JSON.parse(options.body)

  return {
    code: 200,
    message: "原料更新成功",
    data: {
      ...materialData,
      updated_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    },
  }
})

// 删除原料接口
Mock.mock("/material/delete", "delete", (options) => {
  const { material_name } = JSON.parse(options.body)

  return {
    code: 200,
    message: "原料删除成功",
    data: {
      material_name: material_name,
      deleted_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    },
  }
})

export default {}
