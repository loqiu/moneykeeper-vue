import { defineStore } from 'pinia'
import {
  fetchNotificationLogs,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from '@/api/modules/notifications'
import { getApiErrorMessage } from '@/api/response'

const sortByCreatedAtDesc = (items = []) => {
  return [...items].sort((left, right) => {
    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  })
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    items: [],
    unreadCount: 0,
    isLoading: false,
    isSyncingUnreadCount: false,
    errorMessage: '',
    initialized: false
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0
  },

  actions: {
    resetNotificationState() {
      this.items = []
      this.unreadCount = 0
      this.isLoading = false
      this.isSyncingUnreadCount = false
      this.errorMessage = ''
      this.initialized = false
    },

    async initializeUnreadCount({ force = false } = {}) {
      if (this.initialized && !force) {
        return
      }

      this.isSyncingUnreadCount = true

      try {
        const payload = await fetchUnreadNotificationCount()
        this.unreadCount = payload.unreadCount
        this.initialized = true
      } catch (error) {
        this.errorMessage = getApiErrorMessage(error, '获取未读通知数量失败')
      } finally {
        this.isSyncingUnreadCount = false
      }
    },

    async fetchNotifications(filters = {}) {
      this.isLoading = true
      this.errorMessage = ''

      try {
        this.items = sortByCreatedAtDesc(await fetchNotificationLogs(filters))
        return this.items
      } catch (error) {
        this.errorMessage = getApiErrorMessage(error, '获取通知列表失败')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async refreshUnreadCount(type) {
      try {
        const payload = await fetchUnreadNotificationCount(type ? { type } : {})
        this.unreadCount = payload.unreadCount
      } catch (error) {
        this.errorMessage = getApiErrorMessage(error, '刷新未读通知失败')
      }
    },

    async markAsRead(notificationId) {
      const updated = await markNotificationRead(notificationId)
      this.items = this.items.map((item) => (item.id === notificationId ? updated : item))
      if (this.unreadCount > 0 && updated.read) {
        this.unreadCount -= 1
      }
      return updated
    },

    async markAllAsRead(type) {
      const result = await markAllNotificationsRead(type ? { type } : {})
      if (type) {
        this.items = this.items.map((item) => (item.type === type ? { ...item, read: true } : item))
      } else {
        this.items = this.items.map((item) => ({ ...item, read: true }))
      }
      this.unreadCount = Math.max(0, this.unreadCount - result.markedCount)
      return result
    },

    handleIncomingNotification(payload) {
      if (!payload || !payload.type || payload.type === 'heartbeat' || payload.type === 'connect') {
        return
      }

      const transientNotification = {
        id: `live-${Date.now()}`,
        userId: null,
        title: payload.title || '新通知',
        message: payload.message || '',
        type: payload.type || 'info',
        channel: 'sse',
        status: 'sent',
        read: false,
        readAt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      this.items = sortByCreatedAtDesc([transientNotification, ...this.items])
      this.unreadCount += 1
      this.initialized = true
    }
  }
})
