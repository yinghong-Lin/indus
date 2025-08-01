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
          <el-button type="warning" size="small" @click="pauseProduction" :disabled="!isProducing || loading">
            <el-icon>
              <VideoPause />
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
      <!-- 生产进度总览 -->
      <div class="production-overview">
        <div class="overview-item">
          <div class="overview-label">任务编号</div>
          <div class="overview-value">{{ currentTask.task_name || 'N/A' }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">产品</div>
          <div class="overview-value">{{ currentTask.product_name || 'N/A' }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">进度</div>
          <div class="overview-value">{{ (currentTask.production_progress * 100).toFixed(0) || 0 }}%</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">目标数量</div>
          <div class="overview-value">{{ currentTask.production_quantity || 0 }}</div>
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
          <!-- <div class="stat-item">
            <span class="stat-label">故障:</span>
            <span class="stat-value">{{ tooltipData.faultCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">维护中:</span>
            <span class="stat-value">{{ tooltipData.maintainCount }}</span>
          </div> -->
        </div>
      </div>
    </div>

    <!-- 工艺参数设置对话框 -->
    <el-dialog v-model="parameterDialogVisible"
      :title="selectedProcessType ? getTypeName(selectedProcessType) + '' : ''" width="400px"
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
          <el-button type="primary" @click="saveProcessParameters">保存参数</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Refresh, VideoPlay, VideoPause, Download, Tools, Warning } from '@element-plus/icons-vue'
import { homeAPI } from '../api/home'

// 中文映射
const typeNameMap = {
  injection_molding: '注塑工艺',
  screen_printing: '丝印工艺',
  hot_stamping: '烫金工艺',
  spray_painting: '喷漆工艺',
}

const statusNameMap = {
  OFF: '已停机',
  ON_IDLE: '空闲中',
  ON_RUNNING: '运行中',
  // FAULT: '故障',
  // MAINTAIN: '维护中'
}

// 响应式数据
const loading = ref(false)
const currentTime = ref('')
const isProducing = ref(false)
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
  // faultCount: 0,
  // maintainCount: 0,
})

// 从API获取的设备状态列表
const equipmentStatusList = ref([])
// 从API获取的进行中任务
const currentTask = reactive({
  task_id: '',
  task_name: '',
  product_name: '',
  production_quantity: 0,
  production_progress: 0,
})

// 新增：用于存储点击设备类型后获取的该类型下的设备列表
const selectedTypeEquipmentList = ref([]);

// 计算属性：设备状态统计（用于参数设置弹窗）
const statusSummary = computed(() => {
  const equipment = equipmentStatusList.value.filter(eq => eq.equipment_type === selectedProcessType.value);
  return {
    running: equipment.filter(e => e.equipment_status === 'ON_RUNNING').length,
    // maintenance: equipment.filter(e => e.equipment_status === 'MAINTAIN').length,
    // fault: equipment.filter(e => e.equipment_status === 'FAULT').length,
    off: equipment.filter(e => e.equipment_status === 'OFF').length,
    idle: equipment.filter(e => e.equipment_status === 'ON_IDLE').length,
  }
})

// 工具函数
const getTypeName = (type) => typeNameMap[type] || type
const getStatusName = (status) => statusNameMap[status] || status
const getStatusTagType = (status) => {
  const statusMap = {
    ON_RUNNING: 'success',
    OFF: 'info',
    ON_IDLE: 'info',
    // FAULT: 'danger',
    // MAINTAIN: 'warning'
  }
  return statusMap[status] || 'info'
}

const getWorkshopStatus = (workshopType) => {
  const equipment = getEquipmentStatusByType(workshopType);
  if (equipment.length === 0) return 'stopped'; 

  
  // const hasFault = equipment.some(eq => eq.equipment_status === 'FAULT');
  // const hasMaintain = equipment.some(eq => eq.equipment_status === 'MAINTAIN');
  const allRunning = equipment.every(eq => eq.equipment_status === 'ON_RUNNING');
  const allStopped = equipment.every(eq => eq.equipment_status === 'OFF' || eq.equipment_status === 'ON_IDLE');

  // if (hasFault) return 'fault';
  // if (hasMaintain) return 'maintenance';
  if (allRunning) return 'running';
  if (allStopped) return 'stopped';
  return 'warning'; 
}

const getWorkshopStatusClass = (workshopType) => {
  const status = getWorkshopStatus(workshopType)
  return `status-${status}`
}

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

const getEquipmentStatusByType = (type) => {
  return equipmentStatusList.value.filter(eq => eq.equipment_type === type);
}

const showTooltip = (workshopType, event) => {
  const equipment = getEquipmentStatusByType(workshopType);
  
  const totalCount = equipment.length;
  const runningCount = equipment.filter(eq => eq.equipment_status === 'ON_RUNNING').length;
  const idleCount = equipment.filter(eq => eq.equipment_status === 'ON_IDLE').length;
  const offCount = equipment.filter(eq => eq.equipment_status === 'OFF').length;
  // const faultCount = equipment.filter(eq => eq.equipment_status === 'FAULT').length;
  // const maintainCount = equipment.filter(eq => eq.equipment_status === 'MAINTAIN').length;

  Object.assign(tooltipData, {
    type: workshopType,
    totalCount,
    runningCount,
    idleCount,
    // faultCount,
    // maintainCount,
    offCount
  })

  tooltipPosition.x = event.clientX + 10
  tooltipPosition.y = event.clientY - 10
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const showProcessParameterDialog = async (processType) => {
  selectedProcessType.value = processType
  parameterDialogVisible.value = true
  // Fetch equipment list for the selected type
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

const saveProcessParameters = () => {
  if (!selectedProcessType.value) return

  ElMessage.success(`${getTypeName(selectedProcessType.value)}参数设置成功，所有设备参数已更新`)
  parameterDialogVisible.value = false
}

const fetchEquipmentStatus = async () => {
  try {
    const response = await homeAPI.getEquipmentNameAndStatusByType('all');
    if (response.code === 200) {
      equipmentStatusList.value = response.data;
      isProducing.value = equipmentStatusList.value.some(eq => eq.equipment_status === 'ON_RUNNING');
    } else {
      ElMessage.error(response.msg || '获取设备状态失败');
    }
  } catch (error) {
    console.error('获取设备状态失败:', error);
    ElMessage.error('获取设备状态失败');
  }
}

const fetchInProgressTask = async () => {
  try {
    const response = await homeAPI.getInProgressProductionTask();
    if (response.code === 200 && response.data && response.data.length > 0) {
      Object.assign(currentTask, response.data[0]); 
    } else {
      Object.assign(currentTask, {
        task_id: '',
        task_name: '暂无进行中任务',
        product_name: 'N/A',
        production_quantity: 0,
        production_progress: 0,
      });
    }
  } catch (error) {
    console.error('获取进行中任务失败:', error);
    ElMessage.error('获取进行中任务失败');
    Object.assign(currentTask, {
      task_id: '',
      task_name: '获取失败',
      product_name: 'N/A',
      production_quantity: 0,
      production_progress: 0,
    });
  }
}

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

const startProduction = async () => {
  loading.value = true;
  try {
    const response = await homeAPI.updateAllEquipmentStatus('ON_RUNNING');
    if (response.code === 200) {
      isProducing.value = true;
      ElMessage.success('生产已开始');
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

const pauseProduction = async () => {
  loading.value = true;
  try {
    const response = await homeAPI.updateAllEquipmentStatus('ON_IDLE');
    if (response.code === 200) {
      isProducing.value = false;
      ElMessage.warning('生产已暂停');
      await fetchEquipmentStatus(); 
    } else {
      ElMessage.error(response.msg || '暂停生产失败');
    }
  } catch (error) {
    console.error('暂停生产失败:', error);
    ElMessage.error('暂停生产失败');
  } finally {
    loading.value = false;
  }
}

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
  /* 自适应宽度，最小 120px */
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
  background: #0a0a0a; /* Changed to match global background */
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
  border-color: #3b82f6; /* Blue for maintenance */
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

.production-overview {
  display: flex;
  justify-content: space-around;
  background: rgba(38, 38, 38, 0.9);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.overview-item {
  text-align: center;
}

.overview-label {
  color: #9ca3af;
  font-size: 12px;
  margin-bottom: 5px;
}

.overview-value {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
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
