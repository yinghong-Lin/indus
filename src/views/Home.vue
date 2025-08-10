<template>
  <div class="main-interface">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="status-item">
        <el-icon class="status-icon">
          <Clock />
        </el-icon>
        <span>{{ currentTime }}</span>
      </div>
      <!-- 导出报告按钮 -->
      <div class="export-section">
        <el-button type="success" @click="showExportDialog">
          <el-icon>
            <Download />
          </el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 生产流程图 -->
    <div class="production-flow">
      <div class="flow-title">
        <h2>化妆品生产流程监控</h2>
        <div class="flow-controls">
          <el-button type="primary" size="small" @click="refreshData" :loading="loading">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
          <el-button type="success" size="small" @click="startProduction" :disabled="isProducing || loading">
            <el-icon>
              <VideoPlay />
            </el-icon>
            开始生产
          </el-button>
          <el-button type="danger" size="small" @click="stopAllProduction" :disabled="!isProducing && !isIdle || loading">
            <el-icon>
              <Warning />
            </el-icon>
            暂停生产
          </el-button>
        </div>
      </div>

      <!-- 工艺流程线 -->
      <div class="process-line">
        <!-- 注塑工艺 -->
        <div class="process-station">
          <div class="equipment-image-container" @mouseenter="showTooltip('injection_molding', $event)"
            @mouseleave="hideTooltip" @click="showProcessParameterDialog('injection_molding')">
            <img src="/注塑机.png?height=120&width=160" alt="注塑机" class="equipment-image"
              :class="getWorkshopStatusClass('injection_molding')" />
            <div class="status-indicator" :class="getWorkshopStatus('injection_molding')"></div>
          </div>
        </div>

        <!-- 流程箭头 -->
        <div class="flow-arrow">
          <div class="arrow-line" :class="{ active: isProducing }">
            <div class="arrow-head">→</div>
          </div>
        </div>

        <!-- 喷漆工艺 -->
        <div class="process-station">
          <div class="equipment-image-container" @mouseenter="showTooltip('spray_painting', $event)" @mouseleave="hideTooltip"
            @click="showProcessParameterDialog('spray_painting')">
            <img src="/喷漆机.png?height=120&width=160" alt="喷漆机" class="equipment-image"
              :class="getWorkshopStatusClass('spray_painting')" />
            <div class="status-indicator" :class="getWorkshopStatus('spray_painting')"></div>
          </div>
        </div>

        <!-- 流程箭头 -->
        <div class="flow-arrow">
          <div class="arrow-line" :class="{ active: isProducing }">
            <div class="arrow-head">→</div>
          </div>
        </div>

        <!-- 丝印工艺 -->
        <div class="process-station">
          <div class="equipment-image-container" @mouseenter="showTooltip('screen_printing', $event)" @mouseleave="hideTooltip"
            @click="showProcessParameterDialog('screen_printing')">
            <img src="/丝印机.png?height=120&width=160" alt="丝印机" class="equipment-image"
              :class="getWorkshopStatusClass('screen_printing')" />
            <div class="status-indicator" :class="getWorkshopStatus('screen_printing')"></div>
          </div>
        </div>

        <!-- 流程箭头 -->
        <div class="flow-arrow">
          <div class="arrow-line" :class="{ active: isProducing }">
            <div class="arrow-head">→</div>
          </div>
        </div>

        <!-- 烫金工艺 -->
        <div class="process-station">
          <div class="equipment-image-container" @mouseenter="showTooltip('hot_stamping', $event)" @mouseleave="hideTooltip"
            @click="showProcessParameterDialog('hot_stamping')">
            <img src="/烫金机.png?height=120&width=160" alt="烫金机" class="equipment-image"
              :class="getWorkshopStatusClass('hot_stamping')" />
            <div class="status-indicator" :class="getWorkshopStatus('hot_stamping')"></div>
          </div>
        </div>

        <!-- 流程箭头 -->
        <div class="flow-arrow">
          <div class="arrow-line" :class="{ active: isProducing }">
            <div class="arrow-head">→</div>
          </div>
        </div>

        <!-- 包装工艺 -->
        <div class="process-station packaging-station">
          <div class="station-header">
          </div>
          <div class="equipment-image-container">
            <img src="/包装.png?height=120&width=160" alt="包装" class="equipment-image" />
            <div class="status-indicator running"></div>
          </div>
        </div>
      </div>
      
      <!-- 进行中的任务列表 -->
      <div class="tasks-section">
        <h3 class="tasks-title">进行中的生产任务</h3>
        <el-table :data="inProgressTasks" stripe style="width: 100%">
          <el-table-column prop="task_name" label="任务名称" min-width="200" />
          <el-table-column prop="product_name" label="产品名称" min-width="150" />
          <el-table-column prop="production_quantity" label="目标数量" width="120" />
          <el-table-column prop="production_progress" label="进度" width="150">
            <template #default="scope">
              <div class="progress-container">
                <el-progress 
                  :percentage="scope.row.production_progress * 100" 
                  stroke-width="6"
                  :stroke-color="getProgressColor(scope.row.production_progress)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="task_priority" label="优先级" width="100">
            <template #default="scope">
              <el-tag :type="getPriorityTagType(scope.row.task_priority)">
                {{ getPriorityName(scope.row.task_priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="start_time" label="开始时间" min-width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.start_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="end_time" label="预计结束时间" min-width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.end_time) }}
            </template>
          </el-table-column>
        </el-table>
        <div v-if="inProgressTasks.length === 0" class="no-tasks-message">
          暂无进行中的生产任务
        </div>
      </div>
    </div>

    <!-- 悬浮提示框 -->
    <div v-if="tooltipVisible" class="equipment-tooltip"
      :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }">
      <div class="tooltip-header">
        <h4>{{ getTypeName(tooltipData.type) }}</h4>
      </div>
      <div class="tooltip-content">
        <div class="tooltip-stats">
          <div class="stat-item">
            <span class="stat-label">设备总数:</span>
            <span class="stat-value">{{ tooltipData.totalCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">运行中:</span>
            <span class="stat-value">{{ tooltipData.runningCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">空闲:</span>
            <span class="stat-value">{{ tooltipData.idleCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">停机中：</span>
            <span class="stat-value">{{ tooltipData.offCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺参数设置对话框 -->
    <el-dialog v-model="parameterDialogVisible"
      :title="selectedProcessType ? getTypeName(selectedProcessType) + '设备列表' : ''" width="400px"
      class="parameter-dialog">
      
      <!-- 对应设备类型的设备列表 -->
      <div class="equipment-list-by-type">
        <el-table :data="selectedTypeEquipmentList" stripe style="width: 100%">
          <el-table-column prop="equipment_name" label="设备名称" min-width="180" />
          <el-table-column prop="equipment_status" label="运行状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.equipment_status)">
                {{ getStatusName(scope.row.equipment_status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="selectedTypeEquipmentList.length === 0" class="no-data-message">
          暂无 {{ getTypeName(selectedProcessType) }} 设备
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="parameterDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProcessParameters">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElProgress } from 'element-plus'
import { Clock, Refresh, VideoPlay, VideoPause, Download, Warning } from '@element-plus/icons-vue'
import { homeAPI } from '../api/home'
import dayjs from 'dayjs'

// 中文映射（与文档设备类型完全匹配）
const typeNameMap = {
  injection_molding: '注塑工艺',
  screen_printing: '丝印工艺',
  hot_stamping: '烫金工艺',
  spray_painting: '喷漆工艺',
}

// 设备状态映射（与文档状态参数完全匹配）
const statusNameMap = {
  OFF: '已停机',
  ON_IDLE: '空闲中',
  ON_RUNNING: '运行中',
}

// 优先级映射
const priorityNameMap = {
  1: '高',
  2: '中',
  3: '低'
}

// 响应式数据
const loading = ref(false)
const currentTime = ref('')
const isProducing = ref(false)  // 运行中状态
const isIdle = ref(false)       // 空闲状态
const parameterDialogVisible = ref(false)
const selectedProcessType = ref(null)

const tooltipVisible = ref(false)
const tooltipPosition = reactive({ x: 0, y: 0 })
const tooltipData = reactive({
  type: '',
  totalCount: 0,
  runningCount: 0,
  idleCount: 0,
  offCount: 0,
})

// 从API获取的设备状态列表
const equipmentStatusList = ref([])
// 从API获取的进行中任务列表
const inProgressTasks = ref([])

// 存储选中类型的设备列表
const selectedTypeEquipmentList = ref([]);

// 计算属性：设备状态统计
const statusSummary = computed(() => {
  const equipment = equipmentStatusList.value.filter(eq => eq.equipment_type === selectedProcessType.value);
  return {
    running: equipment.filter(e => e.equipment_status === 'ON_RUNNING').length,
    off: equipment.filter(e => e.equipment_status === 'OFF').length,
    idle: equipment.filter(e => e.equipment_status === 'ON_IDLE').length,
  }
})

// 工具函数：类型名称转换
const getTypeName = (type) => typeNameMap[type] || type
// 状态名称转换
const getStatusName = (status) => statusNameMap[status] || status
// 状态标签样式
const getStatusTagType = (status) => {
  const statusMap = {
    ON_RUNNING: 'success',  // 运行中-绿色
    OFF: 'info',            // 停机-蓝色
    ON_IDLE: 'warning'      // 空闲-黄色
  }
  return statusMap[status] || 'info'
}

// 优先级相关方法
const getPriorityName = (priority) => priorityNameMap[priority] || '未知'
const getPriorityTagType = (priority) => {
  const priorityMap = {
    1: 'danger',    // 高优先级-红色
    2: 'warning',   // 中优先级-黄色
    3: 'info'       // 低优先级-蓝色
  }
  return priorityMap[priority] || 'info'
}

// 进度条颜色
const getProgressColor = (progress) => {
  if (progress < 0.3) return '#60a5fa'
  if (progress < 0.7) return '#36d399'
  return '#10b981'
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return 'N/A'
  return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')
}

// 获取车间状态
const getWorkshopStatus = (workshopType) => {
  const equipment = getEquipmentStatusByType(workshopType);
  if (equipment.length === 0) return 'stopped'; 

  const allRunning = equipment.every(eq => eq.equipment_status === 'ON_RUNNING');
  const allStopped = equipment.every(eq => eq.equipment_status === 'OFF');
  const hasIdle = equipment.some(eq => eq.equipment_status === 'ON_IDLE');

  if (allRunning) return 'running';
  if (allStopped) return 'stopped';
  if (hasIdle) return 'warning';
  return 'warning'; 
}

// 车间状态样式
const getWorkshopStatusClass = (workshopType) => {
  const status = getWorkshopStatus(workshopType)
  return `status-${status}`
}

// 更新当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 根据类型筛选设备
const getEquipmentStatusByType = (type) => {
  return equipmentStatusList.value.filter(eq => eq.equipment_type === type);
}

// 显示设备状态提示框
const showTooltip = (workshopType, event) => {
  const equipment = getEquipmentStatusByType(workshopType);
  
  const totalCount = equipment.length;
  const runningCount = equipment.filter(eq => eq.equipment_status === 'ON_RUNNING').length;
  const idleCount = equipment.filter(eq => eq.equipment_status === 'ON_IDLE').length;
  const offCount = equipment.filter(eq => eq.equipment_status === 'OFF').length;

  Object.assign(tooltipData, {
    type: workshopType,
    totalCount,
    runningCount,
    idleCount,
    offCount
  })

  tooltipPosition.x = event.clientX + 10
  tooltipPosition.y = event.clientY - 10
  tooltipVisible.value = true
}

// 隐藏提示框
const hideTooltip = () => {
  tooltipVisible.value = false
}

// 显示工艺参数对话框
const showProcessParameterDialog = async (processType) => {
  selectedProcessType.value = processType
  parameterDialogVisible.value = true
  // 调用文档中的GET接口获取指定类型设备
  try {
    const response = await homeAPI.getEquipmentNameAndStatusByType(processType);
    if (response.code === 200) {
      selectedTypeEquipmentList.value = response.data || [];
    } else {
      ElMessage.error(response.msg || '获取设备列表失败');
      selectedTypeEquipmentList.value = [];
    }
  } catch (error) {
    console.error('获取设备列表失败:', error);
    ElMessage.error('获取设备列表失败');
    selectedTypeEquipmentList.value = [];
  }
}

// 保存工艺参数
const saveProcessParameters = () => {
  parameterDialogVisible.value = false
}

// 获取设备状态（调用文档GET接口）
const fetchEquipmentStatus = async () => {
  try {
    const response = await homeAPI.getEquipmentNameAndStatusByType('all');
    if (response.code === 200) {
      equipmentStatusList.value = response.data;
      // 更新生产状态
      isProducing.value = equipmentStatusList.value.some(eq => eq.equipment_status === 'ON_RUNNING');
      isIdle.value = equipmentStatusList.value.some(eq => eq.equipment_status === 'ON_IDLE');
    } else {
      ElMessage.error(response.msg || '获取设备状态失败');
    }
  } catch (error) {
    console.error('获取设备状态失败:', error);
    ElMessage.error('获取设备状态失败');
  }
}

// 获取进行中任务（调用文档GET接口）
const fetchInProgressTask = async () => {
  try {
    const response = await homeAPI.getInProgressProductionTask();
    if (response.code === 200 && response.data) {
      inProgressTasks.value = response.data;
    } else {
      inProgressTasks.value = [];
    }
  } catch (error) {
    console.error('获取进行中任务失败:', error);
    ElMessage.error('获取进行中任务失败');
    inProgressTasks.value = [];
  }
}

// 刷新数据
const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([fetchEquipmentStatus(), fetchInProgressTask()]);
    ElMessage.success('数据已刷新');
  } catch (error) {
    ElMessage.error('数据刷新失败');
  } finally {
    loading.value = false;
  }
}

// 开始生产（调用文档PATCH接口）
const startProduction = async () => {
  loading.value = true;
  try {
    const response = await homeAPI.updateAllEquipmentStatus('ON_RUNNING');
    if (response.code === 200) {
      isProducing.value = true;
      isIdle.value = false;
      ElMessage.success(response.msg || '生产已开始');
      await fetchEquipmentStatus(); 
    } else {
      ElMessage.error(response.msg || '启动生产失败');
    }
  } catch (error) {
    console.error('启动生产失败:', error);
    ElMessage.error('启动生产失败');
  } finally {
    loading.value = false;
  }
}


// 暂停生产（调用文档PATCH接口）
const stopAllProduction = async () => {
  loading.value = true;
  try {
    const response = await homeAPI.updateAllEquipmentStatus('OFF');
    if (response.code === 200) {
      isProducing.value = false;
      isIdle.value = false;
      ElMessage.error(response.msg || '全部设备已停机');
      await fetchEquipmentStatus(); 
    } else {
      ElMessage.error(response.msg || '停机操作失败');
    }
  } catch (error) {
    console.error('停机操作失败:', error);
    ElMessage.error('停机操作失败');
  } finally {
    loading.value = false;
  }
}

// 显示导出对话框
const showExportDialog = () => {
  ElMessage.info('导出报告功能开发中...');
}

// 生命周期
let timeInterval = null

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  await refreshData();
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* 设备状态统计 */
.equipment-status-summary h4 {
  color: #ffffff;
  margin-bottom: 12px;
  font-size: 16px;
}

.status-summary-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.status-box {
  flex: 1 1 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .3);
  transition: transform .2s;
}

/* 三种状态对应背景色 */
.status-box.normal {
  background-color: #10b981;
}

.status-box.maintenance {
  background-color: #3b82f6;
}

.status-box.error {
  background-color: #ef4444;
}

.status-box .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.main-interface {
  padding: 20px;
  background: #0a0a0a;
  min-height: 100vh;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 30px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 14px;
}

.status-icon {
  font-size: 18px;
}

.status-icon.production {
  color: #3b82f6;
}

.status-icon.efficiency {
  color: #10b981;
}

.status-icon.alarm {
  color: #ef4444;
}

.status-icon.normal {
  color: #6b7280;
}

.production-flow {
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px;
}

.flow-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.flow-title h2 {
  color: #ffffff;
  margin: 0;
  font-size: 24px;
}

.flow-controls {
  display: flex;
  gap: 10px;
}

.process-line {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
  overflow-x: auto;
  padding: 20px 0;
}

.process-station {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
}

.station-header {
  text-align: center;
  margin-bottom: 15px;
}

.station-header h3 {
  color: #ffffff;
  margin: 0 0 5px 0;
  font-size: 16px;
}

.equipment-count {
  color: #9ca3af;
  font-size: 12px;
}

.equipment-image-container {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.equipment-image-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.equipment-image {
  width: 160px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 3px solid #333;
  transition: all 0.3s ease;
}

.equipment-image.status-running {
  border-color: #10b981;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.equipment-image.status-warning {
  border-color: #f59e0b;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

.equipment-image.status-error {
  border-color: #ef4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

.equipment-image.status-stopped {
  border-color: #6b7280;
}

.equipment-image.status-maintenance {
  border-color: #3b82f6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.running {
  background: #10b981;
}

.status-indicator.warning {
  background: #f59e0b;
}

.status-indicator.error {
  background: #ef4444;
}

.status-indicator.stopped {
  background: #6b7280;
}

.status-indicator.maintenance {
  background: #3b82f6;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.equipment-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: #ffffff;
  padding: 10px;
  text-align: center;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.equipment-image-container:hover .equipment-overlay {
  opacity: 1;
}

.flow-arrow {
  display: flex;
  align-items: center;
  min-width: 80px;
}

.arrow-line {
  width: 100%;
  height: 4px;
  background: #333;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}

.arrow-line.active {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  animation: flowAnimation 2s linear infinite;
}

@keyframes flowAnimation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
}

.arrow-head {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  color: #3b82f6;
  font-size: 20px;
  font-weight: bold;
}

.flow-items {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  display: flex;
  gap: 20px;
  animation: itemFlow 3s linear infinite;
}

@keyframes itemFlow {
  0% {
    transform: translateX(-20px) translateY(-50%);
  }
  100% {
    transform: translateX(100px) translateY(-50%);
  }
}

.flow-item {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

/* 任务列表样式 */
.tasks-section {
  margin-top: 40px;
  background: rgba(38, 38, 38, 0.9);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tasks-title {
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-table) {
  background-color: transparent;
  color: #ffffff;
}

:deep(.el-table th) {
  background-color: rgba(50, 50, 50, 0.5);
  color: #9ca3af;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-table tr) {
  background-color: transparent;
}

:deep(.el-table tr:nth-child(2n)) {
  background-color: rgba(50, 50, 50, 0.2);
}

:deep(.el-table td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-text {
  min-width: 40px;
  text-align: right;
  color: #ffffff;
}

.no-tasks-message {
  text-align: center;
  color: #888;
  padding: 40px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 10px;
}

/* 悬浮提示框 */
.equipment-tooltip {
  position: fixed;
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 250px;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tooltip-header h4 {
  color: #ffffff;
  margin: 0;
  font-size: 14px;
}

.tooltip-content {
  color: #9ca3af;
  font-size: 12px;
}

.tooltip-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: #9ca3af;
}

.stat-value {
  color: #ffffff;
  font-weight: 500;
}

/* 参数设置对话框样式 */
.parameter-dialog :deep(.el-dialog) {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
.parameter-dialog :deep(.el-dialog__header) {
  background: rgba(38, 38, 38, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
.parameter-dialog :deep(.el-dialog__title) {
  color: #ffffff;
}
.parameter-dialog :deep(.el-form-item__label) {
  color: #ffffff;
}
.parameter-dialog :deep(.el-input__wrapper),
.parameter-dialog :deep(.el-input-number .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.parameter-dialog :deep(.el-input__inner),
.parameter-dialog :deep(.el-input-number .el-input__inner) {
  color: #ffffff;
}


.process-info {
  background: #262626;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.info-header h3 {
  margin: 0;
  font-size: 20px;
}

.info-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.parameter-section {
  margin-bottom: 30px;
}

.parameter-section h4 {
  color: #ffffff;
  margin-bottom: 10px;
  font-size: 16px;
}

.parameter-note {
  color: #f59e0b;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 4px;
  border-left: 3px solid #f59e0b;
}

.parameter-form {
  padding: 20px 20px 0 20px;
  border-radius: 8px;
}

.param-range {
  margin-left: 15px;
  color: #9ca3af;
  font-size: 12px;
}

.equipment-list-by-type {
  margin-top: 30px;
  background: rgba(38, 38, 38, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
}

.equipment-list-by-type h4 {
  color: #ffffff;
  margin-bottom: 15px;
  font-size: 16px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.equipment-card {
  background: #262626;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 15px;
}

.equipment-card.status-running {
  border-color: #10b981;
}

.equipment-card.status-maintenance {
  border-color: #3b82f6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.equipment-name {
  font-weight: 600;
  color: #ffffff;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.status-label {
  color: #9ca3af;
}

.status-value {
  color: #ffffff;
  font-weight: 500;
}

.no-data-message {
  text-align: center;
  color: #888;
  padding: 20px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 10px;
}

@media (max-width: 1200px) {
  .process-line {
    flex-direction: column;
    gap: 20px;
  }

  .flow-arrow {
    transform: rotate(90deg);
    min-width: 40px;
    min-height: 40px;
  }

  .info-stats {
    grid-template-columns: 1fr;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-interface {
    padding: 15px;
  }

  .status-bar {
    flex-direction: column;
    gap: 15px;
  }

  .flow-title {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .flow-controls {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>