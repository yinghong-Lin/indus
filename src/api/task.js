import request from "./index"

export const taskAPI = {
  // 获取生产任务列表
  getTaskList(params) {
    return request.get("/task/list", { params })
  },

  // 查询生产任务详情
  getTaskDetail(task_id) {
    return request.post("/task/detail", { task_id })
  },

  // 创建生产任务
  createTask(taskData) {
    return request.post("/task/create", taskData)
  },
}
