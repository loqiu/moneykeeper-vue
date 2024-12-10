import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import { jwtDecode } from "jwt-decode";

// 检查token是否过期
const isTokenExpired = (token) => {
  // console.log('检查token是否过期', token)
  if (!token) return true
  
  try {
    const decoded = jwtDecode(token)
    // exp 是 Unix 时间戳（秒），需要转换为毫秒
    // 提前5分钟判定过期，给续期留出时间
    return (decoded.exp * 1000) <= (Date.now() + 5 * 60 * 1000)
  } catch (error) {
    console.error('Token解析失败:', error)
    return true
  }
}

// 创建axios实例
const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use(
  async (config) => {
    const userStore = useUserStore()
    const token = userStore.token
    
    if (token) {
      // 检查token是否过期
      if (isTokenExpired(token)) {
        // token过期，清除用户信息并跳转到登录页
        userStore.clearUserInfo()
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
        return Promise.reject(new Error('Token expired'))
      }
      
      // token未过期，添加到请求头
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const userStore = useUserStore()
      
      switch (error.response.status) {
        case 401:
          // 未授权，可能是token无效或过期
          userStore.clearUserInfo()
          ElMessage.error('登录已过期，请重新登录')
          router.push('/login')
          break
          
        case 403:
          ElMessage.error('没有权限进行此操作')
          break
          
        case 404:
          ElMessage.error('请求的资源不存在')
          break
          
        case 500:
          ElMessage.error('服务器内部错误')
          break
          
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络请求失败，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default instance 