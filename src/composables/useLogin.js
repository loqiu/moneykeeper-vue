import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from '@/utils/axios'

export function useLogin() {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  
  const loginForm = ref({
    username: '',
    password: ''
  })
  
  const loginFormRef = ref(null)
  const loading = ref(false)

  // 登录表单验证规则
  const loginRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ]
  }

  const handleLogin = async (formEl) => {
    if (!formEl) return
    
    await formEl.validate(async (valid) => {
      if (valid) {
        loading.value = true
        try {
          const response = await axios.post('/auth/login', loginForm.value)
          
          if (response.data) {
            userStore.setUserInfo({
              userId: response.data.userId,
              username: response.data.username,
              token: response.data.token
            })
            
            ElMessage.success('登录成功')
            const redirectPath = route.query.redirect || '/accounting'
            router.push(redirectPath)
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || '登录失败，请稍后重试'
          ElMessage.error(errorMsg)
        } finally {
          loading.value = false
        }
      }
    })
  }

  return {
    loginForm,
    loginFormRef,
    loginRules,
    loading,
    handleLogin
  }
} 