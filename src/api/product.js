import request from "./index"

export const productAPI = {
  // 获取产品列表
  getProductList(params) {
    return request.get("/product/list", { params })
  },

  // 创建产品
  createProduct(productData) {
    return request.post("/product/create", productData)
  },

  // 查询产品
  selectProduct(product_name) {
    return request.post("/product/select", { product_name })
  },

  // 更新产品
  updateProduct(productData) {
    return request.post("/product/update", productData)
  },

  // 删除产品
  deleteProduct(product_name) {
    return request.delete("/product/delete", { data: { product_name } })
  },
}
