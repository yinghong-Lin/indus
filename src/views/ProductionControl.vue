<template>
  <div class="production-control">
    <div class="page-header">
      <h2>设备管理</h2>
    </div>

    <!-- 查询栏 -->
    <el-card class="filter-card">
      <el-row :gutter="16" class="filter-row">
        <el-col :xs="24" :sm="6" :md="4">
          <el-select v-model="queryParams.equipment_type" placeholder="选择设备类型" clearable class="full-width">
            <el-option label="全部类型" value="all" />
            <el-option label="注塑机" value="injection_molding" />
            <el-option label="丝印机" value="screen_printing" />
            <el-option label="烫金机" value="hot_stamping" />
            <el-option label="喷漆机" value="spray_painting" />
          </el-select>
        </el-col>

        <el-col :xs="24" :sm="8" :md="6">
          <el-input v-model="queryParams.keyword" placeholder="输入设备名称或位置" clearable class="full-width"
            @keyup.enter="handleSearch">
            <template #prefix><el-icon>
                <Search />
              </el-icon></template>
          </el-input>
        </el-col>

        <el-col :xs="24" :sm="10" :md="6">
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon>
              <Search />
            </el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>重置
          </el-button>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8" class="text-right">
          <el-button type="success" @click="openAddDialog">
            <el-icon>
              <Plus />
            </el-icon>新增设备
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 设备列表 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe class="equipment-table">
        <el-table-column prop="equipment_name" label="设备名称" width="200" />
        <el-table-column prop="equipment_type" label="设备类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.equipment_type)" size="small">
              {{ getTypeName(row.equipment_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="equipment_status" label="运行状态" width="130">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.equipment_status)" size="small">
              {{ getStatusName(row.equipment_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="设备位置" width="150" />
        <el-table-column label="关键参数" width="300">
          <template #default="{ row }">
            <div class="key-params">
              <div v-for="(param, key) in getKeyParams(row)" :key="key" class="param-item">
                <span class="param-label">{{ param.label }}:</span>
                <span class="param-value">{{ param.value }}{{ param.unit }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button v-if="['RUN', 'OFF'].includes(row.equipment_status)" size="small"
                :type="row.equipment_status === 'OFF' ? 'success' : 'warning'" @click="toggleEquipmentStatus(row)"
                :loading="row.statusLoading">
                {{ row.equipment_status === 'OFF' ? '启动' : '停机' }}
              </el-button>
              <!-- <el-button size="small" @click="openEditDialog(row)">编辑</el-button> -->
              <el-button size="small" type="info" @click="openParamDialog(row)">设置</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 新增弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="900px" :close-on-click-modal="false">
      <el-form :model="equipmentForm" :rules="equipmentRules" ref="equipmentFormRef" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="equipment_name">
              <el-input v-model="equipmentForm.equipment_name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="equipment_type">
              <el-select v-model="equipmentForm.equipment_type" placeholder="请选择设备类型"
                :disabled="!!equipmentForm.equipment_id" @change="handleTypeChange" class="full-width">
                <el-option label="注塑机" value="injection_molding" />
                <el-option label="丝印机" value="screen_printing" />
                <el-option label="烫金机" value="hot_stamping" />
                <el-option label="喷漆机" value="spray_painting" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="设备位置" prop="location">
          <el-input v-model="equipmentForm.location" placeholder="请输入设备位置" />
        </el-form-item>

        <!-- 设置参数 -->
        <el-divider content-position="left">设置参数</el-divider>
        <DynamicSetting v-if="equipmentForm.setting_details && Object.keys(equipmentForm.setting_details).length > 0"
          v-model="equipmentForm.setting_details" :type="equipmentForm.equipment_type" />

        <!-- 设备规格 -->
        <el-divider content-position="left">设备规格</el-divider>
        <DynamicSpec v-if="equipmentForm.spec_details && Object.keys(equipmentForm.spec_details).length > 0"
          v-model="equipmentForm.spec_details" :type="equipmentForm.equipment_type" />
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEquipmentForm" :loading="submitLoading">
          {{ equipmentForm.equipment_id ? '更新' : '新增' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 参数设置弹窗 -->
    <el-dialog title="设备参数设置" v-model="paramDialogVisible" width="800px" :close-on-click-modal="false">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="运行参数" name="setting">
          <DynamicSetting v-model="paramForm.setting_details" :type="paramForm.equipment_type" />
        </el-tab-pane>
        <el-tab-pane label="设备规格" name="spec">
          <DynamicSpec v-model="paramForm.spec_details" :type="paramForm.equipment_type" />
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="paramDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitParamForm" :loading="paramSubmitLoading">
            保存参数
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus, Monitor, Edit, Setting, Delete, Tools
} from '@element-plus/icons-vue'
import { equipmentAPI } from '../api/equipment'
import DynamicSetting from './components/DynamicSetting.vue'
import DynamicSpec from './components/DynamicSpec.vue'

// 中文映射
const typeNameMap = {
  injection_molding: '注塑机',
  screen_printing: '丝印机',
  hot_stamping: '烫金机',
  spray_painting: '喷漆机'
}
const statusNameMap = {
  RUN: '运行中',
  OFF: '已停机',
  ERROR: '故障',
  MAINTAIN: '维护中'
}

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const paramSubmitLoading = ref(false)
const tableData = ref([])

const queryParams = reactive({
  equipment_type: 'all',
  keyword: ''
})
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const dialogVisible = ref(false)
const paramDialogVisible = ref(false)
const activeTab = ref('setting')
const equipmentForm = ref({})
const paramForm = ref({})
const equipmentFormRef = ref()

const equipmentRules = {
  equipment_name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  equipment_type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入设备位置', trigger: 'blur' }]
}

const dialogTitle = computed(() => (equipmentForm.value.equipment_id ? '编辑设备' : '新增设备'))

// 工具函数
const getTypeName = (type) => typeNameMap[type] || type
const getStatusName = (status) => statusNameMap[status] || status
const getTypeTagType = () => 'info'
const getStatusTagType = (status) =>
  ({ RUN: 'success', OFF: 'info', ERROR: 'danger', MAINTAIN: 'warning' }[status] || 'info')

const formatDateTime = (dt) => {
  if (!dt) return '-'
  try {
    return new Date(dt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return '-'
  }
}

const getKeyParams = (row) => {
  const { equipment_type, setting_details } = row
  const list = []
  switch (equipment_type) {
    case 'injection_molding':
      list.push({ label: '加热温度', value: setting_details?.setting_heating_temp?.value, unit: '℃' })
      list.push({ label: '注射压力', value: setting_details?.setting_injection_pressure?.value, unit: 'MPa' })
      break
    case 'screen_printing':
      list.push({ label: '印刷压力', value: setting_details?.setting_printing_pressure?.value, unit: 'MPa' })
      list.push({ label: '印刷速度', value: setting_details?.setting_printing_speed?.value, unit: 'm/s' })
      break
    case 'hot_stamping':
      list.push({ label: '烫金温度', value: setting_details?.setting_stamping_temp?.value, unit: '℃' })
      list.push({ label: '烫金压力', value: setting_details?.setting_stamping_pressure?.value, unit: 'MPa' })
      break
    case 'spray_painting':
      list.push({ label: '喷漆压力', value: setting_details?.setting_spray_pressure?.value, unit: 'MPa' })
      list.push({ label: '干燥温度', value: setting_details?.setting_drying_temp?.value, unit: '℃' })
      break
  }
  return list.filter(i => i.value !== undefined)
}

// 列表获取 - 修正API调用
const fetchEquipmentList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    // 根据是否有搜索条件选择不同的API
    let response
    if (queryParams.keyword || queryParams.equipment_type !== 'all') {
      // 有搜索条件时使用搜索接口
      response = await equipmentAPI.searchEquipment({
        ...params,
        keyword: queryParams.keyword,
        equipment_type: queryParams.equipment_type
      })
    } else {
      // 无搜索条件时使用列表接口
      response = await equipmentAPI.getEquipmentList(params)
    }

    if (response.code === 200) {
      tableData.value = (response.data.equipments || []).map(item => ({ ...item, statusLoading: false }))
      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error(response.msg || '获取设备列表失败')
    }
  } catch (e) {
    console.error('获取设备列表失败:', e)
    ElMessage.error('获取设备列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索图片/重置
const handleSearch = () => {
  pagination.page = 1
  fetchEquipmentList()
}
const handleReset = () => {
  Object.assign(queryParams, { equipment_type: 'all', keyword: '' })
  handleSearch()
}

// 分页
const handleSizeChange = (size) => {
  pagination.page_size = size
  pagination.page = 1
  fetchEquipmentList()
}
const handleCurrentChange = (page) => {
  pagination.page = page
  fetchEquipmentList()
}

// 生成默认设置参数
const generateDefaultSettings = (type) => {
  switch (type) {
    case 'injection_molding':
      return {
        setting_heating_temp: { value: 200, unit: '℃' },
        setting_cooling_time: { value: 15, unit: 's' },
        setting_injection_speed: { value: 80, unit: 'mm/s' },
        setting_injection_pressure: { value: 120, unit: 'MPa' },
        setting_injection_time: { value: 3, unit: 's' },
        setting_opening_time: { value: 2, unit: 's' },
        setting_closing_time: { value: 1, unit: 's' },
        setting_holding_pressure: { value: 80, unit: 'MPa' },
        setting_holding_time: { value: 5, unit: 's' },
        setting_injection_position: { value: 0.05, unit: 'mm' },
        setting_screw_speed: { value: 150, unit: 'rpm' }
      }
    case 'screen_printing':
      return {
        setting_printing_pressure: { value: 0.5, unit: 'MPa' },
        setting_printing_speed: { value: 0.8, unit: 'm/s' },
        setting_ink_viscosity: { value: 12, unit: 'Pa·s' },
        setting_ink_drying_time: { value: 30, unit: 's' }
      }
    case 'hot_stamping':
      return {
        setting_stamping_temp: { value: 120, unit: '℃' },
        setting_stamping_pressure: { value: 1.5, unit: 'MPa' },
        setting_stamping_time: { value: 1.0, unit: 's' },
        setting_foil_speed: { value: 3.0, unit: 'm/s' }
      }
    case 'spray_painting':
      return {
        setting_spray_pressure: { value: 0.4, unit: 'MPa' },
        setting_spray_distance: { value: 200, unit: 'mm' },
        setting_spray_speed: { value: 1.0, unit: 'm/s' },
        setting_drying_temp: { value: 60, unit: '℃' },
        setting_drying_time: { value: 25, unit: 's' },
        setting_paint_viscosity: { value: 15, unit: 'Pa·s' }
      }
    default:
      return {}
  }
}

// 生成默认规格参数
const generateDefaultSpecs = (type) => {
  switch (type) {
    case 'injection_molding':
      return {
        spec_opening_stroke: { min: 0, max: 200, unit: 'mm' },
        spec_clamping_force: { min: 0, max: 1200, unit: 'kN' },
        spec_motor_power: { min: 0, max: 15.5, unit: 'kW' },
        spec_heating_zone_count: { min: 0, max: 8, unit: '个' },
        spec_heating_temp: { min: 180, max: 280, unit: '℃' },
        spec_injection_speed: { min: 0, max: 200, unit: 'mm/s' },
        spec_injection_pressure: { min: 0, max: 180, unit: 'MPa' },
        spec_screw_speed: { min: 0, max: 300, unit: 'rpm' },
        spec_holding_pressure: { min: 0, max: 120, unit: 'MPa' }
      }
    case 'screen_printing':
      return {
        spec_printing_pressure: { min: 0, max: 0.8, unit: 'MPa' },
        spec_printing_speed: { min: 0, max: 1.2, unit: 'm/s' },
        spec_mesh_count: { min: 0, max: 300, unit: '目' },
        spec_template_thickness: { min: 0, max: 0.3, unit: 'mm' },
        spec_ink_viscosity: { min: 0, max: 15, unit: 'Pa·s' },
        spec_uv_drying_power: { min: 0, max: 2000, unit: 'W' }
      }
    case 'hot_stamping':
      return {
        spec_stamping_temp: { min: 0, max: 200, unit: '℃' },
        spec_stamping_pressure: { min: 0, max: 2.5, unit: 'MPa' },
        spec_foil_speed_min: { min: 1, max: 10, unit: 'm/s' },
        spec_foil_speed_max: { min: 1, max: 10, unit: 'm/s' },
        spec_stamping_duration: { min: 0, max: 5, unit: 's' }
      }
    case 'spray_painting':
      return {
        spec_spray_pressure: { min: 0, max: 0.6, unit: 'MPa' },
        spec_spray_distance_min: { min: 150, max: 300, unit: 'mm' },
        spec_spray_distance_max: { min: 150, max: 300, unit: 'mm' },
        spec_spray_speed: { min: 0, max: 1.5, unit: 'm/s' },
        spec_drying_temp: { min: 0, max: 80, unit: '℃' },
        spec_paint_viscosity: { min: 0, max: 25, unit: 'Pa·s' }
      }
    default:
      return {}
  }
}

const openAddDialog = () => {
  const type = 'injection_molding'
  equipmentForm.value = {
    equipment_name: '',
    equipment_type: type,
    location: '',
    setting_details: generateDefaultSettings(type),
    spec_details: generateDefaultSpecs(type)
  }
  dialogVisible.value = true
}

// 编辑弹窗
const openEditDialog = async (row) => {
  try {
    const res = await equipmentAPI.getEquipmentById(row.equipment_id)
    if (res.code === 200) {
      equipmentForm.value = { ...res.data }
      dialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取设备信息失败')
    }
  } catch (error) {
    console.error('获取设备信息失败:', error)
    ElMessage.error('获取设备信息失败')
  }
}

// 参数弹窗
const openParamDialog = async (row) => {
  try {
    const res = await equipmentAPI.getEquipmentById(row.equipment_id)
    if (res.code === 200) {
      paramForm.value = res.data
      paramDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取设备信息失败')
    }
  } catch (error) {
    console.error('获取设备信息失败:', error)
    ElMessage.error('获取设备信息失败')
  }
}

const submitEquipmentForm = async () => {
  try {
    await equipmentFormRef.value?.validate()

    submitLoading.value = true

    // 深拷贝 payload 以避免直接修改响应式对象
    const payload = JSON.parse(JSON.stringify(equipmentForm.value));

    // 确保 setting_details 中的 value 字段为数字
    if (payload.setting_details) {
      for (const key in payload.setting_details) {
        if (payload.setting_details[key] && typeof payload.setting_details[key].value !== 'number') {
          payload.setting_details[key].value = 0; // 默认为 0
        }
      }
    } else {
      payload.setting_details = generateDefaultSettings(payload.equipment_type);
    }

    // 确保 spec_details 中的 min/max 字段为数字
    if (payload.spec_details) {
      for (const key in payload.spec_details) {
        if (payload.spec_details[key]) {
          if (typeof payload.spec_details[key].min !== 'number') {
            payload.spec_details[key].min = 0;
          }
          if (typeof payload.spec_details[key].max !== 'number') {
            payload.spec_details[key].max = 0;
          }
        }
      }
    } else {
      payload.spec_details = generateDefaultSpecs(payload.equipment_type);
    }

    // 如果是新增操作，确保 equipment_status 默认为 'OFF'
    if (!payload.equipment_id) {
      payload.equipment_status = 'OFF';
    }

    const api = equipmentForm.value.equipment_id
      ? equipmentAPI.updateEquipment
      : equipmentAPI.addEquipment

    const res = await api(payload)

    if (res.code === 200) {
      ElMessage.success(res.msg || '操作成功')
      dialogVisible.value = false
      fetchEquipmentList()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    if (error !== false) { // 表单验证失败时不显示错误
      console.error('提交失败:', error)
      ElMessage.error('操作失败，请检查输入信息')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除"${row.equipment_name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await equipmentAPI.deleteEquipment(row.equipment_id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchEquipmentList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const toggleEquipmentStatus = async (row) => {
  const newStatus = row.equipment_status === 'RUN' ? 'OFF' : 'RUN'
  row.statusLoading = true
  try {
    const res = await equipmentAPI.updateEquipmentRunStatus(row.equipment_id, newStatus)
    if (res.code === 200) {
      row.equipment_status = newStatus
      ElMessage.success(res.msg || '状态切换成功')
    } else {
      ElMessage.error(res.msg || '状态切换失败')
    }
  } catch (error) {
    console.error('状态切换失败:', error)
    ElMessage.error('状态切换失败')
  } finally {
    row.statusLoading = false
  }
}

const submitParamForm = async () => {
  paramSubmitLoading.value = true
  try {
    const api = activeTab.value === 'setting'
      ? equipmentAPI.updateEquipmentSetting
      : equipmentAPI.updateEquipmentSpec
    const res = await api(paramForm.value.equipment_id, {
      equipment_type: paramForm.value.equipment_type,
      [activeTab.value + '_details']: paramForm.value[activeTab.value + '_details']
    })
    if (res.code === 200) {
      ElMessage.success(res.msg || '保存成功')
      paramDialogVisible.value = false
      fetchEquipmentList()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    paramSubmitLoading.value = false
  }
}

// 设备类型改变 → 填充默认参数
const handleTypeChange = (type) => {
  if (!equipmentForm.value.equipment_id) {
    // 新增时才重新生成默认参数
    equipmentForm.value.setting_details = generateDefaultSettings(type)
    equipmentForm.value.spec_details = generateDefaultSpecs(type)
  }
}

onMounted(() => {
  fetchEquipmentList()
})
</script>

<style scoped>
.production-control {
  padding: 20px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-header p {
  color: #888;
  font-size: 14px;
}

.filter-card,
.table-card {
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.filter-row {
  align-items: center;
}

.full-width {
  width: 100%;
}

.text-right {
  text-align: right;
}

.equipment-table {
  background: transparent;
}

.equipment-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.equipment-icon {
  color: #409EFF;
}

.status-icon {
  margin-right: 4px;
}

.key-params {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.param-label {
  color: #888;
  margin-right: 4px;
}

.param-value {
  color: #ffffff;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .production-control {
    padding: 10px;
  }

  .filter-row {
    flex-direction: column;
    gap: 10px;
  }

  .text-right {
    text-align: left;
  }

  .action-buttons {
    flex-direction: column;
  }
}

/* Element Plus 深色主题定制 */
:deep(.el-card) {
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-card__header) {
  background: rgba(38, 38, 38, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-table) {
  background: transparent;
  color: #ffffff;
}

:deep(.el-table th.el-table__cell) {
  background: rgba(38, 38, 38, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 255, 255, 0.02);
}

:deep(.el-table__body tr:hover > td.el-table__cell) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.el-pagination) {
  color: #ffffff;
}

:deep(.el-dialog) {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog__header) {
  background: rgba(38, 38, 38, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-form-item__label) {
  color: #ffffff;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-input__inner) {
  color: #ffffff;
}

:deep(.el-select .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
}

:deep(.el-tabs__header) {
  background: rgba(38, 38, 38, 0.5);
  border-radius: 8px;
  padding: 10px;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__item) {
  color: #888;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
}
</style>
