import Mock from "mockjs"

// 获取角色列表接口
Mock.mock(/\/role\/all/, "get", (options) => {
  const url = new URL("http://localhost" + options.url)
  const page = Number.parseInt(url.searchParams.get("page")) || 1
  const page_size = Number.parseInt(url.searchParams.get("page_size")) || 20

  return Mock.mock({
    code: 200,
    message: "success",
    data: {
      "list|5-10": [
        {
          "id|+1": 1,
          role_name: "@pick(['管理员', '操作员', '维护员', '质检员', '生产主管'])",
          role_code: "@pick(['admin', 'operator', 'maintenance', 'quality', 'supervisor'])",
          description: "@sentence(10, 20)",
          "permissions|3-8": [
            "@pick(['dashboard:view', 'production:control', 'equipment:manage', 'maintenance:record', 'quality:check', 'user:manage', 'role:manage', 'report:export'])",
          ],
          "user_count|1-50": 1,
          status: "@pick(['active', 'inactive'])",
          create_time: "@datetime",
          update_time: "@datetime",
        },
      ],
      total: "@natural(5, 10)",
      page,
      page_size,
    },
  })
})

// 更新角色接口
Mock.mock("/role/update", "post", (options) => {
  const body = JSON.parse(options.body)
  return {
    code: 200,
    message: "角色更新成功",
    data: {
      username: body.username,
      role_name: body.role_name,
      update_time: Mock.Random.datetime(),
    },
  }
})

// 查询角色接口
Mock.mock("/role/select", "post", (options) => {
  const body = JSON.parse(options.body)
  return Mock.mock({
    code: 200,
    message: "success",
    data: {
      username: body.username,
      role_name: "@pick(['管理员', '操作员', '维护员', '质检员'])",
      role_code: "@pick(['admin', 'operator', 'maintenance', 'quality'])",
      description: "@sentence(10, 20)",
      "permissions|2-6": ["@pick(['dashboard:view', 'production:control', 'equipment:manage', 'maintenance:record'])"],
      status: "@pick(['active', 'inactive'])",
      create_time: "@datetime",
    },
  })
})

// 获取用户角色列表接口
Mock.mock("/api/role/user-roles", "get", () => {
  return Mock.mock({
    code: 200,
    message: "success",
    data: {
      "list|5-10": [
        {
          "id|+1": 1,
          roleName: "@pick(['管理员', '操作员', '维护员', '质检员', '生产主管'])",
          roleCode: "@pick(['admin', 'operator', 'maintenance', 'quality', 'supervisor'])",
          description: "@sentence(10, 20)",
          "permissions|3-8": [
            "@pick(['dashboard:view', 'production:control', 'equipment:manage', 'maintenance:record', 'quality:check', 'user:manage', 'role:manage', 'report:export'])",
          ],
          "userCount|1-50": 1,
          status: "@pick(['active', 'inactive'])",
          createTime: "@datetime",
          updateTime: "@datetime",
        },
      ],
      total: "@natural(5, 10)",
    },
  })
})

// 创建角色接口
Mock.mock("/api/role/create", "post", (options) => {
  const body = JSON.parse(options.body)
  return {
    code: 200,
    message: "角色创建成功",
    data: {
      id: Mock.Random.natural(100, 999),
      ...body,
      userCount: 0,
      status: "active",
      createTime: Mock.Random.datetime(),
      updateTime: Mock.Random.datetime(),
      creator: "当前用户",
    },
  }
})

// 删除角色接口
Mock.mock(/\/api\/role\/delete\/\d+/, "delete", () => {
  return {
    code: 200,
    message: "角色删除成功",
    data: null,
  }
})

export default {}
