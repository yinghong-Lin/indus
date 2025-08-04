<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
onMounted(() => {
  authStore.getCurrentUser()
})
</script>

<style>
#app {
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Element Plus 深色主题定制 */
:root {
  --el-color-primary: #409EFF;
  --el-color-success: #67C23A;
  --el-color-warning: #E6A23C;
  --el-color-danger: #F56C6C;
  --el-color-info: #909399;
  
  --el-bg-color: #1a1a1a;
  --el-bg-color-page: #0a0a0a;
  --el-text-color-primary: #ffffff;
  --el-text-color-regular: #cccccc;
  --el-border-color: #333333;
  --el-fill-color-light: #262626;
}

.el-card {
  background: #1a1a1a;
  border: 1px solid #333;
}

.el-card__header {
  background: #262626;
  border-bottom: 1px solid #333;
}

.el-table {
  background: transparent;
}

.el-table th.el-table__cell {
  background: #262626;
  border-bottom: 1px solid #333;
}

.el-table td.el-table__cell {
  border-bottom: 1px solid #333;
}

.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background: rgba(255, 255, 255, 0.02);
}

.el-table__body tr:hover > td.el-table__cell {
  background: rgba(255, 255, 255, 0.05);
}
</style>