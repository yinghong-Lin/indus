<template>
  <div class="task-board">
    <div class="task-header">
      <div class="left-controls">
        <el-button @click="goPrev" circle><el-icon><ArrowLeft /></el-icon></el-button>
        <el-button @click="goNext" circle><el-icon><ArrowRight /></el-icon></el-button>
        <el-select v-model="viewMode" style="width: 120px">
          <el-option label="日视图" value="day" />
          <el-option label="周视图" value="week" />
          <el-option label="月视图" value="month" />
        </el-select>
        <el-switch
          v-model="showCompleted"
          active-text="显示已完成"
          inactive-text="隐藏已完成"
          style="margin-left: 20px"
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
            :key="task.id"
            class="task-item"
            :class="getTaskStatusClass(task)"
            @click="showTaskDetail(task)"
          >
            <div class="task-info">
              <div class="name">{{ task.task_name }}</div>
              <div class="meta">截止：{{ task.end_time }}</div>
            </div>
            <div class="task-actions">
              <el-button
                v-if="task.task_status === 'pending'"
                size="small"
                type="primary"
                @click.stop="startTask(task)"
              >开始</el-button>
              <el-button
                v-else-if="task.task_status === 'running'"
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
          <div v-for="day in 7" :key="day" class="week-day">
            <h3>{{ getWeekDayLabel(day) }}</h3>
            <div
              v-for="task in getTasksForDay(dayOffset(day))"
              :key="task.id"
              class="task-item mini"
              @click="showTaskDetail(task)"
            >
              {{ task.task_name }}<span v-if="task.task_status === 'completed'"> ✅</span>
            </div>
            <div v-if="!getTasksForDay(dayOffset(day)).length" class="no-task-mini">暂无任务</div>
          </div>
        </div>
      </template>

      <template v-else-if="viewMode === 'month'">
        <h2 class="date-title">{{ formatDate(currentDate, 'YYYY-MM') }}</h2>
        <div class="month-grid">
          <div
            v-for="day in getMonthDays(currentDate)"
            :key="day.date"
            class="month-day"
          >
            <div class="day-label">{{ day.label }}</div>
            <div v-if="day.tasks.length" class="month-tasks">
              <div
                v-for="task in day.tasks"
                :key="task.id"
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
      <el-form :model="newTask" label-width="100px">
        <el-form-item label="任务编号">
          <el-input v-model="newTask.task_id" :disabled="isEditing" placeholder="自动编号或手动填写" />
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input v-model="newTask.task_name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="产品">
          <el-select v-model="newTask.product_id" filterable placeholder="请选择产品">
            <el-option label="化妆品包装盒" value="prod-001" />
            <el-option label="注塑件" value="prod-002" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="newTask.production_quantity" :min="1" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newTask.task_priority">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="newTask.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="newTask.start_time" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker v-model="newTask.end_time" type="datetime" placeholder="选择截止时间" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="newTask.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitTask">{{ isEditing ? '保存修改' : '添加任务' }}</el-button>
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
        <p><strong>负责人：</strong>{{ selectedTask.leader }}</p>
        <p><strong>开始时间：</strong>{{ formatDate(selectedTask.start_time, 'YYYY-MM-DD HH:mm') }}</p>
        <p><strong>截止时间：</strong>{{ formatDate(selectedTask.end_time, 'YYYY-MM-DD HH:mm') }}</p>
        <p><strong>备注：</strong>{{ selectedTask.remark }}</p>
        <p><strong>状态：</strong>{{ statusText(selectedTask.task_status) }}</p>

        <div class="task-actions" style="margin-top: 16px;">
          <el-button v-if="selectedTask.task_status === 'pending'" type="primary" @click="startTask(selectedTask)">开始任务</el-button>
          <el-button v-else-if="selectedTask.task_status === 'running'" type="success" @click="completeTask(selectedTask)">完成任务</el-button>
          <el-button type="warning" @click="openEditDialog(selectedTask)">编辑任务</el-button>
          <el-button type="danger" v-if="isEditing" @click="deleteTask(editingTask.value)">删除</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import dayjs from 'dayjs'
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskAPI } from '../api/task'

const currentDate = ref(dayjs())
const viewMode = ref('day')
const showAddDialog = ref(false)
const showCompleted = ref(true)
const showDetailDialog = ref(false)
const selectedTask = ref(null)
const isEditing = ref(false)
const editingTask = ref(null)

const newTask = reactive({
  task_id: '',
  task_name: '',
  product_id: '',
  product_name: computed(() => {
    const map = { 'prod-001': '化妆品包装盒', 'prod-002': '注塑件' }
    return map[newTask.product_id] || ''
  }),
  production_quantity: 1000,
  task_priority: 'medium',
  leader: '',
  start_time: '',
  end_time: '',
  remark: '',
  task_status: 'pending'
})

const tasks = reactive([
  {
    id: 1,
    task_id: 'TASK-20250715001',
    task_name: '化妆品包装盒生产',
    product_id: 'prod-001',
    product_name: '化妆品包装盒',
    production_quantity: 4000,
    task_priority: 'high',
    leader: '张三',
    start_time: '2025-07-15 08:00',
    end_time: '2025-07-20 18:00',
    remark: '客户加急，需优先完成',
    task_status: 'pending'
  }
])

const formatDate = (date, fmt = 'YYYY-MM-DD') => dayjs(date).format(fmt)

const formatWeekTitle = (date) => {
  const start = dayjs(date).startOf('week')
  const end = dayjs(date).endOf('week')
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

const filteredTasks = computed(() => {
  return tasks.filter(task => {
    const matchDate = dayjs(task.end_time).isSame(currentDate.value, 'day')
    const show = showCompleted.value || task.task_status !== 'completed'
    return matchDate && show
  })
})

const goPrev = () => {
  const unit = viewMode.value === 'day' ? 'day' : viewMode.value === 'week' ? 'week' : 'month'
  currentDate.value = currentDate.value.subtract(1, unit)
}

const goNext = () => {
  const unit = viewMode.value === 'day' ? 'day' : viewMode.value === 'week' ? 'week' : 'month'
  currentDate.value = currentDate.value.add(1, unit)
}

const openAddDialog = () => {
  isEditing.value = false
  Object.assign(newTask, {
    task_id: '',
    task_name: '',
    product_id: '',
    production_quantity: 1000,
    task_priority: 'medium',
    leader: '',
    start_time: '',
    end_time: '',
    remark: '',
    task_status: 'pending'
  })
  showAddDialog.value = true
}

const openEditDialog = (task) => {
  isEditing.value = true
  editingTask.value = task
  Object.assign(newTask, {
    task_id: task.task_id,
    task_name: task.task_name,
    product_id: task.product_id,
    production_quantity: task.production_quantity,
    task_priority: task.task_priority,
    leader: task.leader,
    start_time: dayjs(task.start_time).toDate(),
    end_time: dayjs(task.end_time).toDate(),
    remark: task.remark
  })
  showDetailDialog.value = false
  showAddDialog.value = true
}

const submitTask = () => {
  if (!newTask.task_name || !newTask.end_time) return

  const taskData = {
    task_id: newTask.task_id || `TASK-${dayjs().format('YYYYMMDDHHmmss')}`,
    task_name: newTask.task_name,
    product_id: newTask.product_id,
    product_name: newTask.product_name,
    production_quantity: newTask.production_quantity,
    task_priority: newTask.task_priority,
    leader: newTask.leader,
    start_time: formatDate(newTask.start_time, 'YYYY-MM-DD HH:mm'),
    end_time: formatDate(newTask.end_time, 'YYYY-MM-DD HH:mm'),
    remark: newTask.remark,
    task_status: isEditing.value ? editingTask.value.task_status : 'pending'
  }

  if (isEditing.value) {
    Object.assign(editingTask.value, taskData)
    ElMessage.success('任务已更新')
  } else {
    tasks.push({ id: Date.now(), ...taskData })
    ElMessage.success('任务已添加')
  }

  showAddDialog.value = false
}

const deleteTask = (task) => {
  ElMessageBox.confirm('确定要删除此任务吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tasks.findIndex(t => t.id === task.id)
    if (index !== -1) tasks.splice(index, 1)
    ElMessage.success('任务已删除')
    showAddDialog.value = false
  })
}

const startTask = (task) => {
  task.task_status = 'running'
  ElMessage.success('任务已开始')
}

const completeTask = (task) => {
  task.task_status = 'completed'
  ElMessage.success('任务已完成')
}

const priorityText = (p) => ({ high: '高', medium: '中', low: '低' }[p])
const statusText = (s) => ({ pending: '待开始', running: '进行中', completed: '已完成' }[s])

const getWeekDayLabel = (day) => ['周日','周一','周二','周三','周四','周五','周六'][day % 7]
const dayOffset = (d) => dayjs(currentDate.value).startOf('week').add(d - 1, 'day')
const getTasksForDay = (date) => tasks.filter(t => dayjs(t.end_time).isSame(date, 'day') && (showCompleted.value || t.task_status !== 'completed'))

const getMonthDays = (date) => {
  const days = []
  const start = dayjs(date).startOf('month')
  const end = dayjs(date).endOf('month')
  for (let d = start; d.isSameOrBefore(end); d = d.add(1, 'day')) {
    const tasksForDay = tasks.filter(t => dayjs(t.end_time).isSame(d, 'day') && (showCompleted.value || t.task_status !== 'completed'))
    days.push({ date: d.format('YYYY-MM-DD'), label: d.format('D'), tasks: tasksForDay })
  }
  return days
}

const getTaskStatusClass = (task) => `task-${task.task_status}`

const showTaskDetail = (task) => {
  selectedTask.value = task
  showDetailDialog.value = true
}
</script>

<style scoped>
.task-board {
  padding: 20px;
  background: #1a1a1a;
  color: #ffffff;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.left-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}
.task-content {
  margin-top: 20px;
}
.date-title {
  font-size: 20px;
  margin-bottom: 10px;
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.task-item {
  background: #262626;
  padding: 10px 15px;
  border: 1px solid #444;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.task-item.task-pending   { background-color: #ff4d4f4f; }
.task-item.task-running   { background-color: #ffbd4d; }
.task-item.task-completed { background-color: #4caf50; }
.task-info .name { font-weight: bold; margin-bottom: 4px; }
.task-actions { display: flex; gap: 10px; align-items: center; }
.no-task { color: #888; text-align: center; margin-top: 40px; }
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}
.week-day {
  background: #262626;
  padding: 10px;
  border-radius: 6px;
}
.week-day h3 { margin: 0 0 10px; font-size: 16px; }
.task-item.mini {
  font-size: 13px;
  padding: 4px 6px;
  background: #333;
  margin-bottom: 5px;
  border-radius: 4px;
}
.no-task-mini { font-size: 12px; color: #666; }
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.month-day {
  background: #202020;
  padding: 8px;
  border-radius: 6px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
}
.day-label { font-size: 14px; margin-bottom: 6px; color: #ccc; }
.month-tasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
.month-task-item {
  background: #333;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
