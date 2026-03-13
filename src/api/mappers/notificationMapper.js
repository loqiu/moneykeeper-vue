export const mapNotificationLogDto = (notification = {}) => ({
  id: notification.id,
  userId: notification.userId,
  title: notification.title || '',
  message: notification.message || '',
  type: notification.type || 'info',
  channel: notification.channel || 'sse',
  status: notification.status || 'sent',
  read: Boolean(notification.read),
  readAt: notification.readAt || '',
  createdAt: notification.createdAt || '',
  updatedAt: notification.updatedAt || ''
})

export const mapUnreadCountDto = (payload = {}) => ({
  unreadCount: Number(payload.unreadCount) || 0
})

export const mapMarkedResultDto = (payload = {}) => ({
  markedCount: Number(payload.markedCount) || 0
})
