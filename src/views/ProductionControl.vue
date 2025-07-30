<template>
  <div class="equipment-page">
    <h2>设备管理</h2>

    <!-- 查询栏 -->
    <el-row :gutter="12" class="filter-bar">
      <el-col :span="6">
        <el-select v-model="query.type" placeholder="设备类型" clearable>
          <el-option label="全部" value="" />
          <el-option label="注塑机" value="注塑机" />
          <el-option label="丝印机" value="丝印机" />
          <el-option label="烫金机" value="烫金机" />
          <el-option label="喷漆机" value="喷漆机" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-input v-model="query.name" placeholder="设备名称" clearable />
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="handleQuery" :loading="loading">查询</el-button>
      </el-col>
    </el-row>

    <!-- 统一规格提示 -->
    <div v-if="currentSpec" class="spec-banner">
      <span>{{ currentSpec.title }} 统一规格：</span>
      <span>{{ currentSpec.detail }}</span>
    </div>
    <div v-else class="spec-banner">当前查看全部设备类型，无统一规格</div>

    <!-- 表格 -->
    <el-table :data="pageData" stripe style="width:100%" v-loading="loading">
      <el-table-column prop="equipment_name" label="设备名称" width="180" />
      <el-table-column prop="equipment_type" label="设备类型" width="120" />
      <el-table-column prop="equipment_status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.equipment_status)">
            {{ row.equipment_status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="所在位置" width="150" />

      <!-- 实时数据 -->
      <el-table-column label="实时数据" min-width="220">
        <template #default="{ row }">
          <div v-if="row.equipment_type === '注塑机'">
            温度：{{ row.realtime?.heating_temp_range || '180-220' }}
            <br />
            压力：{{ row.realtime?.injection_pressure || 120 }} MPa
          </div>
          <div v-else-if="row.equipment_type === '丝印机'">
            压力：{{ row.realtime?.printing_pressure || 0.6 }} MPa
            <br />
            速度：{{ row.realtime?.printing_speed || 1.0 }} m/s
          </div>
          <div v-else-if="row.equipment_type === '烫金机'">
            温度：{{ row.realtime?.stamping_temp || 180 }} ℃
            <br />
            压力：{{ row.realtime?.stamping_pressure || 1.8 }} MPa
          </div>
          <div v-else-if="row.equipment_type === '喷漆机'">
            压力：{{ row.realtime?.spray_pressure || 0.5 }} MPa
            <br />
            距离：{{ row.realtime?.spray_distance || 200 }} mm
          </div>
        </template>
      </el-table-column>

      <!-- 操作按钮 -->
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            v-if="['运行中', '停机'].includes(row.equipment_status)"
            size="small"
            :type="row.equipment_status === '停机' ? 'success' : 'warning'"
            plain
            @click="toggleStatus(row)"
          >
            {{ row.equipment_status === '停机' ? '启动' : '停机' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="filteredList.length"
      :page-size="pageSize"
      v-model:current-page="currentPage"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { equipmentAPI } from '../api/equipment'

/* ---------- 统一规格常量 ---------- */
const TYPE_SPECS = {
  注塑机: { title: '注塑机', detail: '最大合模力：1800 kN | 最大注射压力：1500 MPa | 最大加热温度：220 ℃' },
  丝印机: { title: '丝印机', detail: '最大丝印压力：0.8 MPa | 最大丝印速度：1.2 m/s | 最大网目数：300 目' },
  烫金机: { title: '烫金机', detail: '最高温度：200 ℃ | 最大压力：2.5 MPa | 最大金箔速度：10 m/min' },
  喷漆机: { title: '喷漆机', detail: '最大喷涂压力：0.6 MPa | 最大喷涂距离：300 mm | 最高烘干温度：80 ℃' }
}

/* ---------- 响应式数据 ---------- */
const query = ref({ type: '', name: '' })
const pageSize = 10
const currentPage = ref(1)
const loading = ref(false)
const allEquipment = ref([])

/* ---------- 计算统一规格提示 ---------- */
const currentSpec = computed(() => (query.value.type ? TYPE_SPECS[query.value.type] : null))

/* ---------- 列表 & 分页 ---------- */
const filteredList = computed(() => {
  let list = allEquipment.value
  if (query.value.type) list = list.filter(e => e.equipment_type === query.value.type)
  if (query.value.name) list = list.filter(e => e.equipment_name.includes(query.value.name))
  return list
})
const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

/* ---------- 方法 ---------- */
const statusTag = (status) =>
  ({ 运行中: 'success', 维修中: 'warning', 故障: 'danger', 停机: 'info' }[status] || 'info')

const fetchEquipmentList = async () => {
  loading.value = true
  try {
    const { data } = await equipmentAPI.getEquipmentList({
      type: query.value.type,
      name: query.value.name,
      page: currentPage.value,
      pageSize
    })
    allEquipment.value = data.list
  } catch {
    ElMessage.error('获取设备列表失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  currentPage.value = 1
  fetchEquipmentList()
}

const toggleStatus = async (row) => {
  try {
    const newStatus = row.equipment_status === '运行中' ? '停机' : '运行中'
    await equipmentAPI.updateEquipmentParameters(row.equipment_id, { equipment_status: newStatus })
    row.equipment_status = newStatus
    ElMessage.success(`${row.equipment_name} ${newStatus === '运行中' ? '已启动' : '已停机'}`)
  } catch {
    ElMessage.error('设备状态切换失败')
  }
}

/* ---------- 初始化 ---------- */
onMounted(fetchEquipmentList)
</script>

<style scoped>
h2 { margin-bottom: 20px; }
.equipment-page {
  padding: 20px;
  background: #0f0f0f;
  color: #fff;
}
.spec-banner {
  margin-bottom: 12px;
  font-size: 14px;
  color: #9ca3af;
}
.el-row { margin-bottom: 20px; }
.el-pagination { margin-top: 20px; }
</style>