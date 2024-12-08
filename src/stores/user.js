import { defineStore } from 'pinia'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { ElNotification } from 'element-plus'

let reconnectTimeout = null

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    username: '',
    token: null,
    controller: null,
    isConnecting: false,
    isConnected: false  // 添加连接成功标志
  }),

  actions: {
    async initializeSSE() {
      // 清除之前的重连定时器
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }

      if (this.userId && !this.isConnecting && !this.isConnected) {
        console.log('初始化SSE连接')
        const token = this.token
        
        if (this.controller) {
          this.closeSSE()
        }
        
        this.controller = new AbortController()
        this.isConnecting = true
        
        try {
          await fetchEventSource(
            `/api/notifications/subscribe/${this.userId}`, {
              headers: {
                'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
              },
              signal: this.controller.signal,
              credentials: 'include',
              onmessage: (event) => {
                this.checkConnection()
                try {
                  // 尝试解析JSON
                  const data = JSON.parse(event.data)
                  console.log('收到SSE消息(JSON):', data)
                  
                  // 显示通知
                  ElNotification({
                    title: data.title || '新消息',
                    message: data.message || data.toString(),
                    type: data.type || 'info',
                    position: 'top-right',
                    duration: 4500
                  })
                } catch (e) {
                  console.error('消息解析失败:', e, '原始消息:', event.data);
                  ElNotification({
                    title: '新消息',
                    message: event.data,
                    type: 'info',
                    position: 'top-right',
                    duration: 4500
                  })
                }
              },
              onopen: async (response) => {
                if (response.ok) {
                  console.log('SSE连接已建立, 状态码:', response.status)
                  this.isConnecting = false
                  this.isConnected = true  // 标记连接成功
                } else {
                  console.log('SSE连接失败, 状态码:', response.status)
                  this.isConnecting = false
                  this.isConnected = false
                  throw new Error(`服务器返回 ${response.status} ${response.statusText}`)
                }
              },
              onerror: (err) => {
                console.error('SSE连接错误, 详细信息:', err)
                this.isConnecting = false
                this.isConnected = false
                
                // 如果是 AbortError，说明是主动中断，不需要重连
                if (err.name !== 'AbortError' && this.userId) {
                  reconnectTimeout = setTimeout(() => {
                    this.initializeSSE()
                  }, 5000)
                }
                // 不抛出错误，而是正常处理
                return
              }
            }
          )
        } catch (err) {
          console.error('SSE连接失败, 详细错误:', err)
          this.isConnecting = false
          this.isConnected = false
          
          // 只在非主动中断且用户仍在登录状态时重试
          if (err.name !== 'AbortError' && this.userId && !this.isConnected) {
            reconnectTimeout = setTimeout(() => {
              this.initializeSSE()
            }, 5000)
          }
        }
      }
    },

    checkConnection() {
      console.log('SSE连接状态:', {
        userId: this.userId,
        isConnecting: this.isConnecting,
        isConnected: this.isConnected,
        hasController: !!this.controller
      })
    },

    closeSSE() {
      // 清除重连定时器
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
      
      if (this.controller) {
        this.controller.abort()
        this.controller = null
      }
      this.isConnecting = false
      this.isConnected = false
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