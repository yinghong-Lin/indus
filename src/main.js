import { createApp } from "vue"
import { createPinia } from "pinia"
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"
import dayjs from "dayjs" // Import dayjs
import "dayjs/locale/zh-cn" // Import Chinese locale for consistent week start

import App from "./App.vue"
import router from "./router"
import "./style.css"

// Set dayjs locale globally to ensure consistent week start (e.g., Monday)
dayjs.locale("zh-cn")

// ✅ 开发环境启用 mock
if (import.meta.env.DEV) {
  import("./mock")
}

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount("#app")
