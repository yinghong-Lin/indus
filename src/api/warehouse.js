import request from './index'

export const warehouseAPI = {
    // 获取分页仓库列表
    getWarehouseList: (page = 1, page_size = 10) =>
        request.get('/warehouse/getWarehouseList', {
            params: { page, page_size }
        }),

    // 根据ID获取仓库信息
    getWarehouseById: (warehouse_id) =>
        request.get('/warehouse/getWarehouseById', {
            params: { warehouse_id }
        }),

    // 新增仓库
    addWarehouse: (data) =>
        request.post("/warehouse/addWarehouse", data),

    // 更新仓库信息
    updateWarehouse: (data) =>
        request.put("/warehouse/updateWarehouse", data),

    // 删除仓库
    deleteWarehouse: (warehouse_id) =>
        request.delete("/warehouse/deleteWarehouse", {
            params: { warehouse_id }
        }),

    // 搜索仓库
    searchWarehouse: (keyword, page = 1, page_size = 10) =>
        request.get("/warehouse/searchWarehouse", {
            params: { keyword, page, page_size }
        }),

    // 获取仓库详情（分页）
    getWarehouseDetail: (warehouse_id, page = 1, page_size = 10) =>
        request.get("/warehouse/getWarehouseDetail", {
            params: { warehouse_id, page, page_size }
        }),

    // 产品入库
    productInbound: (warehouse_name, product_name, quantity) =>
        request.post("/warehouse/productInbound", null, {
            params: { warehouse_name, product_name, quantity }
        }),

    // 产品出库
    productOutbound: (warehouse_name, product_name, quantity) =>
        request.post("/warehouse/productOutbound", null, {
            params: { warehouse_name, product_name, quantity }
        }),
}