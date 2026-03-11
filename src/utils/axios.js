import axios from 'axios'
import { ElMessage } from 'element-plus'
import { jwtDecode } from 'jwt-decode'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { normalizeAuthToken, stripBearerPrefix } from '@/utils/auth'
import { getApiBaseUrl } from '@/utils/runtimeConfig'

const LOGIN_ROUTE = '/login'

const isTokenExpired = (token) => {
  const rawToken = stripBearerPrefix(token)
  if (!rawToken) return true

  try {
    const decoded = jwtDecode(rawToken)
    if (!decoded.exp) {
      return false
    }

    return (decoded.exp * 1000) <= (Date.now() + 5 * 60 * 1000)
  } catch (error) {
    console.error('Token 解析失败:', error)
    return true
  }
}

const redirectToLogin = () => {
  if (router.currentRoute.value.path !== LOGIN_ROUTE) {
    router.push(LOGIN_ROUTE)
  }
}

const handleUnauthorized = (userStore, message = '登录已过期，请重新登录') => {
  if (userStore.token) {
    userStore.clearUserInfo()
    ElMessage.error(message)
  }
  redirectToLogin()
}

const instance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000
})

instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token

    if (token) {
      if (isTokenExpired(token)) {
        handleUnauthorized(userStore)
        return Promise.reject(new Error('Token expired'))
      }

      config.headers = config.headers || {}
      config.headers.Authorization = normalizeAuthToken(token)
    }

    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const userStore = useUserStore()
      const backendMessage = error.response.data?.message

      switch (error.response.status) {
        case 401:
          handleUnauthorized(userStore, backendMessage || '登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error(backendMessage || '没有权限进行此操作')
          break
        case 404:
          ElMessage.error(backendMessage || '请求的资源不存在')
          break
        case 500:
          ElMessage.error(backendMessage || '服务器内部错误')
          break
        default:
          ElMessage.error(backendMessage || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络请求失败，请检查网络连接')
    } else if (error.message !== 'Token expired') {
      ElMessage.error(error.message || '请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default instance