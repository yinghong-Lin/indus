<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo">
        <h1>工业数采控制系统</h1>
        <p>Industrial Control System</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.user_name"
            placeholder="用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="authStore.isLoading"
            @click="handleLogin"
            class="login-button"
          >
            {{ authStore.isLoading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { userAPI } from '../api/user' 

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref(null)

const loginForm = reactive({
  user_name: 'admin',
  password: 'admin123'
})

const loginRules = {
  user_name: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await userAPI.login(loginForm) // ✅ Use userAPI.login
        const user = response.data.user
        const access_token = response.data.access_token
        const refresh_token = response.data.refresh_token

        // ✅ Manually set token and user info to authStore
        authStore.user = user
        authStore.access_token = access_token // Corrected spelling
        authStore.refresh_token = refresh_token

        localStorage.setItem('user', JSON.stringify(user)) // Store object needs to be stringified
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        const message = error.response?.data?.message || '登录失败'
        ElMessage.error(message)
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-form {
  background: rgba(26, 26, 26, 0.9);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo h1 {
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.logo p {
  color: #888;
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.login-tips {
  margin-top: 20px;
  text-align: center;
}

.login-tips p {
  color: #666;
  font-size: 12px;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-input__inner) {
  color: #ffffff;
}

:deep(.el-input__inner::placeholder) {
  color: #888;
}
</style>
