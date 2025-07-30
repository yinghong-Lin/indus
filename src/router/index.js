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
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("../views/Dashboard.vue"),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 目标路由不需要登录
  if (to.meta.requiresAuth === false) {
    next()
    return
  }

  // 需要登录但未登录
  if (!authStore.isAuthenticated) {
    next("/login")
  } else {
    next()
  }
})

export default router
