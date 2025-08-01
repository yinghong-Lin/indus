import request from "./index"

export const taskAPI = {
  // 获取生产任务列表
  getProductionTaskList(params) {
    return request.get("/productionTask/getProductionTaskList", { params })
  },

  // 根据id获取任务信息
  getProductionTaskById(task_id) {
    return request.get("/productionTask/getProductionTaskById", {
      params: { task_id },
    })
  },

  // 新增生产任务
  addProductionTask(taskData) {
    return request.post("/productionTask/addProductionTask", taskData)
  },

  // 更新生产任务 (全量更新)
  updateProductionTask(taskData) {
    return request.put("/productionTask/updatProductionTask", taskData)
  },

  // 删除生产任务
  deleteProductionTask(task_id) {
    return request.delete("/productionTask/deleteProductionTask", {
      params: { task_id },
    })
  },

  // 更新生产任务状态
  updateProductionTaskStatus(task_id, status) {
    return request.patch("/productionTask/updateProductionTaskStatus", null, {
      params: { task_id, status },
    })
  },
}
