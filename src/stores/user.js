import { defineStore } from 'pinia'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { ElNotification } from 'element-plus'
import {
  USER_INFO_STORAGE_KEY,
  normalizeAuthToken,
  parseStoredUserInfo,
  sanitizeUserInfo
} from '@/utils/auth'
import { useNotificationStore } from '@/stores/notification'
import { getSseSubscribeUrl } from '@/utils/runtimeConfig'

const MAX_RECONNECT_ATTEMPTS = 5
const HEARTBEAT_TIMEOUT = 3600000
const CONNECTION_TIMEOUT = 60000

let eventSource = null
let reconnectTimeout = null

const clearReconnectTimeout = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
}

const closeEventSource = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

const showNotification = (payload) => {
  if (!payload) {
    return
  }

  if (payload.type === 'heartbeat' || payload.type === 'connect') {
    return
  }

  const notificationStore = useNotificationStore()
  notificationStore.handleIncomingNotification(payload)

  ElNotification({
    title: payload.title || '新消息',
    message: payload.message || String(payload),
    type: payload.type || 'info',
    position: 'top-right',
    duration: 4500
  })
}

const parseEventPayload = (event) => {
  if (!event?.data || event.data === 'ping') {
    return null
  }

  try {
    return JSON.parse(event.data)
  } catch (error) {
    console.error('消息解析失败:', error, '原始消息:', event.data)
    return {
      message: event.data,
      type: 'info'
    }
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userPin: null,
    userId: null,
    username: '',
    token: null,
    isConnecting: false,
    isConnected: false,
    reconnectAttempts: 0
  }),

  actions: {
    scheduleReconnect() {
      clearReconnectTimeout()

      if (!this.userId || !this.token) {
        return
      }

      if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        ElNotification({
          title: '连接提示',
          message: '与实时通知服务的连接已断开，请刷新页面重试',
          type: 'warning',
          duration: 0
        })
        return
      }

      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      this.reconnectAttempts += 1

      reconnectTimeout = setTimeout(() => {
        this.initializeSSE()
      }, delay)
    },

    initializeSSE() {
      clearReconnectTimeout()

      if (!this.userId || this.isConnecting || this.isConnected) {
        return
      }

      const authorization = normalizeAuthToken(this.token)
      if (!authorization) {
        return
      }

      closeEventSource()
      this.isConnecting = true

      try {
        eventSource = new EventSourcePolyfill(getSseSubscribeUrl(this.userId), {
          headers: {
            Authorization: authorization
          },
          heartbeatTimeout: HEARTBEAT_TIMEOUT,
          connectionTimeout: CONNECTION_TIMEOUT
        })

        eventSource.onopen = () => {
          this.isConnecting = false
          this.isConnected = true
          this.reconnectAttempts = 0
        }

        eventSource.addEventListener('heartbeat', () => {
          this.isConnected = true
        })

        eventSource.addEventListener('connect', (event) => {
          this.isConnected = true
          this.reconnectAttempts = 0
          showNotification(parseEventPayload(event))
        })

        eventSource.onmessage = (event) => {
          this.isConnected = true
          showNotification(parseEventPayload(event))
        }

        eventSource.onerror = (error) => {
          console.error('SSE 连接错误:', error)
          this.isConnecting = false
          this.isConnected = false
          closeEventSource()
          this.scheduleReconnect()
        }
      } catch (error) {
        console.error('SSE 连接失败:', error)
        this.isConnecting = false
        this.isConnected = false
        closeEventSource()
        this.scheduleReconnect()
      }
    },

    closeSSE() {
      clearReconnectTimeout()
      closeEventSource()
      this.isConnecting = false
      this.isConnected = false
      this.reconnectAttempts = 0
    },

    checkConnection() {
      return {
        userPin: this.userPin,
        userId: this.userId,
        isConnecting: this.isConnecting,
        isConnected: this.isConnected,
        hasController: !!eventSource
      }
    },

    setUserInfo(userInfo) {
      const sanitizedUserInfo = sanitizeUserInfo(userInfo)
      if (!sanitizedUserInfo) {
        console.error('无效的用户信息，无法保存登录状态')
        return
      }

      this.userPin = sanitizedUserInfo.userPin
      this.userId = sanitizedUserInfo.userId
      this.username = sanitizedUserInfo.username
      this.token = sanitizedUserInfo.token

      localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(sanitizedUserInfo))
      this.closeSSE()
      this.initializeSSE()
    },

    clearUserInfo() {
      this.closeSSE()
      this.userPin = null
      this.userId = null
      this.username = ''
      this.token = null
      localStorage.removeItem(USER_INFO_STORAGE_KEY)
    },

    initializeFromStorage() {
      const parsedInfo = parseStoredUserInfo(localStorage.getItem(USER_INFO_STORAGE_KEY))

      if (!parsedInfo) {
        localStorage.removeItem(USER_INFO_STORAGE_KEY)
        return
      }

      this.userPin = parsedInfo.userPin
      this.userId = parsedInfo.userId
      this.username = parsedInfo.username
      this.token = parsedInfo.token
      this.initializeSSE()
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.token
  }
})
