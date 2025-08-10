import request from './index'

export const productAPI = {
    // 获取分页产品列表
    getProductList: (page = 1, page_size = 10) =>
        request.get('/product/getProductList', {
            params: { page, page_size }
        }),

    // 根据ID获取产品详情
    getProductById: (product_id) =>
        request.get('/product/getProductById', {
            params: { product_id }
        }),

    // 添加新产品
    addProduct: (data) =>
        request.post("/product/addProduct", data),

    // 更新产品信息
    updateProduct: (data) =>
        request.put("/product/updateProduct", data),

    // 删除产品
    deleteProduct: (product_id) =>
        request.delete("/product/deleteProduct", {
            params: { product_id }
        }),

    // 更新产品状态 [FIXED: 改为POST + 查询参数]
    updateProductStatus: (product_id, status) =>
        request.post("/product/updateProductStatus", null, {
            params: { product_id, status }
        }),

    // 搜索产品 [FIXED: 添加分页参数+正确传递方式]
    searchProducts: (keyword, page = 1, page_size = 10) =>
        request.get("/product/searchProduct", {
            params: { keyword, page, page_size }
        }),
}