import request from '@/utils/axios'
import { mapRecordDto, mapRecordPayload, mapRecordSummary } from '@/api/mappers/recordMapper'

export const fetchRecordsWithCategoryName = async (userId, params = {}) => {
  const response = await request.get(`/records/listWithCategoryName/${userId}`, { params })
  return Array.isArray(response.data) ? response.data.map(mapRecordDto) : []
}

export const fetchRecordsSummary = async (userId, params = {}) => {
  const response = await request.get(`/records/summary/${userId}`, { params })
  return mapRecordSummary(response.data)
}

export const createRecord = async (userId, record) => {
  const response = await request.post('/records', mapRecordPayload(userId, record))
  return response.data
}

export const updateRecord = async (recordId, record) => {
  const response = await request.put(`/records/${recordId}`, mapRecordPayload(undefined, record))
  return response.data
}

export const deleteRecord = async (recordId) => {
  await request.delete(`/records/${recordId}`)
}
