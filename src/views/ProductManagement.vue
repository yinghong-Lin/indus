<template>
  <div class="product">
    <div class="page-header">
      <h2>产品管理</h2>
    </div>

    <!-- 查询栏 -->
    <el-card class="filter-card">
      <el-row :gutter="16" class="filter-row">
        <el-col :xs="24" :sm="16" :md="12">
          <el-input v-model="queryParams.keyword" placeholder="输入产品名称" clearable class="full-width"
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
            </el-icon>新增产品
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 产品列表 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe class="equipment-table">
        <el-table-column prop="product_name" label="产品名称" width="180" />
        <el-table-column prop="product_type" label="产品类型" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ row.product_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product_status" label="产品状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.product_status)" size="small">
              {{ row.product_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product_category" label="产品分类" width="120" />
        <el-table-column prop="product_unit" label="单位" width="80" />
        <el-table-column prop="product_spec" label="规格" width="150" />
        <el-table-column label="生产日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.production_date) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
              <el-button
                  size="small"
                  :type="row.product_status === '在产' ? 'warning' : 'success'"
                  @click="updateProductStatus(row.product_id, row.product_status === '在产' ? '停产' : '在产')"
              >
                {{ row.product_status === '在产' ? '设为停产' : '设为在产' }}
              </el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px" :close-on-click-modal="false">
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="product_name">
              <el-input v-model="productForm.product_name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品类型" prop="product_type">
              <el-select v-model="productForm.product_type" placeholder="请选择产品类型" class="full-width">
                <el-option label="柱形外壳" value="圆柱外壳" />
                <el-option label="方形外壳" value="方形外壳" />
                <el-option label="异形外壳" value="异形外壳" />
                <el-option label="圆形外壳" value="圆形外壳" />
                <el-option label="锥形外壳" value="锥形外壳" />
                <el-option label="球形外壳" value="球形外壳" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品状态" prop="product_status">
              <el-select v-model="productForm.product_status" placeholder="请选择产品状态" class="full-width">
                <el-option label="在产" value="在产" />
                <el-option label="停产" value="停产" />
                <el-option label="试产" value="试产" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品分类" prop="product_category">
              <el-input v-model="productForm.product_category" placeholder="请输入产品分类" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品单位" prop="product_unit">
              <el-input v-model="productForm.product_unit" placeholder="请输入产品单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产日期" prop="production_date">
              <el-date-picker
                  v-model="productForm.production_date"
                  type="date"
                  placeholder="选择生产日期"
                  value-format="YYYY-MM-DD"
                  class="full-width" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="停产日期" prop="discontinuation_date">
              <el-date-picker
                  v-model="productForm.discontinuation_date"
                  type="date"
                  placeholder="选择停产日期"
                  value-format="YYYY-MM-DD"
                  class="full-width" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="产品规格" prop="product_spec">
          <el-input v-model="productForm.product_spec" placeholder="请输入产品规格" />
        </el-form-item>

        <el-form-item label="产品描述" prop="product_description">
          <el-input
              v-model="productForm.product_description"
              type="textarea"
              :rows="3"
              placeholder="请输入产品描述" />
        </el-form-item>

        <el-form-item label="备注" prop="product_remarks">
          <el-input
              v-model="productForm.product_remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProductForm" :loading="submitLoading">
          {{ productForm.product_id ? '更新' : '新增' }}
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
import { productAPI } from '@/api/product'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])

const queryParams = reactive({
  keyword: ''
})
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const dialogVisible = ref(false)
const productForm = ref({})
const productFormRef = ref()

// 表单验证规则
const productRules = reactive({
  product_name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 1, max: 255, message: '长度在1-255个字符之间', trigger: 'blur' }
  ],
  product_type: [
    { required: true, message: '请选择产品类型', trigger: 'change' }
  ],
  product_status: [
    { required: true, message: '请选择产品状态', trigger: 'change' }
  ],
  product_category: [
    { required: true, message: '请输入产品分类', trigger: 'blur' },
    { max: 255, message: '长度不超过255个字符', trigger: 'blur' }
  ],
  product_unit: [
    { required: true, message: '请输入产品单位', trigger: 'blur' },
    { max: 255, message: '长度不超过255个字符', trigger: 'blur' }
  ],
  product_spec: [
    { max: 255, message: '长度不超过255个字符', trigger: 'blur' }
  ],
  product_description: [
    { required: true, message: '请输入产品描述', trigger: 'blur' }
  ]
})

const dialogTitle = computed(() => productForm.value.product_id ? '编辑产品' : '新增产品')

// 状态标签样式
const getStatusTagType = (status) => {
  switch(status) {
    case '在产': return 'success'
    case '停产': return 'danger'
    case '试产': return 'warning'
    default: return 'info'
  }
}

// 日期格式化
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    // 处理ISO格式和YYYY-MM-DD格式
    return dateStr.split('T')[0]
  } catch (error) {
    return dateStr || '-'
  }
}

// 获取产品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    let response
    if (queryParams.keyword) {
      // 使用新的搜索API参数格式
      response = await productAPI.searchProducts(
          queryParams.keyword,
          pagination.page,
          pagination.page_size
      )
    } else {
      response = await productAPI.getProductList(
          pagination.page,
          pagination.page_size
      )
    }

    if (response.code === 200) {
      tableData.value = response.data.products || []
      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error(response.msg || '获取产品列表失败')
    }
  } catch (e) {
    console.error('获取产品列表失败:', e)
    ElMessage.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索功能/重置
const handleSearch = () => {
  pagination.page = 1
  fetchProductList()
}
const handleReset = () => {
  queryParams.keyword = ''
  handleSearch()
}

// 分页
const handleSizeChange = (size) => {
  pagination.page_size = size
  pagination.page = 1
  fetchProductList()
}
const handleCurrentChange = (page) => {
  pagination.page = page
  fetchProductList()
}

// 打开新增弹窗
const openAddDialog = () => {
  productForm.value = {
    product_name: '',
    product_type: '柱形外壳',
    product_status: '在产',
    product_category: '',
    product_unit: '个',
    product_spec: '',
    product_description: '',
    production_date: new Date().toISOString().split('T')[0],
    discontinuation_date: null,
    product_remarks: ''
  }
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = async (row) => {
  try {
    loading.value = true
    const res = await productAPI.getProductById(row.product_id)
    if (res.code === 200) {
      productForm.value = {
        ...res.data,
        // 格式化日期字段
        production_date: formatDate(res.data.production_date),
        discontinuation_date: formatDate(res.data.discontinuation_date)
      }
      dialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取产品信息失败')
    }
  } catch (error) {
    console.error('获取产品信息失败:', error)
    ElMessage.error('获取产品信息失败')
  } finally {
    loading.value = false
  }
}

// 提交产品表单
const submitProductForm = async () => {
  try {
    await productFormRef.value?.validate()

    submitLoading.value = true

    const payload = JSON.parse(JSON.stringify(productForm.value))

    // 处理日期格式 - 转换为ISO格式
    if (payload.production_date) {
      payload.production_date = payload.production_date + 'T00:00:00Z'
    }
    if (payload.discontinuation_date) {
      payload.discontinuation_date = payload.discontinuation_date + 'T00:00:00Z'
    }

    // 根据是否有ID决定是更新还是新增
    const api = payload.product_id
        ? productAPI.updateProduct
        : productAPI.addProduct

    const res = await api(payload)

    if (res.code === 200) {
      ElMessage.success(res.msg || '操作成功')
      dialogVisible.value = false
      fetchProductList()
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

// 删除产品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除"${row.product_name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await productAPI.deleteProduct(row.product_id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchProductList()
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

// 更新产品状态
const updateProductStatus = async (product_id, status) => {
  try {
    loading.value = true
    const res = await productAPI.updateProductStatus(product_id, status)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
      fetchProductList()
    } else {
      ElMessage.error(res.msg || '状态更新失败')
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
.product {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .product {
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
</style>