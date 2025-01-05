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
          console.log("login response.data: ",response.data)
          console.log("login response.data.data.userPin: ",response.data.data.userPin)
          if (response.data.data) {
            userStore.setUserInfo({
              userPin: response.data.data.userPin,
              userId: response.data.data.userId,
              username: response.data.data.username,
              token: response.data.data.token
            })
            console.log("login userStore.userId: ",userStore.userId)
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
  const handleLogout = async () => {
    loading.value = false
    try {
      // 从 store 中获取 token
      const token = userStore.token

      const response = await axios.post('/auth/logout', null, {
        headers: {
          'Authorization': token
        }
      }).then(response => {
        // console.log('原始响应:', response)
        // // 格式化输出完整响应
        // console.log('退出登录响应:', JSON.stringify(response, null, 2))
        // // 只输出响应数据部分
        // console.log('响应数据:', JSON.stringify(response.data, null, 2))
        // console.log('响应状态码:', response.status)
        // console.log('data:', response.data)
        // console.log('response.data.code:', response.data.code)
        // console.log('response.data.data:', response.data.data)
        if (response.data.code === 200 && response.data.data === true) {
          console.log('退出登录成功')
          // 清除用户信息
          userStore.clearUserInfo()
          // 跳转到登录页
          router.push('/login')
          ElMessage.success('退出登录成功')
        }
      })
      return response
    } catch (error) {
      console.error('退出登录失败:', error)
    const errorMsg = error.response?.data?.message || '退出登录失败，请稍后重试'
    ElMessage.error(errorMsg)
    } finally {
      loading.value = false
    }
  }

  return {
    loginForm,
    loginFormRef,
    loginRules,
    loading,
    handleLogin,
    handleLogout
  }
} 