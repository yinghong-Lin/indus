import Mock from "mockjs"

// 模拟登录接口
Mock.mock("/api/user/login", "post", (options) => {
  const body = JSON.parse(options.body)
  const { username, password } = body

  // ✅ 模拟两个账号
  const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "123", password: "123456", role: "xixi" }
  ]

  const user = users.find(u => u.username === username && u.password === password)

  if (user) {
    return {
      user: {
        id: Mock.mock('@id'),
        username: user.username,
        role: user.role,
      },
      token: "fake-jwt-token-" + Date.now(),
      refreshToken: "fake-refresh-token-" + Date.now(),
    }
  } else {
    return Mock.mock({
      status: 401,
      message: "用户名或密码错误",
    })
  }
})

// 模拟登出接口
Mock.mock("/api/user/logout", "post", () => {
  return { success: true }
})

// 模拟刷新token接口
Mock.mock("/api/user/refresh", "post", (options) => {
  const body = JSON.parse(options.body)
  const { refreshToken } = body

  if (refreshToken && refreshToken.startsWith("fake-refresh-token-")) {
    return {
      token: "fake-jwt-token-" + Date.now(),
    }
  } else {
    return Mock.mock({
      status: 401,
      message: "Invalid refresh token",
    })
  }
})

// 模拟获取当前用户信息接口
Mock.mock("/api/user/me", "get", (options) => {
  const authorization = options.headers?.Authorization || options.headers?.authorization

  if (authorization && authorization.startsWith("Bearer fake-jwt-token-")) {
    return {
      id: 1,
      username: "admin",
      role: "admin",
    }
  } else {
    return Mock.mock({
      status: 401,
      message: "Unauthorized",
    })
  }
})

console.log("[Mock] 用户相关接口已启动！")
