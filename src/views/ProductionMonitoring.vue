<template>
  <div class="production-monitoring">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>生产监控</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon> 刷新数据
        </el-button>
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon> 导出报告
        </el-button>
      </div>
    </div>

    <!-- 工艺参数总览（每类一套） -->
    <div class="params-overview">
      <el-card
        class="param-card"
        v-for="item in equipmentTypeSummaries"
        :key="item.equipment_type"
        :class="{ active: activeType === item.equipment_type }"
        @click="activeType = item.equipment_type"
      >
        <template #header><h3>{{ getTypeName(item.equipment_type) }} - 设备概览</h3></template>
        <div class="param-row">
          <span>总设备数：</span><b>{{ item.total_count }}</b>
        </div>
        <div class="param-row">
          <span>运行中：</span><b>{{ item.running_count }}</b>
        </div>
        <div class="param-row">
          <span>空闲：</span><b>{{ item.idle_count }}</b>
        </div>
        <div class="param-row">
          <span>停机中：</span><b>{{ item.off_count }}</b>
        </div>
      </el-card>
    </div>

    <!-- 设备信息与实时数据 -->
    <div class="realtime-section">
      <h2>设备信息与实时数据 - {{ getTypeName(activeType) }}</h2>
      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
          :lg="6"
          v-for="dev in paginatedFilteredDevices"
          :key="dev.equipment_id"
        >
          <el-card class="realtime-card">
            <template #header>
              <h4>{{ dev.equipment_name }}</h4>
              <el-tag :type="getStatusTagType(dev.equipment_status)">{{ getStatusName(dev.equipment_status) }}</el-tag>
            </template>
            <div class="real-item">
              <span>位置：</span><b>{{ dev.location }}</b>
            </div>
            <template v-for="(detail, key) in getRealtimeDetailsDisplay(dev)" :key="key">
              <div class="real-item">
                <span>{{ detail.label }}：</span><b>{{ detail.value }}</b>
              </div>
            </template>
            <div class="real-item" v-if="dev.realtime_status?.production_stage_desc">
              <span>实时状态：</span><b>{{ dev.realtime_status.production_stage_desc }}</b>
            </div>
            <div class="ts">采集时间：{{ formatTime(dev.collection_time) }}</div>
          </el-card>
        </el-col>
      </el-row>
      <div v-if="paginatedFilteredDevices.length === 0 && !loading" class="no-data">
        暂无 {{ getTypeName(activeType) }} 实时数据
      </div>
      <div class="pagination-wrapper" v-if="filteredDevices.length > 0">
        <el-pagination
          v-model:current-page="realtimePagination.page"
          v-model:page-size="realtimePagination.page_size"
          :page-sizes="[4, 8, 12]"
          :total="filteredDevices.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleRealtimeSizeChange"
          @current-change="handleRealtimeCurrentChange"
        />
      </div>
    </div>

    <!-- 报警记录 -->
    <div class="alarm-section">
      <h2>报警记录</h2>
      <el-table :data="latestAlarms" stripe style="width: 100%">
        <el-table-column prop="alarm_time" label="时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.alarm_time) }}</template>
        </el-table-column>
        <el-table-column prop="equipment_name" label="设备名称" width="150" />
        <el-table-column prop="alarm_code" label="代码" width="150" />
        <el-table-column prop="alarm_detail" label="详情" width="500"/>
        <el-table-column prop="alarm_level" label="级别" width="100">
          <template #default="scope">
            <el-tag :type="alarmLevelTag(scope.row.alarm_level)">
              {{ scope.row.alarm_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alarm_status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="alarmStatusTag(scope.row.alarm_status)">
              {{ scope.row.alarm_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120">
          <template #default="scope">
            <el-button
              type="text"
              size="small"
              @click.stop="showUpdateLevelDialog(scope.row)"
            >
              更新级别
            </el-button>
            <el-button
              type="text"
              size="small"
              @click.stop="showUpdateStatusDialog(scope.row)"
            >
              更新状态
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="alarmPagination.page"
          v-model:page-size="alarmPagination.page_size"
          :page-sizes="[5, 10, 20]"
          :total="alarmPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleAlarmSizeChange"
          @current-change="handleAlarmCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue' // 导入 onUnmounted
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import { monitoringAPI } from '../api/monitoring'
import dayjs from 'dayjs'
import { websocketService } from '../services/websocket' // 导入 WebSocket 服务
import { useAuthStore } from '../stores/auth' // 导入 auth store

/* ---------- 响应式状态 ---------- */
const loading = ref(false)
const activeType = ref('hot_stamping') // 默认显示烫金机
const allEquipmentStatus = ref([]) // 存储所有设备的概览状态 (equipment_name, equipment_type, equipment_status, location)
const allRealtimeDetails = ref([]) // 存储所有设备的详细实时数据 (来自 getLastRealtimeData)
const alarms = ref([])
const alarmPagination = ref({
  page: 1,
  page_size: 10,
  total: 0,
})
const realtimePagination = ref({ // New pagination for realtime data
  page: 1,
  page_size: 4, // Display 4 cards per page
})

// 中文映射
const typeNameMap = {
  injection_molding: '注塑机',
  screen_printing: '丝印机',
  hot_stamping: '烫金机',
  spray_painting: '喷漆机',
  all: '全部设备'
}
const statusNameMap = {
  OFF: '已停机',
  ON_IDLE: '空闲中',
  ON_RUNNING: '运行中',
  // FAULT: '故障',
  // MAINTAIN: '维护中'
}

/* ---------- 计算属性 ---------- */
const equipmentTypeSummaries = computed(() => {
  const typesMap = {}
  allEquipmentStatus.value.forEach(eq => {
    const type = eq.equipment_type
    if (!typesMap[type]) {
      typesMap[type] = {
        equipment_type: type,
        total_count: 0,
        running_count: 0,
        off_count: 0,
        idle_count: 0,
        // fault_count: 0,
        // maintain_count: 0,
      }
    }
    typesMap[type].total_count++
    if (eq.equipment_status === 'ON_RUNNING') {
      typesMap[type].running_count++
    } else if (eq.equipment_status === 'OFF') {
      typesMap[type].off_count++
    } else if (eq.equipment_status === 'ON_IDLE') {
      typesMap[type].idle_count++
    }
    //  else if (eq.equipment_status === 'FAULT') {
    //   typesMap[type].fault_count++;
    // } else if (eq.equipment_status === 'MAINTAIN') {
    //   typesMap[type].maintain_count++;
    // }
  })
  return Object.values(typesMap)
})

const filteredDevices = computed(() => {
  // Combine equipment overview information and real-time detailed data
  return allEquipmentStatus.value
    .filter(eq => eq.equipment_type === activeType.value)
    .map(eq => {
      const realtimeData = allRealtimeDetails.value.find(rt => rt.equipment_id === eq.equipment_id)
      return {
        ...eq,
        ...realtimeData, // Merge real-time data
        realtime_details: realtimeData?.realtime_details || {},
        realtime_status: realtimeData?.realtime_status || {},
        collection_time: realtimeData?.collection_time || null,
      }
    })
})

const paginatedFilteredDevices = computed(() => {
  const start = (realtimePagination.value.page - 1) * realtimePagination.value.page_size;
  const end = start + realtimePagination.value.page_size;
  return filteredDevices.value.slice(start, end);
})

const latestAlarms = computed(() => alarms.value)

/* ---------- 工具函数 ---------- */
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
const alarmLevelTag = l => ({ '警告': 'warning', '严重': 'danger', '致命': 'danger' }[l] || 'info')
const alarmStatusTag = s => ({ '已处理': 'success', '未处理': 'danger' }[s] || 'info')

const formatTime = t => {
  if (!t) return '-'
  try {
    return dayjs(t).format('YYYY-MM-DD HH:mm:ss')
  } catch (error) {
    console.error("Invalid date string for formatTime:", t, error)
    return '-'
  }
}

const getRealtimeDetailsDisplay = (dev) => {
  const details = []
  if (!dev || !dev.realtime_details) return details

  switch (dev.equipment_type) {
    case 'hot_stamping':
      if (dev.realtime_details.realtime_stamping_temp) details.push({ label: '烫金温度', value: `${dev.realtime_details.realtime_stamping_temp.value}${dev.realtime_details.realtime_stamping_temp.unit}` })
      if (dev.realtime_details.realtime_stamping_pressure) details.push({ label: '烫金压力', value: `${dev.realtime_details.realtime_stamping_pressure.value}${dev.realtime_details.realtime_stamping_pressure.unit}` })
      if (dev.realtime_details.realtime_foil_speed) details.push({ label: '金箔速度', value: `${dev.realtime_details.realtime_foil_speed.value}${dev.realtime_details.realtime_foil_speed.unit}` })
      break
    case 'injection_molding':
      if (dev.realtime_details.realtime_heating_temp) details.push({ label: '加热温度', value: `${dev.realtime_details.realtime_heating_temp.value}${dev.realtime_details.realtime_heating_temp.unit}` })
      if (dev.realtime_details.realtime_injection_pressure) details.push({ label: '注射压力', value: `${dev.realtime_details.realtime_injection_pressure.value}${dev.realtime_details.realtime_injection_pressure.unit}` })
      if (dev.realtime_details.realtime_screw_speed) details.push({ label: '螺杆转速', value: `${dev.realtime_details.realtime_screw_speed.value}${dev.realtime_details.realtime_screw_speed.unit}` })
      break
    case 'screen_printing':
      if (dev.realtime_details.realtime_printing_pressure) details.push({ label: '印刷压力', value: `${dev.realtime_details.realtime_printing_pressure.value}${dev.realtime_details.realtime_printing_pressure.unit}` })
      if (dev.realtime_details.realtime_ink_viscosity) details.push({ label: '油墨粘度', value: `${dev.realtime_details.realtime_ink_viscosity.value}${dev.realtime_details.realtime_ink_viscosity.unit}` })
      if (dev.realtime_details.realtime_printing_speed) details.push({ label: '印刷速度', value: `${dev.realtime_details.realtime_printing_speed.value}${dev.realtime_details.realtime_printing_speed.unit}` })
      break
    case 'spray_painting':
      if (dev.realtime_details.realtime_spray_pressure) details.push({ label: '喷漆压力', value: `${dev.realtime_details.realtime_spray_pressure.value}${dev.realtime_details.realtime_spray_pressure.unit}` })
      if (dev.realtime_details.realtime_drying_temp) details.push({ label: '干燥温度', value: `${dev.realtime_details.realtime_drying_temp.value}${dev.realtime_details.realtime_drying_temp.unit}` })
      if (dev.realtime_details.realtime_spray_speed) details.push({ label: '喷漆速度', value: `${dev.realtime_details.realtime_spray_speed.value}${dev.realtime_details.realtime_spray_speed.unit}` })
      break
  }
  // Add production stage if available and not already covered by specific details
  if (dev.realtime_details.realtime_production_stage && !details.some(d => d.label === '生产阶段')) {
    details.push({ label: '生产阶段', value: `${dev.realtime_status.production_stage_desc}` });
  }
  return details
}

/* ---------- API 调用 ---------- */
const fetchEquipmentStatusOverview = async () => {
  try {
    const response = await monitoringAPI.getEquipmentStatusByType('all')
    if (response.code === 200) {
      allEquipmentStatus.value = response.data || []
      // Ensure default selected type is in the list, if list is empty, don't set
      if (allEquipmentStatus.value.length > 0 && !equipmentTypeSummaries.value.some(item => item.equipment_type === activeType.value)) {
        activeType.value = equipmentTypeSummaries.value[0].equipment_type
      } else if (allEquipmentStatus.value.length === 0) {
        activeType.value = 'all'
      }
    } else {
      ElMessage.error(response.msg || '获取设备概览失败')
    }
  } catch (error) {
    console.error('获取设备概览失败:', error)
    ElMessage.error('获取设备概览失败')
  }
}

const fetchAllRealtimeDataForActiveType = async () => {
  // Reset realtime pagination when active type changes
  realtimePagination.value.page = 1
  const equipmentIdsToFetch = allEquipmentStatus.value
    .filter(eq => eq.equipment_type === activeType.value)
    .map(eq => eq.equipment_id)

  const realtimePromises = equipmentIdsToFetch.map(id => monitoringAPI.getLastRealtimeData(id))
  try {
    const responses = await Promise.all(realtimePromises)
    allRealtimeDetails.value = responses
      .filter(res => res.code === 200 && res.data)
      .map(res => res.data)
  } catch (error) {
    console.error('获取实时数据失败:', error)
    ElMessage.error('获取实时数据失败')
  }
}

const fetchAlarms = async () => {
  try {
    const response = await monitoringAPI.getAlarmList(alarmPagination.value.page, alarmPagination.value.page_size)
    if (response.code === 200) {
      alarms.value = response.data.Alarms || []
      alarmPagination.value.total = response.data.pagination.total || 0
    } else {
      ElMessage.error(response.msg || '获取报警记录失败')
    }
  } catch (error) {
    console.error('获取报警记录失败:', error)
    ElMessage.error('获取报警记录失败')
  }
}

/* ---------- WebSocket 相关 ---------- */
const updateRealtimeData = (realtimeData) => {
  const equipmentIndex = allRealtimeDetails.value.findIndex(
    (item) => item.equipment_id === realtimeData.equipment_id
  )
  if (equipmentIndex !== -1) {
    // 更新现有设备数据
    // 使用展开运算符确保响应式更新
    allRealtimeDetails.value[equipmentIndex] = { ...allRealtimeDetails.value[equipmentIndex], ...realtimeData };
  } else {
    // 如果收到了一个不在当前 allRealtimeDetails 中的设备数据，可以考虑添加
    // 但通常情况下，allRealtimeDetails 应该通过 HTTP 请求预先填充
    console.warn(`收到未知设备ID的实时数据: ${realtimeData.equipment_id}。已添加。`);
    allRealtimeDetails.value.push(realtimeData);
  }
}

const setupWebSocketConnections = () => {
  // 停止所有之前的 WebSocket 连接
  websocketService.stopAllMonitoring();

  // 获取当前活跃设备类型下的所有设备ID
  const equipmentIdsToMonitor = allEquipmentStatus.value
    .filter(eq => eq.equipment_type === activeType.value)
    .map(eq => eq.equipment_id);

  if (equipmentIdsToMonitor.length > 0) {
    websocketService.startMonitoring(equipmentIdsToMonitor, updateRealtimeData);
  } else {
    console.log(`设备类型 ${activeType.value} 下没有设备可供 WebSocket 监控。`);
  }
};


/* ---------- 事件处理 ---------- */
const refreshData = async () => {
  loading.value = true
  try {
    await fetchEquipmentStatusOverview()
    await fetchAllRealtimeDataForActiveType()
    await fetchAlarms()
    // 在初始数据加载完成后，设置 WebSocket 连接
    setupWebSocketConnections();
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const exportData = () => {
  ElMessage.info('导出功能开发中')
}

const handleAlarmSizeChange = (size) => {
  alarmPagination.value.page_size = size
  alarmPagination.value.page = 1
  fetchAlarms()
}

const handleAlarmCurrentChange = (page) => {
  alarmPagination.value.page = page
  fetchAlarms()
}

const handleRealtimeSizeChange = (size) => {
  realtimePagination.value.page_size = size
  realtimePagination.value.page = 1
}

const handleRealtimeCurrentChange = (page) => {
  realtimePagination.value.page = page
}

watch(activeType, async (newType) => {
  if (newType) {
    // 当 activeType 改变时，重新获取新类型设备的初始数据
    await fetchAllRealtimeDataForActiveType();
    // 然后重新建立 WebSocket 连接
    setupWebSocketConnections();
  }
})

onMounted(async () => {
  await refreshData() // 首次加载数据并设置 WebSocket
})

onUnmounted(() => {
  websocketService.stopAllMonitoring(); // 组件卸载时关闭所有 WebSocket 连接
});

/* ---------- 报警记录更新功能 ---------- */
const showUpdateLevelDialog = (alarm) => {
  ElMessageBox.prompt('请输入新的报警级别', '更新报警级别', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^(警告|严重|致命)$/,
    inputErrorMessage: '级别必须为 "警告", "严重" 或 "致命"'
  }).then(async ({ value }) => {
    try {
      await monitoringAPI.updateAlarmLevel(alarm.alarm_id, value)
      ElMessage.success(`报警记录级别已更新为：${value}`)
      await fetchAlarms() // 刷新报警列表
    } catch (error) {
      ElMessage.error('更新报警级别失败')
    }
  }).catch(() => {
    ElMessage.info('取消更新')
  })
}

const showUpdateStatusDialog = (alarm) => {
  ElMessageBox.prompt('请输入新的报警状态', '更新报警状态', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^(已处理|未处理)$/,
    inputErrorMessage: '状态必须为 "已处理" 或 "未处理"'
  }).then(async ({ value }) => {
    try {
      await monitoringAPI.updateAlarmStatus(alarm.alarm_id, value)
      ElMessage.success(`报警记录状态已更新为：${value}`)
      await fetchAlarms() // 刷新报警列表
    } catch (error) {
      ElMessage.error('更新报警状态失败')
    }
  }).catch(() => {
    ElMessage.info('取消更新')
  })
}
</script>

<style scoped>
h2 {
  margin-bottom: 10px;
  color: #ffffff;
}
.production-monitoring {
  padding: 20px;
  background: #0a0a0a; /* Changed to match global background */
  color: #fff;
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.params-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.param-card {
  background: rgba(26, 26, 26, 0.9) !important; /* Darker background */
  border: 1px solid rgba(255, 255, 255, 0.1) !important; /* Subtle border */
  border-radius: 8px !important; /* More rounded corners */
  cursor: pointer;
  transition: all 0.2s;
}
.param-card:hover {
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.4); /* Blue glow on hover */
  transform: translateY(-3px);
}
.param-card.active {
  border: 1px solid #409eff !important; /* Active border color */
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.6);
}
.param-card h3 {
  margin: 0 0 8px !important;
  font-size: 16px !important;
  color: #ffffff !important;
}
.param-row {
  display: flex !important;
  justify-content: space-between !important;
  font-size: 14px !important;
  margin: 6px 0 !important;
  color: #cccccc !important; /* Lighter text for values */
}
.param-row b {
  color: #ffffff; /* White for bold values */
  font-weight: 600;
}
.realtime-section,
.alarm-section {
  margin-bottom: 30px;
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}
.realtime-section h2, .alarm-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
}
.realtime-card {
  background: rgba(38, 38, 38, 0.9); /* Slightly lighter card background */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.realtime-card h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #ffffff;
}
.real-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin: 6px 0;
  color: #cccccc;
}
.real-item b {
  color: #ffffff;
  font-weight: 500;
}
.ts {
  margin-top: 10px;
  font-size: 12px;
  color: #888;
  text-align: right;
}
.el-table {
  background: transparent;
  color: #ffffff;
}
.el-table th.el-table__cell {
  background: rgba(38, 38, 38, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
.el-table td.el-table__cell {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background: rgba(255, 255, 255, 0.02);
}
.el-table__body tr:hover > td.el-table__cell {
  background: rgba(255, 255, 255, 0.05);
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.no-data {
  text-align: center;
  color: #888;
  padding: 20px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 10px;
}
/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .header-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  .params-overview {
    grid-template-columns: 1fr;
  }
}
</style>
