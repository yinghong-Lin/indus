<template>
  <div class="data-dashboard">
    <!-- 头部 -->
    <header class="dashboard-header">
      <h1>智慧工厂 · 生产数据大屏</h1>
      <div class="header-info">
        <span class="current-time">{{ currentTime }}</span>
        <el-button type="primary" size="small" @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </header>

    <!-- 今日产量 KPI（取自 production_data） -->
    <section class="kpi-overview">
      <div class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-value">{{ todayProduction }}</div>
          <div class="kpi-label">今日产量（件）</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-value">{{ equipmentOnline }}/{{ equipmentTotal }}</div>
          <div class="kpi-label">设备在线/总数</div>
        </div>
      </div>
    </section>

    <main class="dashboard-main">
      <!-- 左侧：设备卡片 -->
      <section class="left-panel">
        <div class="panel-card">
          <h3>设备运行状态</h3>
          <div class="equipment-grid">
            <div
              v-for="eq in equipmentList"
              :key="eq.equipment_id"
              class="equipment-item"
              :class="'status-' + eq.equipment_status"
              @click="openDrawer(eq)"
            >
              <div class="eq-name">{{ eq.equipment_name }}</div>
              <div class="eq-type">{{ eq.equipment_type }}</div>
              <div class="eq-status">{{ statusMap[eq.equipment_status] }}</div>
              <div class="eq-loc">{{ eq.location }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧：实时趋势 + 报警 -->
      <section class="right-panel">
        <!-- 实时趋势（60 分钟） -->
        <div class="panel-card">
          <h3>实时趋势（最近 60 分钟）</h3>
          <div ref="trendChartRef" class="chart-wrap"></div>
        </div>

        <!-- 报警列表（alarm_record） -->
        <div class="panel-card">
          <h3>实时报警</h3>
          <div class="alarm-list">
            <div
              v-for="al in alarmList"
              :key="al.alarm_id"
              class="alarm-item"
              :class="'level-' + al.alarm_level"
            >
              <div class="alarm-code">{{ al.alarm_code }}</div>
              <div class="alarm-desc">{{ al.alarm_detail }}</div>
              <div class="alarm-time">{{ al.alarm_time }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 抽屉：单设备实时数据 -->
    <el-drawer
      v-model="drawerVisible"
      :title="`${activeDevice?.equipment_name} 实时数据`"
      direction="rtl"
      size="50%"
    >
      <div ref="deviceChartRef" class="device-chart"></div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getDevices, getRealtime, getAlarms } from '../api/dashboard'

/* --------- 常量 --------- */
const statusMap = {
  normal: '正常',
  fault: '故障',
  repair: '维修中'
}
const typeMap = {
  injection: '注塑机',
  screen: '丝印机',
  spray: '喷漆机',
  hot: '烫金机'
}

/* --------- 响应式数据 --------- */
const currentTime = ref('')
const todayProduction = ref(0) // ⚠️ 无对应接口，保留为 0 或后续补充
const equipmentOnline = ref(0)
const equipmentTotal = ref(0)

const equipmentList = ref([])
const alarmList = ref([])
const trendChartRef = ref(null)
const deviceChartRef = ref(null)

let trendChart = null
let deviceChart = null

/* --------- 抽屉 --------- */
const drawerVisible = ref(false)
const activeDevice = ref(null)

/* --------- 生命周期 --------- */
onMounted(async () => {
  // 实时时钟
  setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)

  // 设备列表
  try {
    const { data } = await getDevices()
    equipmentList.value = data
    equipmentTotal.value = data.length
    equipmentOnline.value = data.filter(e => e.equipment_status === 'normal').length
  } catch (e) {
    ElMessage.error('获取设备列表失败')
  }

  // 报警列表
  try {
    const { data } = await getAlarms()
    alarmList.value = data.slice(0, 8)
  } catch (e) {
    ElMessage.error('获取报警列表失败')
  }

  // ⚠️ 全局趋势图无对应接口，暂不渲染
})

onUnmounted(() => {
  trendChart?.dispose()
  deviceChart?.dispose()
})

/* --------- 抽屉：单设备趋势 --------- */
async function openDrawer(device) {
  activeDevice.value = device
  drawerVisible.value = true
  await nextTick()

  try {
    const { data } = await getRealtime(device.equipment_type, device.equipment_id)
    deviceChart = echarts.init(deviceChartRef.value)
    deviceChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, top: 20, right: 20, bottom: 20 },
      xAxis: { type: 'time', boundaryGap: false },
      yAxis: { type: 'value', name: '实时值' },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'none',
        color: '#409eff',
        areaStyle: { opacity: 0.15 },
        data: data
      }]
    })
  } catch (e) {
    ElMessage.error('获取设备趋势失败')
  }
}
</script>

<style scoped>
.data-dashboard {
  padding: 20px;
  background: #0a0a0a;
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.kpi-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.kpi-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
}
.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.panel-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
}
.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
}
.equipment-item {
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #333;
  cursor: pointer;
  transition: transform 0.2s;
}
.equipment-item:hover {
  transform: translateY(-2px);
}
.status-normal { border-left: 4px solid #67c23a; }
.status-fault  { border-left: 4px solid #f56c6c; }
.status-repair { border-left: 4px solid #e6a23c; }
.alarm-list {
  max-height: 300px;
  overflow-y: auto;
}
.alarm-item {
  padding: 12px;
  margin-bottom: 8px;
  border-left: 4px solid;
  border-radius: 4px;
}
.level-致命 { border-color: #f56c6c; background: rgba(245,108,108,.1); }
.level-严重 { border-color: #e6a23c; background: rgba(230,162,60,.1); }
.level-警告 { border-color: #409eff; background: rgba(64,158,255,.1); }
.chart-wrap, .device-chart {
  width: 100%;
  height: 250px;
}
</style>