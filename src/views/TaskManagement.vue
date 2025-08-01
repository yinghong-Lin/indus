<template>
  <div class="task-board">
    <div class="task-header">
      <div class="left-controls">
        <el-button @click="goPrev" circle><el-icon><ArrowLeft /></el-icon></el-button>
        <el-button @click="goNext" circle><el-icon><ArrowRight /></el-icon></el-button>
        <el-select v-model="viewMode" style="width: 120px" @change="fetchTasks">
          <el-option label="日视图" value="day" />
          <el-option label="周视图" value="week" />
          <el-option label="月视图" value="month" />
        </el-select>
        <el-switch
          v-model="showCompleted"
          active-text="显示已完成"
          inactive-text="隐藏已完成"
          style="margin-left: 20px"
          @change="fetchTasks"
        />
      </div>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加任务
      </el-button>
    </div>

    <div class="task-content">
      <template v-if="viewMode === 'day'">
        <h2 class="date-title">{{ formatDate(currentDate, 'YYYY-MM-DD') }}</h2>
        <div v-if="filteredTasks.length" class="task-list">
          <div
            v-for="task in filteredTasks"
            :key="task.task_id"
            class="task-item"
            :class="getTaskStatusClass(task)"
            @click="showTaskDetail(task)"
          >
            <div class="task-info">
              <div class="name">{{ task.task_name }}</div>
              <div class="meta">截止：{{ formatDate(task.end_time, 'YYYY-MM-DD HH:mm') }}</div>
            </div>
            <div class="task-actions">
              <el-button
                v-if="task.task_status === 'not_started'"
                size="small"
                type="primary"
                @click.stop="startTask(task)"
              >开始</el-button>
              <el-button
                v-else-if="task.task_status === 'in_progress'"
                size="small"
                type="success"
                @click.stop="completeTask(task)"
              >结束</el-button>
              <el-tag v-else type="success" size="small">已完成</el-tag>
            </div>
          </div>
        </div>
        <div v-else class="no-task">暂无任务</div>
      </template>

      <template v-else-if="viewMode === 'week'">
        <h2 class="date-title">{{ formatWeekTitle(currentDate) }}</h2>
        <div class="week-grid">
          <div v-for="day in weekDays" :key="day.date" class="week-day">
            <h3>{{ day.label }}</h3>
            <div
              v-for="task in day.tasks"
              :key="task.task_id"
              class="task-item mini"
              @click="showTaskDetail(task)"
            >
              {{ task.task_name }}<span v-if="task.task_status === 'completed'"> ✅</span>
            </div>
            <div v-if="!day.tasks.length" class="no-task-mini">暂无任务</div>
          </div>
        </div>
      </template>

      <template v-else-if="viewMode === 'month'">
        <h2 class="date-title">{{ formatDate(currentDate, 'YYYY-MM') }}</h2>
        <div class="month-grid">
          <div
            v-for="day in monthDays"
            :key="day.date"
            class="month-day"
          >
            <div class="day-label">{{ day.label }}</div>
            <div v-if="day.tasks.length" class="month-tasks">
              <div
                v-for="task in day.tasks"
                :key="task.task_id"
                class="month-task-item"
                @click="showTaskDetail(task)"
              >
                {{ task.task_name }}<span v-if="task.task_status === 'completed'"> ✅</span>
              </div>
            </div>
            <div v-else class="no-task-mini">暂无</div>
          </div>
        </div>
      </template>
    </div>

    <!-- 添加/编辑任务对话框 -->
    <el-dialog v-model="showAddDialog" :title="isEditing ? '编辑任务' : '添加任务'" width="500px">
      <el-form :model="newTask" :rules="taskFormRules" ref="taskFormRef" label-width="100px">
        <el-form-item label="任务名称" prop="task_name">
          <el-input v-model="newTask.task_name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="产品名称" prop="product_name">
          <el-input v-model="newTask.product_name" filterable placeholder="请输入产品" class="full-width" />
        </el-form-item>
        <el-form-item label="数量" prop="production_quantity">
          <el-input-number v-model="newTask.production_quantity" :min="1" class="full-width" />
        </el-form-item>
        <el-form-item label="优先级" prop="task_priority">
          <el-select v-model="newTask.task_priority" class="full-width">
            <el-option label="高" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="低" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker v-model="newTask.start_time" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DD HH:mm:ss" class="full-width" />
        </el-form-item>
        <el-form-item label="截止时间" prop="end_time">
          <el-date-picker v-model="newTask.end_time" type="datetime" placeholder="选择截止时间" value-format="YYYY-MM-DD HH:mm:ss" class="full-width" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitTask" :loading="submitLoading">{{ isEditing ? '保存修改' : '添加任务' }}</el-button>
      </template>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="任务详情" width="500px">
      <div v-if="selectedTask">
        <p><strong>任务编号：</strong>{{ selectedTask.task_id }}</p>
        <p><strong>任务名称：</strong>{{ selectedTask.task_name }}</p>
        <p><strong>产品名称：</strong>{{ selectedTask.product_name }}</p>
        <p><strong>数量：</strong>{{ selectedTask.production_quantity }}</p>
        <p><strong>优先级：</strong>{{ priorityText(selectedTask.task_priority) }}</p>
        <p><strong>开始时间：</strong>{{ formatDate(selectedTask.start_time, 'YYYY-MM-DD HH:mm') }}</p>
        <p><strong>截止时间：</strong>{{ formatDate(selectedTask.end_time, 'YYYY-MM-DD HH:mm') }}</p>
        <p><strong>实际完成时间：</strong>{{ selectedTask.actual_end_time ? formatDate(selectedTask.actual_end_time, 'YYYY-MM-DD HH:mm') : 'N/A' }}</p>
        <p><strong>进度：</strong>{{ (selectedTask.production_progress * 100).toFixed(0) }}%</p>
        <p><strong>状态：</strong>{{ statusText(selectedTask.task_status) }}</p>

        <div class="task-actions" style="margin-top: 16px;">
          <el-button v-if="selectedTask.task_status === 'not_started'" type="primary" @click="startTask(selectedTask)">开始任务</el-button>
          <el-button v-else-if="selectedTask.task_status === 'in_progress'" type="success" @click="completeTask(selectedTask)">完成任务</el-button>
          <el-button type="warning" @click="openEditDialog(selectedTask)">编辑任务</el-button>
          <el-button type="danger" @click="deleteTask(selectedTask)">删除</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskAPI } from '../api/task'

dayjs.extend(weekOfYear)
dayjs.extend(isSameOrBefore)

const currentDate = ref(dayjs())
const viewMode = ref('day')
const showAddDialog = ref(false)
const showCompleted = ref(true)
const showDetailDialog = ref(false)
const selectedTask = ref(null)
const isEditing = ref(false)
const submitLoading = ref(false)

const tasks = ref([]) // 存储从API获取的任务列表

const newTask = reactive({
  // task_id is generated by backend for add, not sent from frontend
  task_name: '',
  product_name: '',
  production_quantity: 1000,
  task_priority: 2, // 默认中优先级
  start_time: '',
  end_time: '',
})

const taskFormRef = ref(null)
const taskFormRules = {
  task_name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  product_name: [{ required: true, message: '请选择产品', trigger: 'change' }],
  production_quantity: [{ required: true, message: '请输入生产数量', trigger: 'blur' }],
  task_priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
}

const formatDate = (date, fmt = 'YYYY-MM-DD') => {
  if (!date) return '-'
  // Ensure date is parsed correctly, especially if it's an ISO string from API
  return dayjs(date).format(fmt)
}

const formatWeekTitle = (date) => {
  const start = dayjs(date).startOf('week')
  const end = dayjs(date).endOf('week')
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

const fetchTasks = async () => {
  try {
    const params = {
      view_type: viewMode.value,
      date: currentDate.value.format('YYYY-MM-DD'),
      task_status: showCompleted.value ? '' : 'not_started,in_progress' // 如果显示已完成，则不筛选状态
    }
    const response = await taskAPI.getProductionTaskList(params)
    if (response.code === 200) {
      tasks.value = response.data.tasks || []
    } else {
      ElMessage.error(response.msg || '获取任务列表失败')
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  }
}

const filteredTasks = computed(() => {
  // For day view, tasks are already filtered by date in fetchTasks
  // This computed property is mainly for the `showCompleted` toggle on the client side
  return tasks.value.filter(task => {
    return showCompleted.value || task.task_status !== 'completed'
  })
})

const goPrev = () => {
  const unit = viewMode.value === 'day' ? 'day' : viewMode.value === 'week' ? 'week' : 'month'
  currentDate.value = currentDate.value.subtract(1, unit)
  fetchTasks()
}

const goNext = () => {
  const unit = viewMode.value === 'day' ? 'day' : viewMode.value === 'week' ? 'week' : 'month'
  currentDate.value = currentDate.value.add(1, unit)
  fetchTasks()
}

const openAddDialog = () => {
  isEditing.value = false
  Object.assign(newTask, {
    // task_id: '', // Not sent for add
    task_name: '',
    product_name: '',
    production_quantity: 1000,
    task_priority: 2,
    start_time: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 默认当前时间
    end_time: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'), // 默认明天
  })
  taskFormRef.value?.resetFields()
  showAddDialog.value = true
}

const openEditDialog = async (task) => {
  isEditing.value = true
  selectedTask.value = task // Store the original task for reference
  try {
    const response = await taskAPI.getProductionTaskById(task.task_id)
    if (response.code === 200) {
      const fetchedTask = response.data
      // Assign only fields present in the PUT request body, plus task_id
      Object.assign(newTask, {
        task_id: fetchedTask.task_id,
        task_name: fetchedTask.task_name,
        product_name: fetchedTask.product_name,
        production_quantity: fetchedTask.production_quantity,
        task_priority: fetchedTask.task_priority,
        // production_progress and task_status are handled by updateProductionTaskStatus,
        // actual_end_time is also handled by status update or is null for in_progress/not_started
        start_time: fetchedTask.start_time,
        end_time: fetchedTask.end_time,
      })
      showDetailDialog.value = false
      showAddDialog.value = true
    } else {
      ElMessage.error(response.msg || '获取任务详情失败')
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  }
}

const submitTask = async () => {
  try {
    await taskFormRef.value?.validate()
    submitLoading.value = true

    const payload = { ...newTask }
    // Ensure times are in correct format for API
    payload.start_time = dayjs(payload.start_time).format('YYYY-MM-DD HH:mm:ss');
    payload.end_time = dayjs(payload.end_time).format('YYYY-MM-DD HH:mm:ss');

    let response
    if (isEditing.value) {
      // For PUT, include all fields from the API documentation's request body
      const fullPayload = {
        task_id: payload.task_id,
        task_name: payload.task_name,
        product_name: payload.product_name,
        production_quantity: payload.production_quantity,
        task_priority: payload.task_priority,
        production_progress: selectedTask.value.production_progress, // Keep current progress
        task_status: selectedTask.value.task_status, // Keep current status
        actual_end_time: selectedTask.value.actual_end_time, // Keep current actual_end_time
        start_time: payload.start_time,
        end_time: payload.end_time,
      };
      response = await taskAPI.updateProductionTask(fullPayload)
    } else {
      // For POST, only include fields from the API documentation's request body
      const addPayload = {
        task_name: payload.task_name,
        product_name: payload.product_name,
        production_quantity: payload.production_quantity,
        task_priority: payload.task_priority,
        start_time: payload.start_time,
        end_time: payload.end_time,
      };
      response = await taskAPI.addProductionTask(addPayload)
    }

    if (response.code === 200) {
      ElMessage.success(response.msg || '操作成功')
      showAddDialog.value = false
      fetchTasks() // Refresh list
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error) {
    if (error !== false) { // Form validation failed does not show error
      console.error('提交失败:', error)
      ElMessage.error('操作失败，请检查输入信息')
    }
  } finally {
    submitLoading.value = false
  }
}

const deleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(`确定要删除任务"${task.task_name}"吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const response = await taskAPI.deleteProductionTask(task.task_id)
    if (response.code === 200) {
      ElMessage.success('任务已删除')
      showDetailDialog.value = false
      fetchTasks() // Refresh list
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const startTask = async (task) => {
  try {
    const response = await taskAPI.updateProductionTaskStatus(task.task_id, 'in_progress')
    if (response.code === 200) {
      ElMessage.success('任务已开始')
      fetchTasks() // Refresh list
      showDetailDialog.value = false
    } else {
      ElMessage.error(response.msg || '开始任务失败')
    }
  } catch (error) {
    console.error('开始任务失败:', error)
    ElMessage.error('开始任务失败')
  }
}

const completeTask = async (task) => {
  try {
    const response = await taskAPI.updateProductionTaskStatus(task.task_id, 'completed')
    if (response.code === 200) {
      ElMessage.success('任务已完成')
      fetchTasks() // Refresh list
      showDetailDialog.value = false
    } else {
      ElMessage.error(response.msg || '完成任务失败')
    }
  } catch (error) {
    console.error('完成任务失败:', error)
    ElMessage.error('完成任务失败')
  }
}

const priorityText = (p) => ({ 1: '高', 2: '中', 3: '低' }[p])
const statusText = (s) => ({ not_started: '待开始', in_progress: '进行中', completed: '已完成' }[s])

const getTaskStatusClass = (task) => `task-${task.task_status}`

const showTaskDetail = async (task) => {
  try {
    const response = await taskAPI.getProductionTaskById(task.task_id)
    if (response.code === 200) {
      selectedTask.value = response.data
      showDetailDialog.value = true
    } else {
      ElMessage.error(response.msg || '获取任务详情失败')
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  }
}

// Week view days
const weekDays = computed(() => {
  const days = []
  const startOfWeek = dayjs(currentDate.value).startOf('week')
  for (let i = 0; i < 7; i++) {
    const day = startOfWeek.add(i, 'day')
    const tasksForDay = tasks.value.filter(t => dayjs(t.end_time).isSame(day, 'day') && (showCompleted.value || t.task_status !== 'completed'))
    days.push({
      date: day.format('YYYY-MM-DD'),
      label: day.format('M月D日 (ddd)'),
      tasks: tasksForDay
    })
  }
  return days
})

// Month view days
const monthDays = computed(() => {
  const days = []
  const startOfMonth = dayjs(currentDate.value).startOf('month')
  const endOfMonth = dayjs(currentDate.value).endOf('month')

  // Fill leading blank days
  const firstDayOfWeek = startOfMonth.day() // 0 for Sunday, 1 for Monday
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ date: `blank-${i}`, label: '', tasks: [] })
  }

  for (let d = startOfMonth; d.isSameOrBefore(endOfMonth); d = d.add(1, 'day')) {
    const tasksForDay = tasks.value.filter(t => dayjs(t.end_time).isSame(d, 'day') && (showCompleted.value || t.task_status !== 'completed'))
    days.push({ date: d.format('YYYY-MM-DD'), label: d.format('D'), tasks: tasksForDay })
  }
  return days
})

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.task-board {
  padding: 20px;
  background: #0a0a0a; /* Changed to match global background */
  color: #ffffff;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  min-height: 100vh;
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
}
.left-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}
.task-content {
  margin-top: 20px;
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}
.date-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #ffffff;
  text-align: center;
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.task-item {
  background: rgba(38, 38, 38, 0.9);
  padding: 15px 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.task-item.task-not_started   { border-left: 5px solid #409EFF; } /* Blue for not started */
.task-item.task-in_progress   { border-left: 5px solid #E6A23C; } /* Orange for in progress */
.task-item.task-completed { border-left: 5px solid #67C23A; } /* Green for completed */

.task-info .name { font-weight: bold; margin-bottom: 4px; color: #ffffff; font-size: 16px; }
.task-info .meta { color: #cccccc; font-size: 13px; }
.task-actions { display: flex; gap: 10px; align-items: center; }
.no-task { color: #888; text-align: center; margin-top: 40px; font-size: 16px; }
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}
.week-day {
  background: rgba(38, 38, 38, 0.9);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 150px;
}
.week-day h3 { margin: 0 0 10px; font-size: 18px; color: #ffffff; text-align: center; }
.task-item.mini {
  font-size: 13px;
  padding: 6px 8px;
  background: rgba(64, 64, 64, 0.9);
  margin-bottom: 5px;
  border-radius: 4px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.no-task-mini { font-size: 12px; color: #666; text-align: center; margin-top: 10px; }
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.month-day {
  background: rgba(38, 38, 38, 0.9);
  padding: 10px;
  border-radius: 6px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.day-label { font-size: 14px; margin-bottom: 6px; color: #ccc; text-align: center; }
.month-tasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
.month-task-item {
  background: rgba(64, 64, 64, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.full-width {
  width: 100%;
}

/* Dialog specific styles */
:deep(.el-dialog) {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
:deep(.el-dialog__header) {
  background: rgba(38, 38, 38, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
:deep(.el-dialog__title) {
  color: #ffffff;
}
:deep(.el-form-item__label) {
  color: #ffffff;
}
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-input-number .el-input__wrapper),
:deep(.el-select .el-input__wrapper),
:deep(.el-date-editor .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
:deep(.el-input__inner),
:deep(.el-textarea__inner),
:deep(.el-input-number .el-input__inner) {
  color: #ffffff;
}
:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: #888;
}
:deep(.el-select-dropdown) {
  background-color: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
:deep(.el-select-dropdown__item) {
  color: #ffffff;
}
:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item.selected) {
  background-color: rgba(64, 158, 255, 0.2);
}
:deep(.el-date-picker__header) {
  background-color: rgba(38, 38, 38, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
:deep(.el-date-picker__header-label),
:deep(.el-date-picker__prev-btn),
:deep(.el-date-picker__next-btn) {
  color: #ffffff;
}
:deep(.el-date-table th),
:deep(.el-date-table td) {
  color: #ffffff;
}
:deep(.el-date-table td.current:not(.disabled) span) {
  background-color: #409EFF;
  color: #ffffff;
}
:deep(.el-date-table td.today span) {
  color: #409EFF;
}
</style>
