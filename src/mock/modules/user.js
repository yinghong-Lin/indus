import Mock from "mockjs"

// 模拟登录接口（字段统一为 user_name / password）
Mock.mock("/api/user/login", "post", (options) => {
  const body = JSON.parse(options.body)
  const { user_name, password } = body

  // 模拟两个账号
  const users = [
    { user_name: "admin", password: "admin123", role: "admin" },
    { user_name: "123", password: "123456", role: "xixi" }
  ]

  const user = users.find(u => u.user_name === user_name && u.password === password)

  if (user) {
    return Mock.mock({
      code: 200,
      message: "登录成功",
      data: {
        user: {
          id: "@id",
          user_name: user.user_name,
          role: user.role,
        },
        access_token: "fake-jwt-token-" + Date.now(),
        refresh_token: "fake-refresh-token-" + Date.now(),
      }
    })
  } else {
    return {
      code: 401,
      message: "用户名或密码错误"
    }
  }
})

// 模拟登出接口
Mock.mock("/api/user/logout", "post", () => {
  return { success: true }
})

// 模拟刷新 token 接口（字段统一为 refresh_token）
Mock.mock("/api/user/refresh", "post", (options) => {
  const body = JSON.parse(options.body)
  const { refresh_token } = body

  if (refresh_token && refresh_token.startsWith("fake-refresh-token-")) {
    return {
      access_token: "fake-jwt-token-" + Date.now(),
    }
  } else {
    return {
      code: 401,
      message: "Invalid refresh token"
    }
  }
})

console.log("[Mock] 用户相关接口已启动！")