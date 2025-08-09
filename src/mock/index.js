import Mock from "mockjs"

// 导入各模块的 Mock 数据
import "./modules/equipment"
import "./modules/home"
import "./modules/maintenance"
import "./modules/monitoring"
import "./modules/task"
import "./modules/user"


// 设置Mock配置
Mock.setup({
  timeout: "200-600", // 设置响应时间
})

console.log("Mock.js 已启动")

export default Mock
