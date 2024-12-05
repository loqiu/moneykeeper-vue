import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export function useLogin() {
  const router = useRouter()
  const userStore = useUserStore()
  
  const loginForm = ref({
    username: '',
    password: ''
  })

  const API_URL = process.env.VUE_APP_API_URL

  // 登录方法
  const login = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: loginForm.value.username,
        password: loginForm.value.password
      })

      if (response.data && response.data.userId) {
        // 使用 Pinia store 存储用户信息
        userStore.setUserInfo({
          userId: response.data.userId,
          username: response.data.username
        })
        
        ElMessage.success('登录成功')
        return true
      } else {
        ElMessage.error('登录失败：用户信息无效')
        return false
      }
    } catch (error) {
      console.error('登录错误:', error)
      ElMessage.error('登录失败：' + (error.response?.data?.message || '用户名或密码错误'))
      return false
    }
  }

  // 登出方法
  const logout = () => {
    userStore.clearUserInfo()
    router.push('/login')
  }

  return {
    loginForm,
    login,
    logout
  }
} 