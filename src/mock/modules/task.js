import Mock from "mockjs"
import dayjs from "dayjs"

const taskStatuses = ["not_started", "in_progress", "completed"]
const taskPriorities = [1, 2, 3] // 1:高, 2:中, 3:低
const productNames = ["化妆品包装盒", "注塑件", "智能手机X", "智能手表Y", "无线耳机B", "平板电脑A"]

const generateTask = (status = Mock.Random.pick(taskStatuses)) => {
  const taskId = Mock.Random.guid()
  const startTime = dayjs(Mock.Random.datetime()).format("YYYY-MM-DDTHH:mm:ss")
  const endTime = dayjs(startTime).add(Mock.Random.natural(1, 5), "day").format("YYYY-MM-DDTHH:mm:ss")
  let actualEndTime = null
  let productionProgress = 0

  if (status === "completed") {
    actualEndTime = dayjs(startTime).add(Mock.Random.natural(1, 4), "day").format("YYYY-MM-DDTHH:mm:ss")
    productionProgress = 1
  } else if (status === "in_progress") {
    productionProgress = Mock.Random.float(0.01, 0.99, 2, 2)
  }

  return {
    task_id: taskId,
    task_name: Mock.Random.csentence(5, 15),
    product_name: Mock.Random.pick(productNames),
    production_quantity: Mock.Random.natural(100, 5000),
    production_progress: productionProgress,
    task_priority: Mock.Random.pick(taskPriorities),
    start_time: startTime,
    end_time: endTime,
    actual_end_time: actualEndTime,
    task_status: status,
    created_at: dayjs(Mock.Random.datetime()).format("YYYY-MM-DDTHH:mm:ss"),
    updated_at: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  }
}

const allTasks = Mock.mock({
  "tasks|50-100": [generateTask],
}).tasks

// GET 获取生产任务列表接口
Mock.mock(/\/api\/productionTask\/getProductionTaskList/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const view_type = u.searchParams.get("view_type") || "day"
  const task_status_filter = u.searchParams.get("task_status")
  const date_filter = u.searchParams.get("date")

  let filteredTasks = [...allTasks]

  // Filter by task_status
  if (task_status_filter) {
    const statuses = task_status_filter.split(",")
    filteredTasks = filteredTasks.filter((task) => statuses.includes(task.task_status))
  }

  // Filter by date based on view_type
  let startDate, endDate
  if (date_filter) {
    const filterDay = dayjs(date_filter)
    if (view_type === "day") {
      startDate = filterDay.startOf("day")
      endDate = filterDay.endOf("day")
    } else if (view_type === "week") {
      startDate = filterDay.startOf("week")
      endDate = filterDay.endOf("week")
    } else if (view_type === "month") {
      startDate = filterDay.startOf("month")
      endDate = filterDay.endOf("month")
    } else if (view_type === "year") {
      startDate = filterDay.startOf("year")
      endDate = filterDay.endOf("year")
    }
    filteredTasks = filteredTasks.filter((task) => {
      const taskEndTime = dayjs(task.end_time)
      return taskEndTime.isAfter(startDate) && taskEndTime.isBefore(endDate)
    })
  }

  return {
    code: 200,
    msg: "获取生产任务列表成功",
    data: {
      tasks: filteredTasks,
      date_range: {
        view_type: view_type,
        start_date: startDate ? startDate.toISOString().replace(/\.\d+Z$/, "") : null,
        end_date: endDate ? endDate.toISOString().replace(/\.\d+Z$/, "") : null,
      },
    },
  }
})

// GET 根据id获取任务信息接口
Mock.mock(/\/api\/productionTask\/getProductionTaskById/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const task_id = u.searchParams.get("task_id")
  const task = allTasks.find((t) => t.task_id === task_id)

  if (task) {
    // Return only fields specified in the API documentation for this endpoint
    return {
      code: 200,
      msg: "获取成功",
      data: {
        task_id: task.task_id,
        task_name: task.task_name,
        production_quantity: task.production_quantity,
        production_progress: task.production_progress,
        task_priority: task.task_priority,
        start_time: task.start_time,
        end_time: task.end_time,
        actual_end_time: task.actual_end_time,
        task_status: task.task_status,
        created_at: task.created_at,
        updated_at: task.updated_at,
        product_name: task.product_name,
        // leader and remark are not in the API response for this endpoint
      },
    }
  } else {
    return {
      code: 404,
      msg: "任务不存在",
      data: null,
    }
  }
})

// POST 新增生产任务接口
Mock.mock("/api/productionTask/addProductionTask", "post", (options) => {
  const { task_name, product_name, production_quantity, task_priority, start_time, end_time } = JSON.parse(options.body)

  const newTask = {
    task_id: Mock.Random.guid(),
    task_name,
    product_name,
    production_quantity,
    production_progress: 0, // New tasks start with 0 progress
    task_priority,
    start_time: dayjs(start_time).format("YYYY-MM-DDTHH:mm:ss"),
    end_time: dayjs(end_time).format("YYYY-MM-DDTHH:mm:ss"),
    actual_end_time: null,
    task_status: "not_started", // New tasks are not_started
    created_at: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    updated_at: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  }
  allTasks.push(newTask)
  return {
    code: 200,
    msg: "新增成功",
    data: newTask,
  }
})

// PUT 更新生产任务接口 (全量更新)
Mock.mock("/api/productionTask/updatProductionTask", "put", (options) => {
  const {
    task_id,
    task_name,
    product_name,
    production_quantity,
    task_priority,
    production_progress,
    task_status,
    actual_end_time,
    start_time,
    end_time,
  } = JSON.parse(options.body)

  const index = allTasks.findIndex((t) => t.task_id === task_id)

  if (index > -1) {
    const updatedTask = {
      ...allTasks[index], // Keep existing fields like created_at
      task_id,
      task_name,
      product_name,
      production_quantity,
      task_priority,
      production_progress,
      task_status,
      actual_end_time: actual_end_time ? dayjs(actual_end_time).format("YYYY-MM-DDTHH:mm:ss") : null,
      start_time: dayjs(start_time).format("YYYY-MM-DDTHH:mm:ss"),
      end_time: dayjs(end_time).format("YYYY-MM-DDTHH:mm:ss"),
      updated_at: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    }
    allTasks[index] = updatedTask
    return {
      code: 200,
      msg: "更新成功",
      data: updatedTask,
    }
  } else {
    return {
      code: 404,
      msg: "任务不存在",
      data: null,
    }
  }
})

// DEL 删除生产任务接口
Mock.mock(/\/api\/productionTask\/deleteProductionTask/, "delete", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const task_id = u.searchParams.get("task_id")
  const index = allTasks.findIndex((t) => t.task_id === task_id)

  if (index > -1) {
    allTasks.splice(index, 1)
    return {
      code: 200,
      msg: `成功删除id为'${task_id}'的生产任务`,
      data: true,
    }
  } else {
    return {
      code: 404,
      msg: "任务不存在",
      data: false,
    }
  }
})

// PATCH 更新生产任务状态接口
Mock.mock(/\/api\/productionTask\/updateProductionTaskStatus/, "patch", ({ url }) => {
  const u = new URL("http://localhost" + url)
  const task_id = u.searchParams.get("task_id")
  const status = u.searchParams.get("status")

  const task = allTasks.find((t) => t.task_id === task_id)

  if (task) {
    task.task_status = status
    task.updated_at = dayjs().format("YYYY-MM-DDTHH:mm:ss")
    if (status === "completed") {
      task.actual_end_time = dayjs().format("YYYY-MM-DDTHH:mm:ss")
      task.production_progress = 1 // Set progress to 100% when completed
    } else if (status === "in_progress" && task.production_progress === 0) {
      // If starting, set a small initial progress if it's 0
      task.production_progress = 0.01
      task.actual_end_time = null // Clear actual end time if restarting
    } else if (status === "not_started") {
      task.production_progress = 0
      task.actual_end_time = null
    }
    return {
      code: 200,
      msg: `更新id为${task_id}的生产任务状态为${status}`,
      data: task,
    }
  } else {
    return {
      code: 404,
      msg: "任务不存在",
      data: null,
    }
  }
})

console.log("[Mock] 任务管理接口已启动！")
