<template>
  <el-container class="app-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '250px'" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapsed" class="logo-text">工业数采控制系统</span>
        <el-icon v-else class="logo-icon">
          <Setting />
        </el-icon>
      </div>

      <el-menu :default-active="activePath" class="sidebar-menu" :collapse="isCollapsed" router
        background-color="#1a1a1a" text-color="#ffffff" active-text-color="#409EFF">
        <el-menu-item index="/">
          <el-icon>
            <Odometer />
          </el-icon>
          <span>主页面</span>
        </el-menu-item>

        <el-menu-item index="/tasks">
          <el-icon>
            <Medal />
          </el-icon>
          <span>任务管理</span>
        </el-menu-item>

        <el-menu-item index="/monitoring">
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <span>生产监控</span>
        </el-menu-item>

        <el-menu-item index="/control">
          <el-icon>
            <Operation />
          </el-icon>
          <span>生产控制</span>
        </el-menu-item>

        <el-menu-item index="/maintenance">
          <el-icon>
            <Setting />
          </el-icon>
          <span>维修管理</span>
        </el-menu-item>

        <el-menu-item index="/dashboard">
          <el-icon>
            <Histogram />
          </el-icon>
          <span>生产看板</span>
        </el-menu-item>

        <el-menu-item index="/productionline">
          <el-icon>
            <Link />
          </el-icon>
          <span>产线管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button type="text" @click="toggleSidebar" class="collapse-btn">
            <el-icon>
              <Expand v-if="isCollapsed" />
              <Fold v-else />
            </el-icon>
          </el-button>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 用户菜单 -->
          <div class="user-info">
            <el-avatar :size="32" :src="userAvatar">
              <el-icon>
                <User />
              </el-icon>
            </el-avatar>
            <span class="username">{{ authStore.user?.user_name }}</span>
          </div>
          <el-button type="primary" @click="logout">退出登录</el-button>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting, Odometer, Medal, DataAnalysis,
  Expand, Fold, User, Operation, Link  // 使用确保存在的图标
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const notificationDrawer = ref(false)
const userAvatar = ref('')


const activePath = computed(() => route.path)

const breadcrumbs = computed(() => {
  const routeMap = {
    '/': { name: '主页面', path: '/' },
    '/tasks': { name: '任务管理', path: '/tasks' },
    '/monitoring': { name: '生产监控', path: '/monitoring' },
    '/control': { name: '生产控制', path: '/control' }
  }

  const currentRoute = routeMap[route.path]
  return currentRoute ? [{ name: '首页', path: '/' }, currentRoute] : [{ name: '首页', path: '/' }]
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const showNotifications = () => {
  notificationDrawer.value = true
}

const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await authStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch (error) {
    // 用户取消或异常，静默处理
  }
}

onMounted(() => {
  // 获取当前用户信息
  // authStore.getCurrentUser()
})
</script>

<style scoped>
/* 样式保持不变 */
.app-layout {
  height: 100vh;
}

.sidebar {
  background: #1a1a1a;
  border-right: 1px solid #333;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid #333;
}

.logo-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.logo-icon {
  color: #409EFF;
  font-size: 24px;
}

.sidebar-menu {
  border: none;
}

.main-container {
  background: #0a0a0a;
}

.header {
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  color: #ffffff;
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.username {
  color: #ffffff;
  font-size: 14px;
}

.main-content {
  padding: 0;
  overflow-y: auto;
}

:deep(.el-breadcrumb__inner) {
  color: #ffffff;
}

:deep(.el-breadcrumb__inner:hover) {
  color: #409EFF;
}

@media (max-width: 768px) {
  .header-left {
    gap: 10px;
  }

  .header-right {
    gap: 10px;
  }

  .username {
    display: none;
  }
}
</style>
