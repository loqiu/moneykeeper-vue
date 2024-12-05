import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    username: null,
    isLoggedIn: false
  }),
  actions: {
    setUserInfo(userInfo) {
      this.userId = Number(userInfo.userId)
      this.username = userInfo.username
      this.isLoggedIn = true
    },
    clearUserInfo() {
      this.userId = null
      this.username = null
      this.isLoggedIn = false
    }
  },
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['userId', 'username', 'isLoggedIn']
  }
}) 