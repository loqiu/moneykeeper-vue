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
          <!-- <el-button
            class="google-button"
            @click="handleGoogleLogin"
          >
            <i class="fa-brands fa-google"></i>
            使用Google登录
          </el-button> -->

        </div>
        <div class="google-signin-wrapper">
          <div id="googleButton">
            <div id="g_id_onload"
                data-client_id="161545064775-0d898na3c3cgrl8htbsod2o73smjvo3p.apps.googleusercontent.com"
                data-context="signin"
                data-ux_mode="popup"
                data-login_uri="https://cindypig.com"
                data-callback="handleGoogleCallback"
                data-itp_support="true">
            </div>

            <div class="g_id_signin"
                data-type="standard"
                data-shape="pill"
                data-theme="outline"
                data-text="signin_with"
                data-size="large"
                data-logo_alignment="left">
            </div>
          </div>
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
  console.log('检查 Google 脚本加载状态...')
  const checkGoogleScript = setInterval(() => {
    if (typeof window.google !== 'undefined') {
      console.log('Google 脚本加载完成')
      clearInterval(checkGoogleScript)
      
      try {
        // 初始化 Google 登录
        window.google.accounts.id.initialize({
          client_id: '161545064775-0d898na3c3cgrl8htbsod2o73smjvo3p.apps.googleusercontent.com',
          callback: window.handleGoogleCallback, // 使用全局回调
          auto_select: false, // 禁用自动选择
          cancel_on_tap_outside: true // 允许点击外部取消
        })

        // 渲染按钮
        window.google.accounts.id.renderButton(
          document.getElementById('googleButton'),
          {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'signin_with'
          }
        )
        console.log('Google 按钮初始化成功')
      } catch (error) {
        console.error('Google 按钮初始化失败:', error)
      }
    }
  }, 100)

  setTimeout(() => {
    clearInterval(checkGoogleScript)
    if (typeof window.google === 'undefined') {
      console.error('Google 脚本加载超时')
    }
  }, 5000)
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