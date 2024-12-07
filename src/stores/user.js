import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    username: '',
    token: null
  }),

  actions: {
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
    },

    clearUserInfo() {
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
      }
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.token
  }
}) 