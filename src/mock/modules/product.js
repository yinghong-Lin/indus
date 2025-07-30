import Mock from "mockjs"

// 产品类型
const productTypes = ["塑料制品", "金属制品", "化工产品", "电子产品", "包装产品"]

// 产品状态
const productStatuses = ["生产中", "停产", "研发中", "已淘汰"]

// 产品分类
const productCategories = ["管材", "板材", "容器", "配件", "原料", "成品"]

// 单位
const units = ["米", "平方米", "个", "套", "千克", "升", "箱"]

// 获取产品列表接口
Mock.mock(/\/product\/list/, "get", (options) => {
  const url = new URL("http://localhost" + options.url)
  const page = Number.parseInt(url.searchParams.get("page")) || 1
  const page_size = Number.parseInt(url.searchParams.get("page_size")) || 20

  const products = Mock.mock({
    "list|20-30": [
      {
        "product_id|+1": () => `product-${Mock.Random.string("number", 6)}`,
        product_name:
          "@pick(['PVC管材', '化妆品包装盒', '注塑件', '丝印标签', '烫金标识', 'PE管道', '亚克力板', '塑料容器', '电子外壳', '汽车配件'])",
        product_type: () => Mock.Random.pick(productTypes),
        product_status: () => Mock.Random.pick(productStatuses),
        product_category: () => Mock.Random.pick(productCategories),
        product_unit: () => Mock.Random.pick(units),
        product_spec: () => Mock.Random.pick(["DN50", "DN100", "200x300mm", "Standard", "Premium", "Custom"]),
        product_description: "@sentence(10, 20)",
        production_date: "@datetime('yyyy-MM-ddTHH:mm:ss')",
        discontinuation_date: function () {
          return this.product_status === "已淘汰" ? Mock.Random.datetime("yyyy-MM-ddTHH:mm:ss") : null
        },
        product_remarks: "@sentence(5, 15)",
        unit_price: "@float(50, 5000, 2, 2)",
        production_cost: "@float(30, 3000, 2, 2)",
        quality_standard: "@pick(['A级', 'B级', 'C级', '优等品', '一等品', '合格品'])",
        created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
        updated_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      },
    ],
  }).list

  const total = products.length
  const start = (page - 1) * page_size
  const end = start + page_size
  const list = products.slice(start, end)

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

// 创建产品接口
Mock.mock("/product/create", "post", (options) => {
  const productData = JSON.parse(options.body)

  return {
    code: 200,
    message: "产品创建成功",
    data: {
      product_id: `product-${Mock.Random.string("number", 6)}`,
      ...productData,
      created_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
      updated_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    },
  }
})

// 查询产品接口
Mock.mock("/product/select", "post", (options) => {
  const { product_name } = JSON.parse(options.body)

  return Mock.mock({
    code: 200,
    message: "success",
    data: {
      product_id: () => `product-${Mock.Random.string("number", 6)}`,
      product_name: product_name,
      product_type: () => Mock.Random.pick(productTypes),
      product_status: () => Mock.Random.pick(productStatuses),
      product_category: () => Mock.Random.pick(productCategories),
      product_unit: () => Mock.Random.pick(units),
      product_spec: () => Mock.Random.pick(["DN50", "DN100", "200x300mm", "Standard"]),
      product_description: "@sentence(10, 20)",
      production_date: "@datetime('yyyy-MM-ddTHH:mm:ss')",
      discontinuation_date: function () {
        return this.product_status === "已淘汰" ? Mock.Random.datetime("yyyy-MM-ddTHH:mm:ss") : null
      },
      product_remarks: "@sentence(5, 15)",
      unit_price: "@float(50, 5000, 2, 2)",
      production_cost: "@float(30, 3000, 2, 2)",
      quality_standard: "@pick(['A级', 'B级', 'C级', '优等品'])",
      created_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
      updated_time: "@datetime('yyyy-MM-dd HH:mm:ss')",
    },
  })
})

// 更新产品接口
Mock.mock("/product/update", "post", (options) => {
  const productData = JSON.parse(options.body)

  return {
    code: 200,
    message: "产品更新成功",
    data: {
      ...productData,
      updated_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    },
  }
})

// 删除产品接口
Mock.mock("/product/delete", "delete", (options) => {
  const { product_name } = JSON.parse(options.body)

  return {
    code: 200,
    message: "产品删除成功",
    data: {
      product_name: product_name,
      deleted_time: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    },
  }
})

export default {}
