import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "../stores/auth"

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: () => import("../components/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("../views/Home.vue"),
      },
      {
        path: "/tasks",
        name: "TaskManagement",
        component: () => import("../views/TaskManagement.vue"),
      },
      {
        path: "/monitoring",
        name: "ProductionMonitoring",
        component: () => import("../views/ProductionMonitoring.vue"),
      },
      {
        path: "/control",
        name: "ProductionControl",
        component: () => import("../views/ProductionControl.vue"),
      },
      {
        path: "/maintenance",
        name: "MaintenancePage",
        component: () => import("../views/MaintenancePage.vue"),
      },
       {
        path: "/product",
        name: "ProductManagement",
        component: () => import("../views/ProductManagement.vue"),
      },
      {
        path: "/warehouse",
        name: "WarehouseManagement",
        component: () => import("../views/WarehouseManagement.vue"),
      },
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("../views/Dashboard.vue"),
      },
      {
        path: "/productionline",
        name: "ProductionLine",
        component: () => import("../views/ProductionLine.vue"),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫：检测token是否存在
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  // 目标路由需要登录，但未登录（token不存在）
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login") // 跳转登录页
  } else {
    next() // 正常访问
  }
})

export default router
