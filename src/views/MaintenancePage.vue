<template>
  <div class="maintenance-page">
    <!-- 页面头部  -->
    <div class="page-header">
      <h1>设备维修 & 故障管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
        <el-button type="success" @click="showAddDialog = true; editingMaintenance = null">
          <el-icon><Plus /></el-icon> 新增维修
        </el-button>
        <el-button type="warning" @click="showExportDialog = true">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </div>
    </div>

    <!-- 统计卡片  -->
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

    <!-- 故障列表  -->
    <div class="section">
      <h3>故障列表</h3>
      <el-table :data="pagedFaults" stripe style="width: 100%; margin-bottom: 10px">
        <el-table-column prop="fault_id" label="故障ID" width="90" />
        <el-table-column prop="equipment_name" label="设备" width="140" />
        <el-table-column prop="fault_code" label="故障代码" width="120" />
        <el-table-column prop="fault_description" label="故障描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="fault_time" label="发生时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.fault_time) }}</template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.updated_at) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_resolved ? 'success' : 'danger'">
              {{ scope.row.is_resolved ? '已解决' : '待解决' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 故障列表操作列  -->
        <el-table-column label="操作" width="230">
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

    <!-- 维修记录  -->
    <div class="section">
      <h3>维修记录</h3>
      <el-table :data="pagedRecords" stripe style="width: 100%">
        <el-table-column prop="maintenance_id" label="维修ID" width="90" />
        <el-table-column prop="equipment_name" label="设备名称" width="140" />
        <el-table-column prop="equipment_id" label="设备ID" width="120" />
        <el-table-column prop="fault_id" label="关联故障ID" width="120">
          <template #default="scope">{{ scope.row.fault_id || '-' }}</template>
        </el-table-column>
        <el-table-column prop="maintenance_type" label="维修类型" width="120" />
        <el-table-column prop="maintenance_status" label="维修状态" width="90" />
        <el-table-column prop="maintenance_time" label="维修时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.maintenance_time) }}</template>
        </el-table-column>
        <el-table-column prop="maintenance_measures" label="措施" min-width="180" show-overflow-tooltip />
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="scope">{{ formatTime(scope.row.updated_at) }}</template>
        </el-table-column>
        <!-- 维修记录操作列  -->
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="text" @click="editMaintenance(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="text" @click="deleteMaintenance(scope.row)">
              删除
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

    <!-- 新增/编辑维修对话框  -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingMaintenance ? '编辑维修记录' : '新增维修记录'" 
      width="520"
      @close="handleDialogClose"
    >
      <el-form :model="form" label-width="100">
        <el-form-item label="设备" prop="equipment_name" :rules="{ required: true, message: '请输入设备名称', trigger: 'blur' }">
          <el-input v-model="form.equipment_name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="关联故障时间">
          <el-date-picker v-model="form.fault_time" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择关联故障时间" />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="form.maintenance_type" placeholder="请选择">
            <el-option label="故障维修" value="故障维修" />
            <el-option label="预防性维护" value="预防性维护" />
            <el-option label="例行检查" value="例行检查" />
            <el-option label="应急抢修" value="应急抢修" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修状态" v-if="editingMaintenance">
          <el-select v-model="form.maintenance_status" placeholder="请选择">
            <el-option label="已完成" value="已完成" />
            <el-option label="未完成" value="未完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修时间">
          <el-date-picker v-model="form.maintenance_time" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择维修时间" />
        </el-form-item>
        <el-form-item label="维修措施">
          <el-input v-model="form.maintenance_measures" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑故障描述对话框  -->
    <el-dialog v-model="showEditFaultDialog" title="编辑故障描述" width="400">
      <el-form :model="faultForm" label-width="80">
        <el-form-item label="故障ID">
          <el-input v-model="faultForm.fault_id" disabled />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="faultForm.fault_description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeEditFaultDialog">取消</el-button>
        <el-button type="primary" @click="submitEditFault">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导出配置对话框 -->
    <el-dialog 
      v-model="showExportDialog" 
      title="导出Excel数据" 
      width="400"
    >
      <el-form :model="exportForm" label-width="100">
        <el-form-item label="导出类型" prop="exportType" :rules="{ required: true, message: '请选择导出类型', trigger: 'change' }">
          <el-select v-model="exportForm.exportType" placeholder="请选择">
            <el-option label="故障列表" value="faults" />
            <el-option label="维修记录" value="maintenances" />
            <el-option label="全部数据" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item label="导出范围" prop="exportRange" :rules="{ required: true, message: '请选择导出范围', trigger: 'change' }">
          <el-select v-model="exportForm.exportRange" placeholder="请选择">
            <el-option label="当前页" value="currentPage" />
            <el-option label="全部数据" value="allData" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleExport">确定导出</el-button>
      </template>
    </el-dialog>

    <!-- 导出加载提示 -->
    <el-loading v-if="isExporting" target=".maintenance-page" text="正在导出数据，请稍候..."/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Refresh, Plus, Download, Warning, Clock, CircleCheck } from '@element-plus/icons-vue'
import { faultAPI } from '../api/fault'
import { maintenanceAPI } from '../api/maintenance'
// 引入Excel处理库
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

/* ---------------- 分页 & 数据 ---------------- */
const faultPageSize = 5
const faultCurrentPage = ref(1)
const maintenancePageSize = 5
const maintenanceCurrentPage = ref(1)

const faults = ref([])
const records = ref([])

const showAddDialog = ref(false)
const showEditFaultDialog = ref(false)
const showExportDialog = ref(false)
const isExporting = ref(false)

/* ---------------- 导出表单配置 ---------------- */
const exportForm = ref({
  exportType: 'all',       // faults, maintenances, all
  exportRange: 'allData'   // currentPage, allData
})

/* ---------------- 表单 & 编辑标识 ---------------- */
const form = ref({
  maintenance_id: null,
  equipment_name: '',
  fault_id: null,
  fault_time: null,
  maintenance_type: '',
  maintenance_status: '',
  maintenance_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
  maintenance_measures: ''
})
const editingMaintenance = ref(null)

const faultForm = ref({
  fault_id: '',
  fault_description: ''
})
const editingFault = ref(null)

/* ---------------- 计算属性 ---------------- */
const stats = computed(() => {
  const total = faults.value.length
  const resolved = faults.value.filter(f => f.is_resolved).length
  return { total, resolved, pending: total - resolved }
})

const pagedFaults = computed(() => {
  const start = (faultCurrentPage.value - 1) * faultPageSize
  return faults.value.slice(start, start + faultPageSize)
})

const pagedRecords = computed(() => {
  if (!records.value) return []
  const start = (maintenanceCurrentPage.value - 1) * maintenancePageSize
  return records.value.slice(start, start + maintenancePageSize)
})

const filteredRecords = computed(() => {
  if (!records.value) return []
  return records.value
})

/* ---------------- 接口调用 ---------------- */
const fetchData = async () => {
  try {
    const { data: faultData } = await faultAPI.getFaultRecords({
      page: faultCurrentPage.value,
      page_size: faultPageSize
    })
    faults.value = faultData.Maintenances || []

    const { data: maintenanceData } = await maintenanceAPI.getMaintenanceList({
      page: maintenanceCurrentPage.value,
      page_size: maintenancePageSize
    })
    records.value = maintenanceData.Maintenances || []
  } catch (e) {
    ElMessage.error('拉取数据失败')
  }
}

/* ---------------- 维修操作 ---------------- */
const submitAdd = async () => {
  if (!form.value.equipment_name || !form.value.maintenance_type || !form.value.maintenance_time || !form.value.maintenance_measures) {
    return ElMessage.warning('请填写所有必填项')
  }
  try {
    const payload = {
      equipment_name: form.value.equipment_name,
      fault_time: form.value.fault_time,
      maintenance_type: form.value.maintenance_type,
      maintenance_time: form.value.maintenance_time,
      maintenance_measures: form.value.maintenance_measures
    }

    if (editingMaintenance.value) {
      payload.maintenance_id = form.value.maintenance_id
      payload.fault_id = form.value.fault_id
      payload.maintenance_status = form.value.maintenance_status
      await maintenanceAPI.updateMaintenance(payload)
      ElMessage.success('维修记录已更新')
    } else {
      await maintenanceAPI.createMaintenance(payload)
      ElMessage.success('已新增维修记录')
    }
    handleDialogClose()
    await fetchData()
  } catch (e) {
    console.error('Error submitting maintenance:', e)
    ElMessage.error(editingMaintenance.value ? '更新维修失败' : '新增维修失败')
  }
}

const editMaintenance = (row) => {
  editingMaintenance.value = row
  form.value = {
    maintenance_id: row.maintenance_id,
    equipment_name: row.equipment_name,
    fault_id: row.fault_id,
    fault_time: row.fault_time ? formatTimeForInput(row.fault_time) : null,
    maintenance_type: row.maintenance_type,
    maintenance_status: row.maintenance_status,
    maintenance_time: row.maintenance_time ? formatTimeForInput(row.maintenance_time) : null,
    maintenance_measures: row.maintenance_measures
  }
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

const handleDialogClose = () => {
  showAddDialog.value = false
  editingMaintenance.value = null
  form.value = {
    maintenance_id: null,
    equipment_name: '',
    fault_id: null,
    fault_time: null,
    maintenance_type: '',
    maintenance_status: '',
    maintenance_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    maintenance_measures: ''
  }
}

/* ---------------- 故障操作 ---------------- */
const editFault = (row) => {
  editingFault.value = row
  faultForm.value = {
    fault_id: row.fault_id,
    fault_description: row.fault_description
  }
  showEditFaultDialog.value = true
}

const submitEditFault = async () => {
  if (!faultForm.value.fault_description) {
    return ElMessage.warning('故障描述不能为空')
  }
  try {
    await faultAPI.updateFaultDescription(faultForm.value.fault_id, faultForm.value.fault_description)
    ElMessage.success('故障描述已更新')
    closeEditFaultDialog()
    await fetchData()
  } catch (e) {
    console.error('Error updating fault description:', e)
    ElMessage.error('更新故障描述失败')
  }
}

const deleteFault = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该故障记录吗？', '提示', { type: 'warning' })
    await faultAPI.deleteFault(row.fault_id)
    ElMessage.success('故障记录已删除')
    await fetchData()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除故障失败')
  }
}

const toggleResolve = async (row) => {
  try {
    const newStatus = !row.is_resolved
    await faultAPI.updateFaultStatus(row.fault_id, newStatus)
    ElMessage.success(`故障已${newStatus ? '标记解决' : '重新打开'}`)
    await fetchData()
  } catch (e) {
    console.error('Error toggling fault status:', e)
    ElMessage.error('更新故障状态失败')
  }
}

const closeEditFaultDialog = () => {
  showEditFaultDialog.value = false
  editingFault.value = null
  faultForm.value = {
    fault_id: '',
    fault_description: ''
  }
}

/* ---------------- 导出功能实现 ---------------- */
const handleExport = async () => {
  isExporting.value = true
  try {
    // 根据选择获取需要导出的数据
    let exportData = {}
    
    if (exportForm.value.exportType === 'faults' || exportForm.value.exportType === 'all') {
      // 获取故障数据
      const faultData = exportForm.value.exportRange === 'allData' 
        ? await fetchAllFaults() 
        : [...pagedFaults.value]
      
      // 格式化故障数据
      const formattedFaults = faultData.map(fault => ({
        '故障ID': fault.fault_id,
        '设备': fault.equipment_name,
        '故障代码': fault.fault_code,
        '故障描述': fault.fault_description,
        '发生时间': formatTime(fault.fault_time),
        '采集时间': formatTime(fault.collection_time),
        '更新时间': formatTime(fault.updated_at),
        '状态': fault.is_resolved ? '已解决' : '待解决'
      }))
      
      exportData['故障列表'] = formattedFaults
    }
    
    if (exportForm.value.exportType === 'maintenances' || exportForm.value.exportType === 'all') {
      // 获取维修记录数据
      const maintenanceData = exportForm.value.exportRange === 'allData'
        ? await fetchAllMaintenances()
        : [...pagedRecords.value]
      
      // 格式化维修记录数据
      const formattedMaintenances = maintenanceData.map(record => ({
        '维修ID': record.maintenance_id,
        '设备名称': record.equipment_name,
        '设备ID': record.equipment_id,
        '关联故障ID': record.fault_id || '-',
        '维修类型': record.maintenance_type,
        '维修状态': record.maintenance_status,
        '维修时间': formatTime(record.maintenance_time),
        '措施': record.maintenance_measures,
        '更新时间': formatTime(record.updated_at)
      }))
      
      exportData['维修记录'] = formattedMaintenances
    }
    
    // 生成并下载Excel文件
    generateExcelFile(exportData)
    
    ElMessage.success('Excel数据导出成功')
    showExportDialog.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('数据导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

// 获取所有故障数据（分页加载）
const fetchAllFaults = async () => {
  let allFaults = []
  let currentPage = 1
  const pageSize = 100  // 每次请求100条
  
  while (true) {
    try {
      const { data } = await faultAPI.getFaultRecords({
        page: currentPage,
        page_size: pageSize
      })
      
      const pageData = data.Maintenances || []
      allFaults = [...allFaults, ...pageData]
      
      // 如果当前页数据小于pageSize，说明已经获取完所有数据
      if (pageData.length < pageSize) {
        break
      }
      
      currentPage++
    } catch (error) {
      console.error('获取故障数据失败:', error)
      throw new Error('获取故障数据失败')
    }
  }
  
  return allFaults
}

// 获取所有维修记录（分页加载）
const fetchAllMaintenances = async () => {
  let allMaintenances = []
  let currentPage = 1
  const pageSize = 100  // 每次请求100条
  
  while (true) {
    try {
      const { data } = await maintenanceAPI.getMaintenanceList({
        page: currentPage,
        page_size: pageSize
      })
      
      const pageData = data.Maintenances || []
      allMaintenances = [...allMaintenances, ...pageData]
      
      // 如果当前页数据小于pageSize，说明已经获取完所有数据
      if (pageData.length < pageSize) {
        break
      }
      
      currentPage++
    } catch (error) {
      console.error('获取维修记录失败:', error)
      throw new Error('获取维修记录失败')
    }
  }
  
  return allMaintenances
}

// 生成并下载Excel文件
const generateExcelFile = (data) => {
  // 创建工作簿
  const wb = XLSX.utils.book_new()
  
  // 为每个数据类型创建工作表
  Object.keys(data).forEach(sheetName => {
    const worksheet = XLSX.utils.json_to_sheet(data[sheetName])
    XLSX.utils.book_append_sheet(wb, worksheet, sheetName)
  })
  
  // 生成包含当前日期的文件名
  const fileName = `设备维修管理数据_${format(new Date(), 'yyyyMMddHHmmss')}.xlsx`
  
  // 导出Excel文件
  XLSX.writeFile(wb, fileName, { bookType: 'xlsx' })
}

/* ---------------- 工具函数 ---------------- */
const refreshData = () => fetchData()

const formatTime = t => {
  if (!t) return '-'
  try {
    if (typeof t === 'string' && t.includes(' ')) {
      return t
    }
    return new Date(t).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (e) {
    console.error("Invalid date format for display:", t, e)
    return t
  }
}

const formatTimeForInput = t => {
  if (!t) return null
  try {
    if (typeof t === 'string' && t.includes(' ')) {
      return t
    }
    const date = new Date(t)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (e) {
    console.error("Invalid date format for input:", t, e)
    return t
  }
}

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
