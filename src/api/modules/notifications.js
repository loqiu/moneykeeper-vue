import request from '@/utils/axios'
import {
  mapMarkedResultDto,
  mapNotificationLogDto,
  mapUnreadCountDto
} from '@/api/mappers/notificationMapper'

const mapNotificationList = (payload) => {
  return Array.isArray(payload) ? payload.map(mapNotificationLogDto) : []
}

export const fetchNotificationLogs = async (params = {}) => {
  const response = await request.get('/notifications/logs', { params })
  return mapNotificationList(response.data)
}

export const fetchUnreadNotificationCount = async (params = {}) => {
  const response = await request.get('/notifications/logs/unread-count', { params })
  return mapUnreadCountDto(response.data)
}

export const markNotificationRead = async (notificationId) => {
  const response = await request.put(`/notifications/logs/${notificationId}/read`)
  return mapNotificationLogDto(response.data)
}

export const markAllNotificationsRead = async (params = {}) => {
  const response = await request.put('/notifications/logs/read-all', null, { params })
  return mapMarkedResultDto(response.data)
}
