<template>
  <div class="warehouse">
    <div class="page-header">
      <h2>仓库管理</h2>
      <p>管理系统内所有仓库信息及库存状态</p>
    </div>

    <!-- 查询栏 -->
    <el-card class="filter-card">
      <el-row :gutter="16" class="filter-row">
        <el-col :xs="24" :sm="16" :md="12">
          <el-input v-model="queryParams.keyword" placeholder="输入仓库名称/地址" clearable class="full-width"
                    @keyup.enter="handleSearch">
            <template #prefix><el-icon>
              <Search />
            </el-icon></template>
          </el-input>
        </el-col>

        <el-col :xs="24" :sm="8" :md="6">
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

        <el-col :xs="24" :sm="24" :md="6" class="text-right">
          <el-button type="success" @click="openAddDialog">
            <el-icon>
              <Plus />
            </el-icon>新增仓库
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 仓库列表 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe class="warehouse-table">
        <el-table-column prop="warehouse_name" label="仓库名称" width="180" />
        <el-table-column prop="warehouse_address" label="仓库地址" width="200" />
        <el-table-column label="容量/库存" width="140">
          <template #default="{ row }">
            <div class="capacity-bar">
              <el-progress
                  :percentage="calculateCapacityPercentage(row)"
                  :status="getCapacityStatus(row)"
                  :show-text="false"
                  :stroke-width="12"
              />
              <div class="capacity-info">
                <span>{{ row.current_inventory_volume.toFixed(2) }}</span>
                <span>/</span>
                <span>{{ row.warehouse_capacity.toFixed(2) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getInventoryStatusTag(row)" size="small">
              {{ getInventoryStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="min_inventory_alert" label="警戒线" width="100" />
        <el-table-column prop="person_in_charge" label="负责人" width="120" />
        <el-table-column label="操作" min-width="220">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
              <el-button size="small" type="primary" @click="openDetailDialog(row)">详情</el-button>
              <el-button size="small" type="success" @click="openInboundDialog(row)">入库</el-button>
              <el-button size="small" type="warning" @click="openOutboundDialog(row)">出库</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.page_size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑仓库弹窗 -->
    <el-dialog :title="warehouseDialogTitle" v-model="warehouseDialogVisible" width="700px" :close-on-click-modal="false">
      <el-form :model="warehouseForm" :rules="warehouseRules" ref="warehouseFormRef" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="仓库名称" prop="warehouse_name">
              <el-input v-model="warehouseForm.warehouse_name" placeholder="请输入仓库名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="person_in_charge">
              <el-input v-model="warehouseForm.person_in_charge" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="仓库地址" prop="warehouse_address">
          <el-input v-model="warehouseForm.warehouse_address" placeholder="请输入仓库详细地址" />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="仓库容量" prop="warehouse_capacity">
              <el-input-number
                  v-model="warehouseForm.warehouse_capacity"
                  :min="1"
                  :step="0.1"
                  :precision="2"
                  controls-position="right"
                  placeholder="请输入仓库容量"
                  class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="警戒线" prop="min_inventory_alert">
              <el-input-number
                  v-model="warehouseForm.min_inventory_alert"
                  :min="0"
                  controls-position="right"
                  placeholder="请输入库存警戒线"
                  class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="当前库存" prop="current_inventory_volume" v-if="warehouseForm.warehouse_id">
          <el-input-number
              v-model="warehouseForm.current_inventory_volume"
              :min="0"
              :step="0.1"
              :precision="2"
              controls-position="right"
              disabled
              class="full-width"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="warehouseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitWarehouseForm" :loading="submitLoading">
          {{ warehouseForm.warehouse_id ? '更新' : '新增' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 仓库详情弹窗 -->
    <el-dialog title="仓库详情" v-model="detailDialogVisible" width="900px" :close-on-click-modal="false">
      <div class="detail-container">
        <div class="detail-header">
          <h3>{{ currentWarehouse?.warehouse_name }}</h3>
          <div class="detail-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="仓库地址">{{ currentWarehouse?.warehouse_address }}</el-descriptions-item>
              <el-descriptions-item label="负责人">{{ currentWarehouse?.person_in_charge }}</el-descriptions-item>
              <el-descriptions-item label="仓库容量">{{ currentWarehouse?.warehouse_capacity?.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="当前库存">{{ currentWarehouse?.current_inventory_volume?.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="警戒线">{{ currentWarehouse?.min_inventory_alert }}</el-descriptions-item>
              <el-descriptions-item label="库存状态">
                <el-tag :type="getInventoryStatusTag(currentWarehouse)" size="small">
                  {{ getInventoryStatus(currentWarehouse) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <div class="inventory-list">
          <h4>库存产品</h4>
          <!-- 修改后的库存产品表格 -->
          <el-table :data="inventoryData" v-loading="detailLoading" stripe height="300">
            <el-table-column prop="product_name" label="产品名称" width="180" />
            <el-table-column prop="inventory_quantity" label="库存数量" width="120" />
            <el-table-column label="最后入库时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.last_inbound_time) }}
              </template>
            </el-table-column>
            <el-table-column label="最后出库时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.last_outbound_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="warehouse_name" label="所在仓库" width="150" />
          </el-table>

          <!-- 空数据提示 -->
          <el-empty
              v-if="!detailLoading && inventoryData.length === 0"
              description="暂无库存数据"
              style="margin-top: 20px;"
          />

          <div class="pagination-wrapper">
            <el-pagination
                v-model:current-page="detailPagination.page"
                v-model:page-size="detailPagination.page_size"
                :page-sizes="[5, 10, 20]"
                :total="detailPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleDetailSizeChange"
                @current-change="handleDetailCurrentChange"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 出入库操作弹窗 -->
    <el-dialog :title="operationDialogTitle" v-model="operationDialogVisible" width="500px" :close-on-click-modal="false">
      <el-form :model="operationForm" :rules="operationRules" ref="operationFormRef" label-width="100px">
        <el-form-item label="仓库名称">
          <el-input v-model="operationForm.warehouse_name" disabled />
        </el-form-item>
        <el-form-item label="产品名称" prop="product_name">
          <el-input v-model="operationForm.product_name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item :label="operationType === 'inbound' ? '入库数量' : '出库数量'" prop="quantity">
          <el-input-number
              v-model="operationForm.quantity"
              :min="0.1"
              :step="0.1"
              :precision="2"
              controls-position="right"
              :placeholder="operationType === 'inbound' ? '请输入入库数量' : '请输入出库数量'"
              class="full-width"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="operationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOperationForm" :loading="operationLoading">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus
} from '@element-plus/icons-vue'
import { warehouseAPI } from '@/api/warehouse'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const operationLoading = ref(false)
const detailLoading = ref(false)
const tableData = ref([])
const inventoryData = ref([])

const queryParams = reactive({
  keyword: ''
})
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const detailPagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const warehouseDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const operationDialogVisible = ref(false)
const warehouseForm = ref({})
const operationForm = ref({})
const currentWarehouse = ref(null)
const operationType = ref('inbound') // 'inbound' 或 'outbound'
const warehouseFormRef = ref()
const operationFormRef = ref()

// 表单验证规则
const warehouseRules = reactive({
  warehouse_name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' },
    { min: 1, max: 255, message: '长度在1-255个字符之间', trigger: 'blur' }
  ],
  warehouse_address: [
    { required: true, message: '请输入仓库地址', trigger: 'blur' },
    { min: 1, max: 255, message: '长度在1-255个字符之间', trigger: 'blur' }
  ],
  warehouse_capacity: [
    { required: true, message: '请输入仓库容量', trigger: 'blur' },
    { type: 'number', min: 0.1, message: '容量必须大于0', trigger: 'blur' }
  ],
  min_inventory_alert: [
    { required: true, message: '请输入库存警戒线', trigger: 'blur' },
    { type: 'number', min: 0, message: '警戒线不能为负数', trigger: 'blur' }
  ],
  person_in_charge: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' },
    { min: 1, max: 255, message: '长度在1-255个字符之间', trigger: 'blur' }
  ]
})

const operationRules = reactive({
  product_name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 0.1, message: '数量必须大于0', trigger: 'blur' }
  ]
})

// 计算属性
const warehouseDialogTitle = computed(() =>
    warehouseForm.value.warehouse_id ? '编辑仓库' : '新增仓库'
)

const operationDialogTitle = computed(() =>
    operationType.value === 'inbound' ? '产品入库' : '产品出库'
)

// 计算容量百分比
const calculateCapacityPercentage = (row) => {
  if (!row || !row.warehouse_capacity || row.warehouse_capacity <= 0) return 0
  return Math.min(100, Math.round((row.current_inventory_volume / row.warehouse_capacity) * 100))
}

// 获取容量状态
const getCapacityStatus = (row) => {
  const percentage = calculateCapacityPercentage(row)
  if (percentage >= 90) return 'exception'
  if (percentage >= 75) return 'warning'
  return 'success'
}

// 获取库存状态标签类型
const getInventoryStatusTag = (row) => {
  if (!row) return 'info'
  if (row.current_inventory_volume >= row.warehouse_capacity) return 'danger'
  if (row.current_inventory_volume <= row.min_inventory_alert) return 'warning'
  return 'success'
}

// 获取库存状态文本
const getInventoryStatus = (row) => {
  if (!row) return '-'
  if (row.current_inventory_volume >= row.warehouse_capacity) return '已满'
  if (row.current_inventory_volume <= row.min_inventory_alert) return '警戒'
  return '正常'
}

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 获取仓库列表
const fetchWarehouseList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    let response
    if (queryParams.keyword) {
      response = await warehouseAPI.searchWarehouse(
          queryParams.keyword,
          pagination.page,
          pagination.page_size
      )
    } else {
      response = await warehouseAPI.getWarehouseList(
          pagination.page,
          pagination.page_size
      )
    }

    if (response.code === 200) {
      // 添加类型转换 - 关键修复
      tableData.value = (response.data.warehouses || []).map(warehouse => ({
        ...warehouse,
        warehouse_capacity: parseFloat(warehouse.warehouse_capacity),
        current_inventory_volume: parseFloat(warehouse.current_inventory_volume),
        min_inventory_alert: parseFloat(warehouse.min_inventory_alert)
      }))

      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error(response.msg || '获取仓库列表失败')
    }
  } catch (e) {
    console.error('获取仓库列表失败:', e)
    ElMessage.error('获取仓库列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索功能/重置
const handleSearch = () => {
  pagination.page = 1
  fetchWarehouseList()
}

const handleReset = () => {
  queryParams.keyword = ''
  handleSearch()
}

// 分页
const handleSizeChange = (size) => {
  pagination.page_size = size
  pagination.page = 1
  fetchWarehouseList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  fetchWarehouseList()
}

// 仓库详情分页
const handleDetailSizeChange = (size) => {
  detailPagination.page_size = size
  detailPagination.page = 1
  fetchWarehouseDetail()
}

const handleDetailCurrentChange = (page) => {
  detailPagination.page = page
  fetchWarehouseDetail()
}

// 打开新增仓库弹窗
const openAddDialog = () => {
  warehouseForm.value = {
    warehouse_name: '',
    warehouse_address: '',
    warehouse_capacity: 1000,
    min_inventory_alert: 100,
    person_in_charge: '',
    current_inventory_volume: 0
  }
  warehouseDialogVisible.value = true
}

// 打开编辑仓库弹窗
const openEditDialog = async (row) => {
  try {
    loading.value = true
    const res = await warehouseAPI.getWarehouseById(row.warehouse_id)
    if (res.code === 200) {
      warehouseForm.value = {
        ...res.data,
        warehouse_capacity: parseFloat(res.data.warehouse_capacity),
        current_inventory_volume: parseFloat(res.data.current_inventory_volume)
      }
      warehouseDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取仓库信息失败')
    }
  } catch (error) {
    console.error('获取仓库信息失败:', error)
    ElMessage.error('获取仓库信息失败')
  } finally {
    loading.value = false
  }
}

// 提交仓库表单
const submitWarehouseForm = async () => {
  try {
    await warehouseFormRef.value?.validate()

    submitLoading.value = true

    const payload = JSON.parse(JSON.stringify(warehouseForm.value))

    // 根据是否有ID决定是更新还是新增
    const api = payload.warehouse_id
        ? warehouseAPI.updateWarehouse
        : warehouseAPI.addWarehouse

    const res = await api(payload)

    if (res.code === 200) {
      ElMessage.success(res.msg || '操作成功')
      warehouseDialogVisible.value = false
      fetchWarehouseList()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error('操作失败，请检查输入信息')
    }
  } finally {
    submitLoading.value = false
  }
}

// 删除仓库
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除仓库"${row.warehouse_name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await warehouseAPI.deleteWarehouse(row.warehouse_id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchWarehouseList()
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

// 打开仓库详情弹窗
const openDetailDialog = async (row) => {
  currentWarehouse.value = row
  detailDialogVisible.value = true
  // 重置详情分页
  detailPagination.page = 1
  detailPagination.page_size = 10
  fetchWarehouseDetail()
}

// 获取仓库详情 - 关键修复
const fetchWarehouseDetail = async () => {
  if (!currentWarehouse.value) return;

  detailLoading.value = true;
  try {
    const res = await warehouseAPI.getWarehouseDetail(
        currentWarehouse.value.warehouse_id,
        detailPagination.page,
        detailPagination.page_size
    );

    if (res.code === 200) {
      // 使用正确的数据结构
      inventoryData.value = res.data.warehouse_detail || [];

      // 设置分页信息
      if (res.data.pagination) {
        detailPagination.total = res.data.pagination.total || 0;
      } else {
        detailPagination.total = res.data.warehouse_detail?.length || 0;
      }
    } else {
      ElMessage.error(res.msg || '获取仓库详情失败');
    }
  } catch (error) {
    console.error('获取仓库详情失败:', error);
    ElMessage.error('获取仓库详情失败');
  } finally {
    detailLoading.value = false;
  }
};

// 打开入库对话框
const openInboundDialog = (row) => {
  operationType.value = 'inbound'
  operationForm.value = {
    warehouse_name: row.warehouse_name,
    product_name: '',
    quantity: 0
  }
  operationDialogVisible.value = true
}

// 打开出库对话框
const openOutboundDialog = (row) => {
  operationType.value = 'outbound'
  operationForm.value = {
    warehouse_name: row.warehouse_name,
    product_name: '',
    quantity: 0
  }
  operationDialogVisible.value = true
}

// 提交出入库操作
const submitOperationForm = async () => {
  try {
    await operationFormRef.value?.validate()

    operationLoading.value = true

    const api = operationType.value === 'inbound'
        ? warehouseAPI.productInbound
        : warehouseAPI.productOutbound

    const res = await api(
        operationForm.value.warehouse_name,
        operationForm.value.product_name,
        operationForm.value.quantity
    )

    if (res.code === 200) {
      ElMessage.success(res.msg || '操作成功')
      operationDialogVisible.value = false

      // 刷新仓库列表
      fetchWarehouseList()

      // 如果详情弹窗打开，刷新详情
      if (detailDialogVisible.value) {
        fetchWarehouseDetail()
      }
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败，请检查输入信息')
    }
  } finally {
    operationLoading.value = false
  }
}

onMounted(() => {
  fetchWarehouseList()
})
</script>

<style scoped>
.warehouse {
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

.warehouse-table {
  background: transparent;
}

.capacity-bar {
  position: relative;
  height: 20px;
}

.capacity-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.capacity-info span:first-child {
  color: #67C23A;
}

.capacity-info span:last-child {
  color: #909399;
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

.detail-container {
  padding: 10px;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-header h3 {
  color: #ffffff;
  margin-bottom: 15px;
}

.inventory-list {
  margin-top: 25px;
}

.inventory-list h4 {
  color: #ffffff;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .warehouse {
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

:deep(.el-input__inner::placeholder) {
  color: #888;
}

:deep(.el-select .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
}

:deep(.el-descriptions__body) {
  background-color: rgba(38, 38, 38, 0.9);
  color: #ffffff;
}

:deep(.el-descriptions__label) {
  color: #888;
}

:deep(.el-descriptions__content) {
  color: #ffffff;
}

:deep(.el-empty__description) {
  color: #888;
}
</style>