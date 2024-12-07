import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import request from '@/utils/axios'

export function useLogin() {
  const router = useRouter()
  const userStore = useUserStore()

  const loginForm = ref({
    username: '',
    password: ''
  })

  const loading = ref(false)

  const handleLogin = async () => {
    if (!loginForm.value.username || !loginForm.value.password) {
      ElMessage.warning('请输入用户名和密码')
      return
    }

    loading.value = true
    try {
      const response = await request.post(`/auth/login`, {
        username: loginForm.value.username,
        password: loginForm.value.password
      })

      if (response.data) {
        // 保存用户信息和token到store
        userStore.setUserInfo({
          userId: response.data.userId,
          username: response.data.username,
          token: response.data.token
        })

        ElMessage.success('登录成功')
        router.push('/accounting')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error(error.response?.data?.message || '登录失败')
    } finally {
      loading.value = false
    }
  }

  return {
    loginForm,
    loading,
    handleLogin
  }
} 