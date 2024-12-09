import { defineStore } from 'pinia'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { ElNotification } from 'element-plus'

let eventSource = null
let reconnectTimeout = null

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    username: '',
    token: null,
    isConnecting: false,
    isConnected: false,
    reconnectAttempts: 0
  }),

  actions: {
    async initializeSSE() {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }

      if (this.userId && !this.isConnecting && !this.isConnected) {
        console.log('初始化SSE连接')
        const token = this.token
        
        if (eventSource) {
          this.closeSSE()
        }
        
        this.isConnecting = true
        
        try {
          const url = `/api/notifications/subscribe/${this.userId}`
          const options = {
            headers: {
              'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            },
            withCredentials: true,
            // 心跳时间设置为1小时
            heartbeatTimeout: 3600000,
            connectionTimeout: 60000
          }
          
          eventSource = new EventSourcePolyfill(url, options)

          eventSource.onopen = (event) => {
            console.log('收到SSE消息:', event.data)
            console.log('SSE连接已建立')
            this.isConnecting = false
            this.isConnected = true
            this.reconnectAttempts = 0
          }

          eventSource.onmessage = (event) => {
            this.checkConnection()
            try {
              console.log('收到SSE消息:', event.data)
              if (event.type === 'HEARTBEAT') {
                console.log('收到心跳消息:', event.data)
                return
              }
              
              if (event.type === 'CONNECT') {
                console.log('收到连接成功消息:', event.data)
                return
              }
              
              const data = JSON.parse(event.data)
              console.log('收到SSE消息(JSON):', data)
              
              ElNotification({
                title: data.title || '新消息',
                message: data.message || data.toString(),
                type: data.type || 'info',
                position: 'top-right',
                duration: 4500
              })
            } catch (e) {
              console.error('消息解析失败:', e, '原始消息:', event.data)
              if (event.data !== 'ping') {
                ElNotification({
                  title: '新消息',
                  message: event.data,
                  type: 'info',
                  position: 'top-right',
                  duration: 4500
                })
              }
            }
          }

          eventSource.onerror = (err) => {
            console.error('SSE连接错误:', err)
            this.isConnecting = false
            this.isConnected = false
            
            if (eventSource) {
              eventSource.close()
              eventSource = null
            }

            if (this.userId && this.reconnectAttempts < 5) {
              const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
              this.reconnectAttempts++
              console.log(`第 ${this.reconnectAttempts} 次重连尝试，等待 ${delay/1000} 秒`)
              
              reconnectTimeout = setTimeout(() => {
                this.initializeSSE()
              }, delay)
            } else if (this.reconnectAttempts >= 5) {
              console.log('达到最大重连次数，停止重连')
              ElNotification({
                title: '连接提示',
                message: '与服务器的连接已断开，请刷新页面重试',
                type: 'warning',
                duration: 0
              })
            }
          }
        } catch (err) {
          console.error('SSE连接失败:', err)
          this.isConnecting = false
          this.isConnected = false
          
          if (this.userId && !this.isConnected && this.reconnectAttempts < 5) {
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
            this.reconnectAttempts++
            
            reconnectTimeout = setTimeout(() => {
              this.initializeSSE()
            }, delay)
          }
        }
      }
    },

    closeSSE() {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
      
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      this.isConnecting = false
      this.isConnected = false
      this.reconnectAttempts = 0
    },

    checkConnection() {
      console.log('SSE连接状态:', {
        userId: this.userId,
        isConnecting: this.isConnecting,
        isConnected: this.isConnected,
        hasController: !!eventSource
      })
    },

    setUserInfo(userInfo) {
      this.userId = Number(userInfo.userId)
      this.username = userInfo.username
      this.token = userInfo.token
      // 保存用户信息到localStorage
      localStorage.setItem('userInfo', JSON.stringify({
        userId: this.userId,
        username: this.username,
        token: this.token
      }))
      // 确保之前的连接已关闭
      this.closeSSE()
      // 初始化新连接
      this.initializeSSE()
    },

    clearUserInfo() {
      // 登出时关闭SSE连接
      this.closeSSE()
      this.userId = null
      this.username = ''
      this.token = null
      localStorage.removeItem('userInfo')
    },

    // 初始化时从localStorage恢复用户信息
    initializeFromStorage() {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        const parsedInfo = JSON.parse(userInfo)
        this.userId = Number(parsedInfo.userId)
        this.username = parsedInfo.username
        this.token = parsedInfo.token
        // 从存储恢复后初始化SSE连接
        this.initializeSSE()
      }
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.token
  }
}) 