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
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
          <el-button type="success" size="small" @click="startProduction" :disabled="isProducing">
            <el-icon>
              <VideoPlay />
            </el-icon>
            开始生产
          </el-button>
          <el-button type="warning" size="small" @click="pauseProduction" :disabled="!isProducing">
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
          <div class="equipment-image-container" @mouseenter="showTooltip('injection', $event)"
            @mouseleave="hideTooltip" @click="showProcessParameterDialog('injection')">
            <img src="/注塑机.png?height=120&width=160" alt="注塑机" class="equipment-image"
              :class="getWorkshopStatusClass('injection')" />
            <div class="status-indicator" :class="getWorkshopStatus('injection')"></div>
            <div class="equipment-overlay">
              <span>点击设置参数</span>
            </div>
          </div>
        </div>

        <!-- 流程箭头 -->
        <div class="flow-arrow">
          <div class="arrow-line" :class="{ active: isProducing }">
            <div class="arrow-head">→</div>
            <div class="flow-items" v-if="isProducing">
              <div class="flow-item" v-for="i in 3" :key="i"></div>
            </div>
          </div>
        </div>

        <!-- 喷漆工艺 -->
        <div class="process-station">
          <div class="equipment-image-container" @mouseenter="showTooltip('painting', $event)" @mouseleave="hideTooltip"
            @click="showProcessParameterDialog('painting')">
            <img src="/喷漆机.png?height=120&width=160" alt="喷漆机" class="equipment-image"
              :class="getWorkshopStatusClass('painting')" />
            <div class="status-indicator" :class="getWorkshopStatus('painting')"></div>
            <div class="equipment-overlay">
              <span>点击设置参数</span>
            </div>
          </div>
        </div>

        <!-- 流程箭头 -->
        <div class="flow-arrow">
          <div class="arrow-line" :class="{ active: isProducing }">
            <div class="arrow-head">→</div>
            <div class="flow-items" v-if="isProducing">
              <div class="flow-item" v-for="i in 3" :key="i"></div>
            </div>
          </div>
        </div>

        <!-- 丝印工艺 -->
        <div class="process-station">
          <div class="equipment-image-container" @mouseenter="showTooltip('printing', $event)" @mouseleave="hideTooltip"
            @click="showProcessParameterDialog('printing')">
            <img src="/丝印机.png?height=120&width=160" alt="丝印机" class="equipment-image"
              :class="getWorkshopStatusClass('printing')" />
            <div class="status-indicator" :class="getWorkshopStatus('printing')"></div>
            <div class="equipment-overlay">
              <span>点击设置参数</span>
            </div>
          </div>
        </div>

        <!-- 流程箭头 -->
        <div class="flow-arrow">
          <div class="arrow-line" :class="{ active: isProducing }">
            <div class="arrow-head">→</div>
            <div class="flow-items" v-if="isProducing">
              <div class="flow-item" v-for="i in 3" :key="i"></div>
            </div>
          </div>
        </div>

        <!-- 烫金工艺 -->
        <div class="process-station">
          <div class="equipment-image-container" @mouseenter="showTooltip('stamping', $event)" @mouseleave="hideTooltip"
            @click="showProcessParameterDialog('stamping')">
            <img src="/烫金机.png?height=120&width=160" alt="烫金机" class="equipment-image"
              :class="getWorkshopStatusClass('stamping')" />
            <div class="status-indicator" :class="getWorkshopStatus('stamping')"></div>
            <div class="equipment-overlay">
              <span>点击设置参数</span>
            </div>
          </div>
        </div>

        <!-- 流程箭头 -->
        <div class="flow-arrow">
          <div class="arrow-line" :class="{ active: isProducing }">
            <div class="arrow-head">→</div>
            <div class="flow-items" v-if="isProducing">
              <div class="flow-item" v-for="i in 3" :key="i"></div>
            </div>
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
          <div class="overview-value">{{ currentTask.number }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">产品</div>
          <div class="overview-value">{{ currentTask.product }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">进度</div>
          <div class="overview-value">{{ currentTask.progress }}%</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">完成数量</div>
          <div class="overview-value">{{ currentTask.completed }}/{{ currentTask.target }}</div>
        </div>
      </div>
    </div>

    <!-- 悬浮提示框 -->
    <div v-if="tooltipVisible" class="equipment-tooltip"
      :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }">
      <div class="tooltip-header">
        <h4>{{ tooltipData.title }}</h4>
        <el-tag :type="getWorkshopStatusType(tooltipData.type)" size="small">
          {{ getWorkshopStatusText(tooltipData.type) }}
        </el-tag>
      </div>
      <div class="tooltip-content">
        <div class="tooltip-stats">
          <div class="stat-item">
            <span class="stat-label">在线设备:</span>
            <span class="stat-value">{{ tooltipData.onlineCount }}/{{ tooltipData.totalCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均效率:</span>
            <span class="stat-value">{{ tooltipData.avgEfficiency }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">当前产量:</span>
            <span class="stat-value">{{ tooltipData.currentOutput }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺参数设置对话框 -->
    <el-dialog v-model="parameterDialogVisible"
      :title="selectedProcessType ? processConfigs[selectedProcessType].name + ' - 工艺参数设置' : ''" width="800px"
      class="parameter-dialog">
      <div v-if="selectedProcessType" class="parameter-detail">
        <!-- 参数设置表单 -->
        <div class="parameter-section">
          <el-form :model="processParameters[selectedProcessType]" label-width="180px" class="parameter-form">
            <!-- 注塑机参数（injection_molding_machine_setting） -->
            <template v-if="selectedProcessType === 'injection'">
              <el-form-item label="加热温度范围 (℃)">
                <el-input v-model="processParameters.injection.heating_temp_range" placeholder="如160-220" />
              </el-form-item>
              <el-form-item label="冷却时间 (s)">
                <el-input-number v-model="processParameters.injection.cooling_time" :min="1" :max="999" />
              </el-form-item>
              <el-form-item label="注射速度 (mm/s)">
                <el-input-number v-model="processParameters.injection.injection_speed" :min="1" :max="999" />
              </el-form-item>
              <el-form-item label="注射压力 (MPa)">
                <el-input-number v-model="processParameters.injection.injection_pressure" :min="0.1" :max="999"
                  :step="0.1" />
              </el-form-item>
              <el-form-item label="注射时间 (s)">
                <el-input-number v-model="processParameters.injection.injection_time" :min="1" :max="999" />
              </el-form-item>
              <el-form-item label="开模时间 (s)">
                <el-input-number v-model="processParameters.injection.opening_time" :min="1" :max="999" />
              </el-form-item>
              <el-form-item label="合模时间 (s)">
                <el-input-number v-model="processParameters.injection.closing_time" :min="1" :max="999" />
              </el-form-item>
              <el-form-item label="保压压力 (MPa)">
                <el-input-number v-model="processParameters.injection.holding_pressure" :min="0.1" :max="999"
                  :step="0.1" />
              </el-form-item>
              <el-form-item label="保压时间 (s)">
                <el-input-number v-model="processParameters.injection.holding_time" :min="1" :max="999" />
              </el-form-item>
              <el-form-item label="注射位置偏差 (mm)">
                <el-input-number v-model="processParameters.injection.injection_position_deviation" :min="0" :max="10"
                  :step="0.01" />
              </el-form-item>
              <el-form-item label="螺杆转速 (r/min)">
                <el-input-number v-model="processParameters.injection.screw_speed" :min="1" :max="2000" />
              </el-form-item>
            </template>

            <!-- 喷漆机参数（spray_painting_machine_setting） -->
            <template v-else-if="selectedProcessType === 'painting'">
              <el-form-item label="漆料粘度范围 (Pa·s)">
                <el-input v-model="processParameters.painting.paint_viscosity_range" placeholder="如15-25" />
              </el-form-item>
              <el-form-item label="喷涂压力 (MPa)">
                <el-input-number v-model="processParameters.painting.spray_pressure" :min="0.1" :max="2" :step="0.1" />
              </el-form-item>
              <el-form-item label="喷涂距离 (mm)">
                <el-input-number v-model="processParameters.painting.spray_distance" :min="50" :max="500" />
              </el-form-item>
              <el-form-item label="喷涂速度 (m/s)">
                <el-input-number v-model="processParameters.painting.spray_speed" :min="0.1" :max="10" :step="0.1" />
              </el-form-item>
              <el-form-item label="烘干温度 (℃)">
                <el-input-number v-model="processParameters.painting.drying_temp" :min="20" :max="120" />
              </el-form-item>
              <el-form-item label="烘干时间 (分钟)">
                <el-input-number v-model="processParameters.painting.drying_time" :min="1" :max="999" />
              </el-form-item>
            </template>

            <!-- 丝印机参数（screen_printing_machine_setting） -->
            <template v-else-if="selectedProcessType === 'printing'">
              <el-form-item label="颜料类型模板类型">
                <el-input v-model="processParameters.printing.ink_type_template_type" placeholder="如UV油墨+聚酯网版" />
              </el-form-item>
              <el-form-item label="丝印压力 (MPa)">
                <el-input-number v-model="processParameters.printing.printing_pressure" :min="0.1" :max="2"
                  :step="0.1" />
              </el-form-item>
              <el-form-item label="丝印速度 (m/s)">
                <el-input-number v-model="processParameters.printing.printing_speed" :min="0.1" :max="10" :step="0.1" />
              </el-form-item>
              <el-form-item label="油墨粘度 (Pa·s)">
                <el-input-number v-model="processParameters.printing.ink_viscosity" :min="1" :max="100" :step="0.1" />
              </el-form-item>
              <el-form-item label="油墨干燥时间 (秒)">
                <el-input-number v-model="processParameters.printing.ink_drying_time" :min="1" :max="999" />
              </el-form-item>
            </template>

            <!-- 烫金机参数（hot_stamping_machine_setting） -->
            <template v-else-if="selectedProcessType === 'stamping'">
              <el-form-item label="烫金温度范围 (℃)">
                <el-input v-model="processParameters.stamping.stamping_temp_range" placeholder="如160-180" />
              </el-form-item>
              <el-form-item label="烫金压力范围 (MPa)">
                <el-input v-model="processParameters.stamping.stamping_pressure_range" placeholder="如1.5-2.0" />
              </el-form-item>
              <el-form-item label="烫金时间范围 (s)">
                <el-input v-model="processParameters.stamping.stamping_time_range" placeholder="如1.0-2.0" />
              </el-form-item>
              <el-form-item label="金箔传送速度范围 (m/min)">
                <el-input v-model="processParameters.stamping.foil_speed_range" placeholder="如4-6" />
              </el-form-item>
            </template>
          </el-form>
        </div>
      </div>
      <!-- 设备状态统计 -->
      <div class="equipment-status-summary">
        <h4>设备状态统计</h4>
        <div class="status-summary-grid">
          <div class="status-box normal">
            <el-icon>
              <VideoPlay />
            </el-icon>
            <span>正常：{{ statusSummary.running }}</span>
          </div>
          <div class="status-box maintenance">
            <el-icon>
              <Tools />
            </el-icon>
            <span>维修中：{{ statusSummary.maintenance }}</span>
          </div>
          <div class="status-box error">
            <el-icon>
              <Warning />
            </el-icon>
            <span>故障：{{ statusSummary.error }}</span>
          </div>
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
import { computed } from 'vue'
import { Tools } from '@element-plus/icons-vue'

const statusSummary = computed(() => {
  const equipment = getEquipmentByType(selectedProcessType.value)
  return {
    running: equipment.filter(e => e.status === 'running').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    error: equipment.filter(e => e.status === 'error').length
  }
})
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock, TrendCharts, DataAnalysis, Warning, Refresh, VideoPlay, VideoPause
} from '@element-plus/icons-vue'

// 响应式数据
const currentTime = ref('')
const todayProduction = ref(1850)
const overallEfficiency = ref(89)
const alarmCount = ref(2)
const isProducing = ref(true)
const parameterDialogVisible = ref(false)
const selectedProcessType = ref(null)

const tooltipVisible = ref(false)
const tooltipPosition = reactive({ x: 0, y: 0 })
const tooltipData = reactive({})

// 工艺配置
const processConfigs = {
  injection: {
    name: '注塑工艺',
    color: 'bg-blue-500'
  },
  painting: {
    name: '喷漆工艺',
    color: 'bg-green-500'
  },
  printing: {
    name: '丝印工艺',
    color: 'bg-purple-500'
  },
  stamping: {
    name: '烫金工艺',
    color: 'bg-yellow-500'
  }
}

// 工艺参数 - 每种工艺统一参数
const processParameters = reactive({
  injection: {
    heating_temp_range: '180-220',
    cooling_time: 15,
    injection_speed: 80,
    injection_pressure: 120,
    injection_time: 3,
    opening_time: 2,
    closing_time: 1,
    holding_pressure: 80.5,
    holding_time: 5,
    injection_position_deviation: 0.05,
    screw_speed: 120
  },
  painting: {
    paint_viscosity_range: '15-25',
    spray_pressure: 0.5,
    spray_distance: 200,
    spray_speed: 1.2,
    drying_temp: 70,
    drying_time: 20
  },
  printing: {
    ink_type_template_type: 'UV油墨+聚酯网版',
    printing_pressure: 0.6,
    printing_speed: 1.0,
    ink_viscosity: 12.5,
    ink_drying_time: 30
  },
  stamping: {
    stamping_temp_range: '160-180',
    stamping_pressure_range: '1.5-2.0',
    stamping_time_range: '1.0-2.0',
    foil_speed_range: '4-6'
  }
})

// 当前批次信息
const currentTask = reactive({
  number: 'BATCH-2024-CM001',
  product: '化妆品包装盒',
  target: 2000,
  completed: 1480,
  progress: 74
})

// 设备数据 - 同一工艺下设备使用相同参数
const injectionEquipment = reactive([
  {
    id: 'im001',
    name: '注塑机1号',
    type: 'injection',
    location: '注塑车间B-01',
    status: 'running',
    efficiency: 94,
    currentOutput: 1650,
    runTime: 16.2,
    faultCount: 0
  },
  {
    id: 'im002',
    name: '注塑机2号',
    type: 'injection',
    location: '注塑车间B-02',
    status: 'maintenance',
    efficiency: 0,
    currentOutput: 0,
    runTime: 0,
    faultCount: 2
  }
])

const paintingEquipment = reactive([
  {
    id: 'pt001',
    name: '喷漆机1号',
    type: 'painting',
    location: '喷漆车间C-01',
    status: 'running',
    efficiency: 88,
    currentOutput: 1420,
    runTime: 14.5,
    faultCount: 0
  },
  {
    id: 'pt002',
    name: '喷漆机2号',
    type: 'painting',
    location: '喷漆车间C-02',
    status: 'running',
    efficiency: 91,
    currentOutput: 1580,
    runTime: 18.7,
    faultCount: 0
  }
])

const printingEquipment = reactive([
  {
    id: 'ss001',
    name: '丝印机1号',
    type: 'printing',
    location: '丝印车间D-01',
    status: 'running',
    efficiency: 85,
    currentOutput: 1520,
    runTime: 20.1,
    faultCount: 0
  },
  {
    id: 'ss002',
    name: '丝印机2号',
    type: 'printing',
    location: '丝印车间D-02',
    status: 'running',
    efficiency: 89,
    currentOutput: 1580,
    runTime: 18.9,
    faultCount: 0
  }
])

const stampingEquipment = reactive([
  {
    id: 'hs001',
    name: '烫金机1号',
    type: 'stamping',
    location: '烫金车间E-01',
    status: 'running',
    efficiency: 88,
    currentOutput: 1580,
    runTime: 18.7,
    faultCount: 0
  }
])

// 方法
const alarmClass = ref('normal')

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

const getEquipmentByType = (type) => {
  switch (type) {
    case 'injection':
      return injectionEquipment
    case 'painting':
      return paintingEquipment
    case 'printing':
      return printingEquipment
    case 'stamping':
      return stampingEquipment
    default:
      return []
  }
}

const getEquipmentStatusClass = (status) => {
  return `status-${status}`
}

const getStatusTagType = (status) => {
  const statusMap = {
    running: 'success',
    warning: 'warning',
    stopped: 'danger',
    maintenance: 'info',
    error: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    running: '运行中',
    warning: '警告',
    stopped: '已停止',
    maintenance: '维护中',
    error: '故障'
  }
  return statusMap[status] || '未知'
}

const getProcessStatusType = (processType) => {
  const equipment = getEquipmentByType(processType)
  const hasError = equipment.some(eq => eq.status === 'error')
  const hasWarning = equipment.some(eq => eq.status === 'warning' || eq.status === 'maintenance')
  const allRunning = equipment.every(eq => eq.status === 'running')

  if (hasError) return 'danger'
  if (hasWarning) return 'warning'
  if (allRunning) return 'success'
  return 'info'
}

const getProcessStatusText = (processType) => {
  const type = getProcessStatusType(processType)
  const statusMap = {
    success: '正常运行',
    warning: '需要关注',
    danger: '异常状态',
    info: '待机状态'
  }
  return statusMap[type] || '未知状态'
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
  todayProduction.value += Math.floor(Math.random() * 10)
  overallEfficiency.value = Math.max(80, Math.min(100, overallEfficiency.value + (Math.random() - 0.5) * 5))
}

const startProduction = () => {
  isProducing.value = true
  ElMessage.success('生产已开始')
}

const pauseProduction = () => {
  isProducing.value = false
  ElMessage.warning('生产已暂停')
}

const getWorkshopStatus = (workshopType) => {
  const equipment = getEquipmentByType(workshopType)
  const hasError = equipment.some(eq => eq.status === 'error')
  const hasWarning = equipment.some(eq => eq.status === 'warning' || eq.status === 'maintenance')
  const allRunning = equipment.every(eq => eq.status === 'running')

  if (hasError) return 'error'
  if (hasWarning) return 'warning'
  if (allRunning) return 'running'
  return 'stopped'
}

const getWorkshopStatusClass = (workshopType) => {
  const status = getWorkshopStatus(workshopType)
  return `status-${status}`
}

const getWorkshopStatusType = (workshopType) => {
  const status = getWorkshopStatus(workshopType)
  const statusMap = {
    running: 'success',
    warning: 'warning',
    error: 'danger',
    stopped: 'info'
  }
  return statusMap[status] || 'info'
}

const getWorkshopStatusText = (workshopType) => {
  const status = getWorkshopStatus(workshopType)
  const statusMap = {
    running: '正常运行',
    warning: '需要关注',
    error: '异常状态',
    stopped: '停机状态'
  }
  return statusMap[status] || '未知状态'
}

const showTooltip = (workshopType, event) => {
  const equipment = getEquipmentByType(workshopType)
  const title = processConfigs[workshopType].name

  const onlineCount = equipment.filter(eq => eq.status === 'running').length
  const totalCount = equipment.length
  const avgEfficiency = Math.round(equipment.reduce((sum, eq) => sum + eq.efficiency, 0) / totalCount)
  const currentOutput = equipment.reduce((sum, eq) => sum + (eq.currentOutput || 0), 0)

  Object.assign(tooltipData, {
    title,
    type: workshopType,
    onlineCount,
    totalCount,
    avgEfficiency,
    currentOutput
  })

  tooltipPosition.x = event.clientX + 10
  tooltipPosition.y = event.clientY - 10
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const showProcessParameterDialog = (processType) => {
  selectedProcessType.value = processType
  parameterDialogVisible.value = true
}

const getOnlineCount = (equipment) => {
  return equipment.filter(eq => eq.status === 'running').length
}

const getAvgEfficiency = (equipment) => {
  return Math.round(equipment.reduce((sum, eq) => sum + eq.efficiency, 0) / equipment.length)
}

const saveProcessParameters = () => {
  if (!selectedProcessType.value) return

  ElMessage.success(`${processConfigs[selectedProcessType.value].name}参数设置成功，所有设备参数已更新`)
  parameterDialogVisible.value = false
}

// 生命周期
let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  if (alarmCount.value > 0) {
    alarmClass.value = 'alarm'
  }
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
  background: #0f0f0f;
  min-height: 100vh;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a1a1a;
  border: 1px solid #333;
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
  background: #1a1a1a;
  border: 1px solid #333;
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
  background: #262626;
  border-radius: 8px;
  padding: 20px;
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
  background: #1a1a1a;
  border: 1px solid #333;
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

.equipment-list h4 {
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
