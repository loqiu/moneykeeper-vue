import { resolveNotificationContent } from '@/i18n/messageResolver'

const normalizePayload = (payload) => {
  return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}
}

export const mapNotificationLogDto = (notification = {}) => {
  const payload = normalizePayload(notification.payload)
  const content = resolveNotificationContent({
    eventKey: notification.eventKey,
    payload,
    title: notification.title || '',
    message: notification.message || ''
  })

  return {
    id: notification.id,
    userId: notification.userId,
    title: content.title,
    message: content.message,
    type: notification.type || 'info',
    channel: notification.channel || 'sse',
    status: notification.status || 'sent',
    read: Boolean(notification.read),
    readAt: notification.readAt || '',
    createdAt: notification.createdAt || '',
    updatedAt: notification.updatedAt || '',
    eventKey: notification.eventKey || '',
    payload
  }
}

export const mapUnreadCountDto = (payload = {}) => ({
  unreadCount: Number(payload.unreadCount) || 0
})

export const mapMarkedResultDto = (payload = {}) => ({
  markedCount: Number(payload.markedCount) || 0
})

export const mapRealtimeNotificationPayload = (notification = {}) => {
  const payload = normalizePayload(notification.payload)
  const content = resolveNotificationContent({
    eventKey: notification.eventKey,
    payload,
    title: notification.title || '',
    message: notification.message || ''
  })

  return {
    title: content.title,
    message: content.message,
    type: notification.type || 'info',
    eventKey: notification.eventKey || '',
    payload
  }
}
