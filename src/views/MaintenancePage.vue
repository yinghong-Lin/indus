<template>
  <div class="maintenance-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>设备维修 & 故障管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
        <el-button type="danger" @click="showFaultDialog = true">
          <el-icon><Warning /></el-icon> 新增故障
        </el-button>
        <el-button type="success" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon> 新增维修
        </el-button>
        <el-button type="warning" @click="exportReport">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon total"><el-icon><Warning /></el-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总故障</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending"><el-icon><Clock /></el-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待解决</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed"><el-icon><CircleCheck /></el-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.resolved }}</div>
          <div class="stat-label">已解决</div>
        </div>
      </div>
    </div>

    <!-- 故障列表 -->
    <div class="section">
      <h3>故障列表</h3>
      <el-table :data="pagedFaults" stripe style="width:100%; margin-bottom:10px">
        <el-table-column prop="fault_id" label="故障ID" width="90" />
        <el-table-column prop="equipment_name" label="设备" width="140"/>
        <el-table-column prop="fault_code" label="故障代码" width="120" />
        <el-table-column prop="fault_description" label="故障描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="fault_time" label="发生时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.fault_time) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_resolved ? 'success' : 'danger'">
              {{ scope.row.is_resolved ? '已解决' : '待解决' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 故障列表操作列 -->
<el-table-column label="操作" width="230" >
  <template #default="scope">
    <el-button size="small" type="text" @click="editFault(scope.row)">
      编辑
    </el-button>
    <el-button size="small" type="text" @click="deleteFault(scope.row)">
      删除
    </el-button>
    <el-button size="small" type="text" @click="toggleResolve(scope.row)">
      {{ scope.row.is_resolved ? '重新打开' : '标记解决' }}
    </el-button>
  </template>
</el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="faults.length"
        :page-size="faultPageSize"
        v-model:current-page="faultCurrentPage"
        class="pagination"
      />
    </div>

    <!-- 维修记录 -->
    <div class="section">
      <h3>维修记录</h3>
      <el-table :data="pagedRecords" stripe style="width:100%">
        <el-table-column prop="maintenance_id" label="维修ID" width="90" />
        <el-table-column prop="equipment_name" label="设备" width="140"/>
        <el-table-column prop="fault_code" label="关联故障" width="120">
          <template #default="scope">{{ scope.row.fault_code || '-' }}</template>
        </el-table-column>
        <el-table-column prop="maintenance_type" label="维修类型" width="120" />
        <el-table-column prop="maintenance_time" label="时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.maintenance_time) }}</template>
        </el-table-column>
        <el-table-column prop="maintenance_measures" label="措施" min-width="180" show-overflow-tooltip />
       <!-- 维修记录操作列 -->
<el-table-column label="操作" width="200">
  <template #default="scope">
    <el-button size="small" type="text" @click="editMaintenance(scope.row)">
      编辑
    </el-button>
    <el-button size="small" type="text" @click="deleteMaintenance(scope.row)">
      删除
    </el-button>
    <el-button size="small" type="text" @click="viewDetail(scope.row)">
      详情
    </el-button>
  </template>
</el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredRecords.length"
        :page-size="maintenancePageSize"
        v-model:current-page="maintenanceCurrentPage"
        class="pagination"
      />
    </div>

    <!-- 新增故障对话框 -->
    <el-dialog v-model="showFaultDialog" title="新增故障" width="480">
      <el-form :model="faultForm" label-width="100">
        <el-form-item label="设备">
          <el-select v-model="faultForm.equipment_id" placeholder="请选择">
            <el-option
              v-for="e in equipmentList"
              :key="e.equipment_id"
              :label="e.equipment_name"
              :value="e.equipment_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="故障代码">
          <el-input v-model="faultForm.fault_code" />
        </el-form-item>
        <el-form-item label="故障描述">
          <el-input v-model="faultForm.fault_description" type="textarea" rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFaultDialog = false">取消</el-button>
        <el-button type="danger" @click="submitFault">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增维修对话框 -->
    <el-dialog v-model="showAddDialog" title="新增维修记录" width="520">
      <el-form :model="form" label-width="100">
        <el-form-item label="设备">
          <el-select v-model="form.equipment_id" placeholder="请选择">
            <el-option
              v-for="e in equipmentList"
              :key="e.equipment_id"
              :label="e.equipment_name"
              :value="e.equipment_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联故障">
          <el-select v-model="form.fault_id" clearable placeholder="不关联则留空">
            <el-option
              v-for="f in faults.filter(f => !f.is_resolved)"
              :key="f.fault_id"
              :label="`${f.fault_code} - ${f.fault_description}`"
              :value="f.fault_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="故障代码">
          <el-input v-model="form.fault_code" placeholder="如 F-001" />
        </el-form-item>
        <el-form-item label="故障描述">
          <el-input v-model="form.fault_description" type="textarea" rows="2" />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="form.maintenance_type" placeholder="请选择">
            <el-option label="故障维修" value="故障维修" />
            <el-option label="预防性维护" value="预防性维护" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修措施">
          <el-input v-model="form.maintenance_measures" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 维修详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="维修详情" width="520">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="维修ID">{{ detail.maintenance_id }}</el-descriptions-item>
        <el-descriptions-item label="设备">{{ detail.equipment_name }}</el-descriptions-item>
        <el-descriptions-item label="故障代码">{{ detail.fault_code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="故障描述">{{ detail.fault_description }}</el-descriptions-item>
        <el-descriptions-item label="维修类型">{{ detail.maintenance_type }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ formatTime(detail.maintenance_time) }}</el-descriptions-item>
        <el-descriptions-item label="措施">{{ detail.maintenance_measures }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { faultAPI }       from '../api/fault'
import { maintenanceAPI } from '../api/maintenance'

/* ---------------- 分页 & 数据 ---------------- */
const faultPageSize = 5
const faultCurrentPage = ref(1)
const maintenancePageSize = 5
const maintenanceCurrentPage = ref(1)

const faults     = ref([])
const records    = ref([])
const equipmentList = ref([])

const keyword = ref('')
const showFaultDialog = ref(false)
const showAddDialog   = ref(false)
const showDetailDialog= ref(false)

/* ---------------- 表单 & 编辑标识 ---------------- */
const faultForm = ref({
  equipment_id: '',
  fault_code: '',
  fault_description: '',
  fault_time: new Date().toISOString()
})
const editingFault = ref(null)   // 正在编辑的故障对象

const form = ref({
  equipment_id: '',
  fault_id: '',
  fault_code: '',
  fault_description: '',
  maintenance_type: '',
  maintenance_measures: ''
})
const editingMaintenance = ref(null) // 正在编辑的维修对象

const detail = ref({})

/* ---------------- 计算属性 ---------------- */
const stats = computed(() => {
  const total    = faults.value.length
  const resolved = faults.value.filter(f => f.is_resolved).length
  return { total, resolved, pending: total - resolved }
})

const filteredRecords = computed(() =>
  records.value.filter(r =>
    r.equipment_name?.includes(keyword.value) ||
    r.fault_code?.includes(keyword.value) ||
    r.fault_description?.includes(keyword.value) ||
    r.maintenance_measures?.includes(keyword.value)
  )
)

const pagedFaults = computed(() => {
  const start = (faultCurrentPage.value - 1) * faultPageSize
  return faults.value.slice(start, start + faultPageSize)
})

const pagedRecords = computed(() => {
  const start = (maintenanceCurrentPage.value - 1) * maintenancePageSize
  return filteredRecords.value.slice(start, start + maintenancePageSize)
})

/* ---------------- 接口调用 ---------------- */
const fetchData = async () => {
  try {
    equipmentList.value = [
      { equipment_id: 1, equipment_name: '注塑机1号' },
      { equipment_id: 2, equipment_name: '喷漆机1号' },
      { equipment_id: 3, equipment_name: '丝印机1号' },
      { equipment_id: 4, equipment_name: '烫金机1号' }
    ]

    const { data: faultRes = [] } = await faultAPI.getFaultRecords()
    faults.value = faultRes

    const { data: recordRes = [] } = await maintenanceAPI.getMaintenanceList()
    records.value = recordRes
  } catch (e) {
    ElMessage.error('拉取数据失败')
  }
}

/* ---------------- 故障操作 ---------------- */
const submitFault = async () => {
  if (!faultForm.value.equipment_id) return ElMessage.warning('请选择设备')
  try {
    const payload = {
      ...faultForm.value,
      fault_time: new Date().toISOString()
    }
    if (editingFault.value) {
      // 编辑
      await faultAPI.selectFault({ ...payload, fault_id: editingFault.value.fault_id })
      ElMessage.success('故障已更新')
    } else {
      // 新增
      await faultAPI.selectFault(payload)
      ElMessage.success('已新增故障')
    }
    closeFaultDialog()
    await fetchData()
  } catch (e) {
    ElMessage.error(editingFault.value ? '更新故障失败' : '新增故障失败')
  }
}

const editFault = (row) => {
  editingFault.value = row
  faultForm.value = { ...row }
  showFaultDialog.value = true
}

const deleteFault = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该故障记录吗？', '提示', { type: 'warning' })
    await faultAPI.deleteFault(row.fault_id)
    ElMessage.success('故障已删除')
    await fetchData()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除故障失败')
  }
}

const closeFaultDialog = () => {
  showFaultDialog.value = false
  editingFault.value = null
  faultForm.value = { equipment_id: '', fault_code: '', fault_description: '', fault_time: new Date().toISOString() }
}

/* ---------------- 维修操作 ---------------- */
const submitAdd = async () => {
  if (!form.value.equipment_id) return ElMessage.warning('请选择设备')
  try {
    const payload = {
      ...form.value,
      maintenance_time: new Date().toISOString()
    }
    if (editingMaintenance.value) {
      await maintenanceAPI.updateMaintenance({ ...payload, maintenance_id: editingMaintenance.value.maintenance_id })
      ElMessage.success('维修记录已更新')
    } else {
      await maintenanceAPI.createMaintenance(payload)
      ElMessage.success('已新增维修记录')
    }
    closeAddDialog()
    await fetchData()
  } catch (e) {
    ElMessage.error(editingMaintenance.value ? '更新维修失败' : '新增维修失败')
  }
}

const editMaintenance = (row) => {
  editingMaintenance.value = row
  form.value = { ...row }
  showAddDialog.value = true
}

const deleteMaintenance = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该维修记录吗？', '提示', { type: 'warning' })
    await maintenanceAPI.deleteMaintenance(row.maintenance_id)
    ElMessage.success('维修记录已删除')
    await fetchData()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除维修失败')
  }
}

const closeAddDialog = () => {
  showAddDialog.value = false
  editingMaintenance.value = null
  form.value = {
    equipment_id: '',
    fault_id: '',
    fault_code: '',
    fault_description: '',
    maintenance_type: '',
    maintenance_measures: ''
  }
}

/* ---------------- 故障状态切换 ---------------- */
const toggleResolve = async (row) => {
  try {
    await faultAPI.selectFault({
      fault_id: row.fault_id,
      is_resolved: !row.is_resolved
    })
    ElMessage.success(row.is_resolved ? '已重新打开' : '已标记解决')
    await fetchData()
  } catch (e) {
    ElMessage.error('状态更新失败')
  }
}

/* ---------------- 维修详情 ---------------- */
const viewDetail = async (row) => {
  try {
    const { data } = await maintenanceAPI.selectMaintenance(row.maintenance_id)
    detail.value = data
    showDetailDialog.value = true
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

/* ---------------- 工具函数 ---------------- */
const refreshData = () => fetchData()
const formatTime  = t => new Date(t).toLocaleString('zh-CN')
const exportReport = () => ElMessage.info('导出功能开发中')

onMounted(fetchData)
</script>

<style scoped>
.maintenance-page {
  padding: 20px;
  background: #0f0f0f;
  min-height: 100vh;
  color: #fff;
  animation: fadeInUp 0.6s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;
}
.page-header h1 { margin: 0; font-size: 24px; color: #fff; }
.header-actions { display: flex; gap: 10px; }

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  background: linear-gradient(135deg, #1a1a1a, #262626);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
}
.stat-card:hover { transform: translateY(-5px); border-color: #409eff; }
.stat-icon {
  width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px;
}
.stat-icon.total { background: rgba(245, 108, 108, 0.2); color: #f56c6c; }
.stat-icon.pending { background: rgba(230, 162, 60, 0.2); color: #e6a23c; }
.stat-icon.completed { background: rgba(103, 194, 58, 0.2); color: #67c23a; }
.stat-content { flex: 1; }
.stat-value { font-size: 24px; font-weight: 600; color: #fff; }
.stat-label { font-size: 14px; color: #888; }

.section {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
}
.section h3 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #fff;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

:deep(.el-dialog) {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  color: #fff;
}
:deep(.el-dialog__header) { border-bottom: 1px solid #333; }
:deep(.el-dialog__title) { color: #fff; }
:deep(.el-descriptions__label) { color: #888; }
:deep(.el-descriptions__content) { color: #fff; }
</style>