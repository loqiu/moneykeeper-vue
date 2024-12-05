<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>登录</h2>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLogin } from '@/composables/useLogin'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import '@/assets/styles/login.css'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const {
  loginForm,
  login
} = useLogin()

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const success = await login()
    if (success) {
      // 登录成功后跳转到之前的页面或默认页面
      const redirectPath = route.query.redirect || '/accounting'
      router.push(redirectPath)
    }
  } finally {
    loading.value = false
  }
}
</script> 