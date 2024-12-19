<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h1 class="login-title">登录</h1>
      </template>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="handleLogin(loginFormRef)"
          />
        </el-form-item>
        <div class="form-actions">
          <el-button
            type="primary"
            :loading="loginLoading"
            @click="handleLogin(loginFormRef)"
          >
            登录
          </el-button>
          <el-button
            class="register-button"
            @click="registerDialogVisible = true"
          >
            注册账号
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 注册对话框 -->
    <el-dialog
      v-model="registerDialogVisible"
      title="注册新账号"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerForm.username"
            placeholder="请输入3-50个字符的用户名"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入6位以上的密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="名字" prop="firstName">
          <el-input
            v-model="registerForm.firstName"
            placeholder="请输入名字"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="姓氏" prop="lastName">
          <el-input
            v-model="registerForm.lastName"
            placeholder="请输入姓氏"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phoneNumber">
          <el-input
            v-model="registerForm.phoneNumber"
            placeholder="请输入手机号"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="registerLoading"
            @click="handleRegister(registerFormRef)"
          >
            注册
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLogin } from '@/composables/useLogin'
import { useRegister } from '@/composables/useRegister'
import '@/assets/styles/login.css'

onMounted(() => {
  console.log('LoginPage mounted')
})

const {
  loginForm,
  loginFormRef,
  loginRules,
  loading: loginLoading,
  handleLogin
} = useLogin()

const {
  registerDialogVisible,
  registerForm,
  registerFormRef,
  loading: registerLoading,
  rules,
  handleRegister,
  handleCancel
} = useRegister()
</script>