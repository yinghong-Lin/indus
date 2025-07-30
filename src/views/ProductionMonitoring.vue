<template>
  <div class="production-monitoring">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>生产监控</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新数据
        </el-button>
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon> 导出报告
        </el-button>
      </div>
    </div>

    <!-- 1️⃣ 工艺参数总览（每类一套） -->
    <div class="params-overview">
      <el-card
        class="param-card"
        v-if="injectionSetting.setting_id"
        :class="{ active: activeType === '注塑机' }"
        @click="activeType = '注塑机'"
      >
        <template #header><h3>注塑机 - 工艺参数</h3></template>
        <div class="param-row"><span>加热温度：</span><b>{{ injectionSetting.heating_temp_range }}</b></div>
        <div class="param-row"><span>注射压力：</span><b>{{ injectionSetting.injection_pressure }} MPa</b></div>
        <div class="param-row"><span>注射速度：</span><b>{{ injectionSetting.injection_speed }} mm/s</b></div>
        <div class="param-row"><span>螺杆转速：</span><b>{{ injectionSetting.screw_speed }} r/min</b></div>
        <div class="param-row"><span>保压压力：</span><b>{{ injectionSetting.holding_pressure }} MPa</b></div>
      </el-card>

      <el-card
        class="param-card"
        v-if="spraySetting.setting_id"
        :class="{ active: activeType === '喷漆机' }"
        @click="activeType = '喷漆机'"
      >
        <template #header><h3>喷漆机 - 工艺参数</h3></template>
        <div class="param-row"><span>喷涂压力：</span><b>{{ spraySetting.spray_pressure }} MPa</b></div>
        <div class="param-row"><span>喷涂距离：</span><b>{{ spraySetting.spray_distance }} mm</b></div>
        <div class="param-row"><span>喷涂速度：</span><b>{{ spraySetting.spray_speed }} m/s</b></div>
        <div class="param-row"><span>烘干温度：</span><b>{{ spraySetting.drying_temp }} °C</b></div>
      </el-card>

      <el-card
        class="param-card"
        v-if="screenSetting.setting_id"
        :class="{ active: activeType === '丝印机' }"
        @click="activeType = '丝印机'"
      >
        <template #header><h3>丝印机 - 工艺参数</h3></template>
        <div class="param-row"><span>丝印压力：</span><b>{{ screenSetting.printing_pressure }} MPa</b></div>
        <div class="param-row"><span>丝印速度：</span><b>{{ screenSetting.printing_speed }} m/s</b></div>
        <div class="param-row"><span>油墨粘度：</span><b>{{ screenSetting.ink_viscosity }} Pa·s</b></div>
        <div class="param-row"><span>干燥时间：</span><b>{{ screenSetting.ink_drying_time }} s</b></div>
      </el-card>

      <el-card
        class="param-card"
        v-if="hotStampSetting.setting_id"
        :class="{ active: activeType === '烫金机' }"
        @click="activeType = '烫金机'"
      >
        <template #header><h3>烫金机 - 工艺参数</h3></template>
        <div class="param-row"><span>烫金温度：</span><b>{{ hotStampSetting.stamping_temp_range }}</b></div>
        <div class="param-row"><span>烫金压力：</span><b>{{ hotStampSetting.stamping_pressure_range }}</b></div>
        <div class="param-row"><span>烫金时间：</span><b>{{ hotStampSetting.stamping_time_range }}</b></div>
        <div class="param-row"><span>金箔速度：</span><b>{{ hotStampSetting.foil_speed_range }}</b></div>
      </el-card>
    </div>

    <!-- 2️⃣ 实时数据（同类多台，各不相同） -->
    <div class="realtime-section">
      <h2>实时数据 - {{ activeType }}</h2>
      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
          :lg="6"
          v-for="dev in realtimeCards"
          :key="dev.device_id"
        >
          <el-card class="realtime-card">
            <template #header>
              <h4>{{ dev.device_name }}</h4>
              <el-tag :type="statusTag(dev.status)">{{ dev.status }}</el-tag>
            </template>
            <div class="real-item" v-for="(v, k) in dev.data" :key="k">
              <span>{{ k }}：</span><b>{{ v }}</b>
            </div>
            <div class="ts">采集时间：{{ dev.collection_time }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 3️⃣ 报警记录 -->
    <div class="alarm-section">
      <h2>报警记录</h2>
      <el-table :data="latestAlarms" stripe style="width: 100%">
        <el-table-column prop="alarm_time" label="时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.alarm_time) }}</template>
        </el-table-column>
        <el-table-column prop="alarm_code" label="代码" width="120" />
        <el-table-column prop="alarm_detail" label="详情" />
        <el-table-column prop="alarm_level" label="级别" width="100">
          <template #default="scope">
            <el-tag :type="alarmLevelTag(scope.row.alarm_level)">
              {{ scope.row.alarm_level }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { monitoringAPI } from '../api/monitoring'
import { Refresh, Download } from '@element-plus/icons-vue'

/* ---------- 响应式状态 ---------- */
const activeType         = ref('注塑机')   // 默认显示注塑机
const injectionSetting   = ref({})
const spraySetting       = ref({})
const screenSetting      = ref({})
const hotStampSetting    = ref({})
const allRealtimeDevices = ref([])
const alarms             = ref([])

/* ---------- 计算属性 ---------- */
const realtimeCards = computed(() =>
  allRealtimeDevices.value.filter(d => d.type === activeType.value)
)

const latestAlarms = computed(() =>
  [...alarms.value]
    .sort((a, b) => new Date(b.alarm_time) - new Date(a.alarm_time))
    .slice(0, 5)
)

/* ---------- 工具 ---------- */
const formatTime    = t => (t ? new Date(t).toLocaleString() : '-')
const statusTag     = s => ({ 正常: 'success', 故障: 'danger', 维修中: 'info' }[s] || 'info')
const alarmLevelTag = l => ({ warning: 'warning', serious: 'danger', critical: 'danger' }[l] || 'info')

/* ---------- 生成模拟数据 ---------- */
const fetchAllData = () => {
  /* 1. 工艺参数（每类一套） */
  injectionSetting.value = {
    setting_id: 1,
    heating_temp_range: '180℃',
    injection_pressure: 120,
    injection_speed: 80,
    screw_speed: 120,
    holding_pressure: 80.5
  }
  spraySetting.value = {
    setting_id: 2,
    spray_pressure: 0.5,
    spray_distance: 200,
    spray_speed: 1.2,
    drying_temp: 70
  }
  screenSetting.value = {
    setting_id: 3,
    printing_pressure: 0.6,
    printing_speed: 1.0,
    ink_viscosity: 12.5,
    ink_drying_time: 30
  }
  hotStampSetting.value = {
    setting_id: 4,
    stamping_temp_range: '160℃',
    stamping_pressure_range: '1.5-2.0 MPa',
    stamping_time_range: '1.0-2.0 s',
    foil_speed_range: '4-6 m/min'
  }

  /* 2. 实时设备（每类随机 1~3 台，值各不相同） */
  const devices = []
  const types = ['注塑机', '喷漆机', '丝印机', '烫金机']
  const statusPool = ['正常', '维修中', '故障']

  types.forEach(type => {
    const count = 1 + Math.floor(Math.random() * 3) // 1~3 台
    for (let i = 1; i <= count; i++) {
      const id = `${type}-${String(i).padStart(2, '0')}`
      const base = {
        device_id: id,
        device_name: id,
        type,
        status: statusPool[Math.floor(Math.random() * statusPool.length)],
        collection_time: new Date().toISOString()
      }

      switch (type) {
        case '注塑机':
          base.data = {
            温度: `${180 + Math.floor(Math.random() * 20)}℃`,
            压力: `${(115 + Math.random() * 10).toFixed(1)} MPa`,
            速度: `${(75 + Math.random() * 10).toFixed(1)} mm/s`
          }
          break
        case '喷漆机':
          base.data = {
            压力: `${(0.45 + Math.random() * 0.1).toFixed(2)} MPa`,
            距离: `${190 + Math.floor(Math.random() * 20)} mm`,
            温度: `${65 + Math.floor(Math.random() * 10)} °C`
          }
          break
        case '丝印机':
          base.data = {
            压力: `${(0.55 + Math.random() * 0.1).toFixed(2)} MPa`,
            速度: `${(0.9 + Math.random() * 0.2).toFixed(2)} m/s`,
            粘度: `${(12 + Math.random() * 2).toFixed(1)} Pa·s`
          }
          break
        case '烫金机':
          base.data = {
            温度: `${160 + Math.floor(Math.random() * 20)} °C`,
            压力: `${(1.5 + Math.random() * 0.5).toFixed(1)} MPa`,
            时间: `${(1.0 + Math.random() * 1.0).toFixed(1)} s`
          }
          break
      }
      devices.push(base)
    }
  })
  allRealtimeDevices.value = devices

  /* 3. 报警数据 */
  alarms.value = [
    {
      alarm_id: 1,
      alarm_code: 'TMP_OVER',
      alarm_detail: '注塑机温度超过警戒值',
      alarm_level: 'warning',
      alarm_time: new Date().toISOString()
    },
    {
      alarm_id: 2,
      alarm_code: 'PRES_LOW',
      alarm_detail: '喷漆机压力低于最低值',
      alarm_level: 'serious',
      alarm_time: new Date().toISOString()
    }
  ]
}

/* ---------- 事件 ---------- */
const refreshData = () => {
  fetchAllData()
  ElMessage.success('数据已刷新')
}
const exportData = () => ElMessage.info('导出功能开发中')

onMounted(fetchAllData)
</script>

<style scoped>
h2{
  margin-bottom: 10px;
}
.production-monitoring {
  padding: 20px;
  background: #1e1e1e;
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
}
.param-card {
  background: #2b2b2b !important;
  border: none !important;
  border-radius: 4px !important;
  cursor: pointer;
  transition: all 0.2s;
}
.param-card:hover {
  box-shadow: 0 0 10px #409eff;
}
.param-card.active {
  border: 1px solid #409eff !important;
}
.param-card h3 {
  margin: 0 0 8px !important;
  font-size: 15px !important;
  color: #fff !important;
}
.param-row {
  display: flex !important;
  justify-content: space-between !important;
  font-size: 13px !important;
  margin: 4px 0 !important;
  color: #fff !important;
}
.realtime-section,
.alarm-section {
  margin-bottom: 30px;
}
.realtime-card {
  background: #2b2b2b;
  border: none;
}
.realtime-card h4 {
  margin: 0 0 8px;
  font-size: 15px;
}
.real-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin: 4px 0;
}
.ts {
  margin-top: 8px;
  font-size: 12px;
  color: #888;
}
.el-card {
  margin-bottom: 20px;
}
</style>
