<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
    <div class="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 transition-all duration-300 hover:shadow-purple-500/20">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-gray-800 tracking-tight">欢迎回来</h1>
        <p class="text-gray-500 text-sm">请登录您的账号以继续</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="space-y-4"
        label-position="top"
        size="large"
      >
        <el-form-item label="用户名" prop="username" class="!mb-4">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            class="!h-12"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" class="!mb-6">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin(loginFormRef)"
            class="!h-12"
          />
        </el-form-item>

        <div class="space-y-4">
          <el-button
            type="primary"
            :loading="loginLoading"
            class="!w-full !h-12 !text-lg !rounded-lg !bg-gradient-to-r !from-indigo-600 !to-purple-600 !border-none hover:!opacity-90 transition-opacity shadow-lg shadow-indigo-500/30"
            @click="handleLogin(loginFormRef)"
          >
            登 录
          </el-button>
          
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">还没有账号？</span>
            <el-button
              link
              type="primary"
              class="!font-semibold"
              @click="registerDialogVisible = true"
            >
              立即注册
            </el-button>
          </div>
        </div>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white/90 text-gray-500">或者</span>
          </div>
        </div>

        <div class="flex justify-center">
          <div id="google-btn" class="h-[40px]"></div>
        </div>
      </el-form>
    </div>

    <!-- 注册对话框 -->
    <el-dialog
      v-model="registerDialogVisible"
      title="注册新账号"
      width="90%"
      class="max-w-lg !rounded-xl"
      :close-on-click-modal="false"
      align-center
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
        size="large"
        class="mt-4"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerForm.username"
            placeholder="3-50个字符"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="6位以上"
            show-password
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="example@email.com"
            maxlength="255"
          />
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="名字" prop="firstName">
            <el-input
              v-model="registerForm.firstName"
              placeholder="First Name"
              maxlength="50"
            />
          </el-form-item>

          <el-form-item label="姓氏" prop="lastName">
            <el-input
              v-model="registerForm.lastName"
              placeholder="Last Name"
              maxlength="50"
            />
          </el-form-item>
        </div>

        <el-form-item label="手机号" prop="phoneNumber">
          <el-input
            v-model="registerForm.phoneNumber"
            placeholder="可选"
            maxlength="20"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer flex justify-end gap-3">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="registerLoading"
            @click="handleRegister(registerFormRef)"
            class="!bg-indigo-600 !border-indigo-600"
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
import { User, Lock } from '@element-plus/icons-vue'
import { useLogin } from '@/composables/useLogin'
import { useRegister } from '@/composables/useRegister'
import { useGoogleLogin } from '@/composables/useGoogleLogin'
import { ElMessage } from 'element-plus'
import axios from '@/utils/axios'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const handleGoogleSuccess = async (response) => {
  try {
    console.log('Google Login Success:', response)
    
    // 调用后端 Google 登录接口
    const res = await axios.post('/auth/google', { 
      idToken: response.credential 
    })

    if (res.data.code === 200) {
      const loginData = res.data.data
      
      // 存储用户信息
      userStore.setUserInfo({
        userPin: loginData.userPin,
        userId: loginData.userId,
        username: loginData.username,
        token: loginData.token
      })

      ElMessage.success('Google 登录成功')
      
      // 跳转到主页或重定向页面
      const redirectPath = route.query.redirect || '/accounting'
      router.push(redirectPath)
    } else {
      ElMessage.error(res.data.message || 'Google 登录失败')
    }
    
  } catch (error) {
    console.error('Google login error:', error)
    ElMessage.error(error.response?.data?.message || 'Google 登录失败')
  }
}

const { renderGoogleButton } = useGoogleLogin(handleGoogleSuccess)

onMounted(() => {
  renderGoogleButton('google-btn', {
    width: '250' // 自定义宽度
  })
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

<style scoped>
/* 覆盖 Element Plus 的一些默认样式以更好地适配 */
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
  padding: 8px 12px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #6366f1 inset !important;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
</style>