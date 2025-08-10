<template>
    <div class="production-line">
        <div class="page-header">
            <h2>产线管理</h2>
            <el-button type="success" @click="openAddDialog">
                <el-icon>
                    <Plus />
                </el-icon>新增产线
            </el-button>
        </div>

        <!-- 产线列表 -->
        <el-card class="table-card">
            <el-table :data="tableData" v-loading="loading" stripe class="production-line-table">
                <el-table-column prop="line_name" label="产线名称" width="200" />
                <el-table-column prop="line_type" label="产线类型" width="120">
                    <template #default="{ row }">
                        <el-tag type="info" size="small">{{ row.line_type }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="line_status" label="运行状态" width="130">
                    <template #default="{ row }">
                        <el-tag :type="getStatusTagType(row.line_status)" size="small">
                            {{ row.line_status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="160">
                    <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
                </el-table-column>
                <el-table-column prop="updated_at" label="更新时间" width="160">
                    <template #default="{ row }">{{ formatDateTime(row.updated_at) }}</template>
                </el-table-column>
                <el-table-column label="操作" min-width="180">
                    <template #default="{ row }">
                        <div class="action-buttons">
                            <el-button size="small" @click="openViewDialog(row)">查看</el-button>
                            <el-button size="small" type="warning" @click="openUpdateStatusDialog(row)">更新状态</el-button>
                            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.page_size"
                    :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 新增产线弹窗 -->
        <el-dialog title="新增产线" v-model="addDialogVisible" width="900px" :close-on-click-modal="false">
            <el-form :model="productionLineForm" :rules="productionLineRules" ref="productionLineFormRef"
                label-width="120px">
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="产线名称" prop="line_name">
                            <el-input v-model="productionLineForm.line_name" placeholder="请输入产线名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="产线类型" prop="line_type">
                            <el-input v-model="productionLineForm.line_type" placeholder="请输入产线类型" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="工艺步骤" prop="process_steps">
                    <el-row :gutter="16" v-for="(step, index) in productionLineForm.process_steps" :key="index"
                        style="margin-bottom: 15px; border: 1px solid #ebeef5; padding: 10px; border-radius: 4px;">
                        <el-col :span="6">
                            <el-input v-model="step.step_name" placeholder="步骤名称" />
                        </el-col>
                        <!-- 步骤顺序字段已禁用，只显示 -->
                        <el-col :span="6">
                            <el-input :value="index + 1" disabled placeholder="步骤顺序" />
                        </el-col>
                        <el-col :span="12">
                            <el-input v-model="step.step_description" placeholder="步骤描述" />
                        </el-col>
                        <el-col :span="24" style="margin-top: 10px;">
                            <el-select v-model="step.equipment" multiple filterable placeholder="搜索设备名称"
                                class="full-width">
                                <el-option v-for="item in equipmentOptions" :key="item.equipment_id"
                                    :label="item.equipment_name" :value="item.equipment_id" />
                            </el-select>
                        </el-col>
                    </el-row>
                    <div style="text-align: right; margin-top: 10px;">
                        <el-button type="text" @click="addProcessStep" style="color: #409EFF;">
                            <el-icon>
                                <Plus />
                            </el-icon>添加步骤
                        </el-button>
                        <el-button type="text" @click="removeProcessStep"
                            :disabled="productionLineForm.process_steps.length <= 1" style="color: #F56C6C;">
                            <el-icon>
                                <Minus />
                            </el-icon>删除步骤
                        </el-button>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitProductionLineForm" :loading="submitLoading">
                    新增
                </el-button>
            </template>
        </el-dialog>

        <!-- 查看产线弹窗 -->
        <el-dialog title="查看产线详情" v-model="viewDialogVisible" width="900px" :close-on-click-modal="false">
            <el-form label-width="120px">
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="产线名称">
                            <el-input v-model="viewForm.line_name" disabled />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="产线类型">
                            <el-input v-model="viewForm.line_type" disabled />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="运行状态">
                    <el-input v-model="viewForm.line_status" disabled />
                </el-form-item>

                <el-form-item label="工艺步骤">
                    <el-table :data="viewForm.process_steps" border>
                        <el-table-column prop="step_order" label="步骤顺序" width="100" />
                        <el-table-column prop="step_name" label="步骤名称" width="150" />
                        <el-table-column prop="step_description" label="步骤描述" />
                        <el-table-column prop="equipment_names" label="关联设备" width="300">
                            <template #default="{ row }">
                                <el-tag v-for="name in row.equipment_names" :key="name" type="info" size="small"
                                    style="margin-right: 5px;">
                                    {{ name }}
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="viewDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>

        <!-- 更新产线状态弹窗 -->
        <el-dialog title="更新产线状态" v-model="updateStatusDialogVisible" width="400px" :close-on-click-modal="false">
            <el-form :model="statusForm" :rules="statusRules" ref="statusFormRef" label-width="100px">
                <el-form-item label="当前状态" prop="currentStatus">
                    <el-tag :type="getStatusTagType(statusForm.currentStatus)" size="small">
                        {{ statusForm.currentStatus }}
                    </el-tag>
                </el-form-item>
                <el-form-item label="新状态" prop="newStatus">
                    <el-select v-model="statusForm.newStatus" placeholder="请选择新状态" clearable>
                        <el-option label="运行中" value="运行中" />
                        <el-option label="未运行" value="未运行" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="updateStatusDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitStatusUpdate" :loading="statusLoading">
                    确认更新
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Minus } from '@element-plus/icons-vue'
import { productionLineAPI } from '../api/productionLine'
import { equipmentAPI } from '../api/equipment'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const statusLoading = ref(false)
const tableData = ref([])

const queryParams = reactive({
    keyword: ''
})
const pagination = reactive({
    page: 1,
    page_size: 10,
    total: 0
})

// 新增弹窗相关
const addDialogVisible = ref(false)
const productionLineForm = ref({
    line_name: '',
    line_type: '',
    process_steps: [{
        step_name: '',
        step_order: 1,
        step_description: '',
        equipment: []
    }]
})
const productionLineFormRef = ref()

// 查看弹窗相关
const viewDialogVisible = ref(false)
const viewForm = ref({
    line_id: '',
    line_name: '',
    line_type: '',
    line_status: '',
    created_at: '',
    updated_at: '',
    process_steps: []
})

// 更新状态弹窗相关
const updateStatusDialogVisible = ref(false)
const statusForm = ref({
    line_id: '',
    currentStatus: '',
    newStatus: ''
})
const statusFormRef = ref()

// 验证规则
const productionLineRules = reactive({
    line_name: [{ required: true, message: '请输入产线名称', trigger: 'blur' }],
    line_type: [{ required: true, message: '请输入产线类型', trigger: 'change' }],
    process_steps: [{ required: true, message: '请至少添加一个工艺步骤', trigger: 'blur' }]
})

const statusRules = reactive({
    newStatus: [{ required: true, message: '请选择新状态', trigger: 'change' }]
})

// 设备选择选项
const equipmentOptions = ref([])

// 工具函数
const getStatusTagType = (status) => {
    switch (status) {
        case '运行中': return 'success'
        case '未运行': return 'info'
        default: return 'info'
    }
}

const formatDateTime = (dt) => {
    if (!dt) return '-'
    try {
        return new Date(dt).toLocaleString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        })
    } catch (error) {
        return '-'
    }
}

// 获取设备选项
const fetchEquipmentOptions = async () => {
    try {
        const res = await equipmentAPI.getEquipmentList({ page: 1, page_size: 1000 })
        if (res.code === 200) {
            equipmentOptions.value = res.data.equipments
        }
    } catch (error) {
        console.error('获取设备列表失败:', error)
    }
}

// 产线列表获取
const fetchProductionLineList = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.page,
            page_size: pagination.page_size
        }
        const response = await productionLineAPI.getProductionLineList(params)
        if (response.code === 200) {
            tableData.value = response.data.ProductionLines || []
            pagination.total = response.data.pagination.total
        } else {
            ElMessage.error(response.msg || '获取产线列表失败')
        }
    } catch (e) {
        console.error('获取产线列表失败:', e)
        ElMessage.error('获取产线列表失败')
    } finally {
        loading.value = false
    }
}

// 搜索图片错误查询逻辑，确保前端能够获取到正确的设备名称
const handleSearch = async () => {
    pagination.page = 1
    await fetchProductionLineList()
}
const handleReset = () => {
    queryParams.keyword = ''
    fetchProductionLineList()
}

// 分页处理
const handleSizeChange = (size) => {
    pagination.page_size = size
    pagination.page = 1
    fetchProductionLineList()
}
const handleCurrentChange = (page) => {
    pagination.page = page
    fetchProductionLineList()
}

// 工艺步骤操作（仅新增时可用）
const addProcessStep = () => {
    productionLineForm.value.process_steps.push({
        step_name: '',
        step_order: productionLineForm.value.process_steps.length + 1,
        step_description: '',
        equipment: []
    })
}
const removeProcessStep = () => {
    if (productionLineForm.value.process_steps.length > 1) {
        productionLineForm.value.process_steps.pop()
    }
}

// 新增弹窗
const openAddDialog = () => {
    productionLineForm.value = {
        line_name: '',
        line_type: '',
        process_steps: [{ step_name: '', step_order: 1, step_description: '', equipment: [] }]
    }
    addDialogVisible.value = true
}

// 查看弹窗
const openViewDialog = async (row) => {
    try {
        const res = await productionLineAPI.getProductionLineById(row.line_id)
        if (res.code === 200) {
            // 确保设备名称能正确显示
            const detailedLine = { ...res.data }
            detailedLine.process_steps = detailedLine.process_steps.map(step => {
                return {
                    ...step,
                    equipment_names: step.equipment.map(equipmentId => {
                        const equipment = equipmentOptions.value.find(e => e.equipment_id === equipmentId)
                        return equipment ? equipment.equipment_name : '未知设备'
                    })
                }
            })
            viewForm.value = detailedLine
            viewDialogVisible.value = true
        } else {
            ElMessage.error(res.msg || '获取产线详情失败')
        }
    } catch (error) {
        console.error('获取产线详情失败:', error)
        ElMessage.error('获取产线详情失败')
    }
}

// 更新状态弹窗
const openUpdateStatusDialog = (row) => {
    statusForm.value = {
        line_id: row.line_id,
        currentStatus: row.line_status,
        newStatus: ''
    }
    updateStatusDialogVisible.value = true
}

// 提交新增产线
const submitProductionLineForm = async () => {
    try {
        await productionLineFormRef.value?.validate()
        submitLoading.value = true

        // 构建提交的步骤数据，确保步骤顺序正确
        const payload = {
            line_name: productionLineForm.value.line_name,
            line_type: productionLineForm.value.line_type,
            process_steps: productionLineForm.value.process_steps.map((step, index) => ({
                step_name: step.step_name,
                step_order: index + 1,
                step_description: step.step_description,
                equipment: step.equipment
            }))
        }

        const res = await productionLineAPI.addProductionLine(payload)
        if (res.code === 200) {
            ElMessage.success('新增产线成功')
            addDialogVisible.value = false
            fetchProductionLineList()
        } else {
            ElMessage.error(res.msg || '新增失败')
        }
    } catch (error) {
        if (error !== false) {
            console.error('提交失败:', error)
            ElMessage.error('操作失败，请检查输入')
        }
    } finally {
        submitLoading.value = false
    }
}

// 提交状态更新
const submitStatusUpdate = async () => {
    try {
        await statusFormRef.value?.validate()
        statusLoading.value = true

        // 如果状态没有变化，直接关闭弹窗
        if (statusForm.value.currentStatus === statusForm.value.newStatus) {
            ElMessage.warning('新状态与当前状态相同，无需更新')
            statusLoading.value = false
            return
        }

        const res = await productionLineAPI.updateProductionLineStatus(
            statusForm.value.line_id,
            statusForm.value.newStatus
        )

        if (res.code === 200) {
            ElMessage.success('状态更新成功')
            updateStatusDialogVisible.value = false
            fetchProductionLineList()
        } else {
            ElMessage.error(res.msg || '状态更新失败')
        }
    } catch (error) {
        if (error !== false) {
            console.error('状态更新失败:', error)
            ElMessage.error('状态更新失败')
        }
    } finally {
        statusLoading.value = false
    }
}

// 删除产线
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确定删除"${row.line_name}"吗？`,
            '确认删除',
            { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        )

        const res = await productionLineAPI.deleteProductionLine(row.line_id)
        if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchProductionLineList()
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

// 初始化
onMounted(() => {
    fetchEquipmentOptions()
    fetchProductionLineList()
})
</script>

<style scoped>
.production-line {
    padding: 20px;
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.filter-card,
.table-card {
    margin-bottom: 20px;
}

.full-width {
    width: 100%;
}

.search-button-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.pagination-wrapper {
    margin-top: 20px;
    text-align: right;
}
</style>