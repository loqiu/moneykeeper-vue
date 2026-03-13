import request from '@/utils/axios'
import { mapRecordDto, mapRecordPayload, mapRecordSummary } from '@/api/mappers/recordMapper'

const mapRecordList = (payload) => {
  return Array.isArray(payload) ? payload.map(mapRecordDto) : []
}

export const fetchLedgerRecords = async (ledgerId, params = {}) => {
  const response = await request.get(`/ledgers/${ledgerId}/records`, { params })
  return mapRecordList(response.data)
}

export const fetchLedgerRecordsSummary = async (ledgerId, params = {}) => {
  const response = await request.get(`/ledgers/${ledgerId}/records/summary`, { params })
  return mapRecordSummary(response.data)
}

export const createLedgerRecord = async (ledgerId, userId, record) => {
  const response = await request.post(`/ledgers/${ledgerId}/records`, mapRecordPayload(userId, record))
  return mapRecordDto(response.data)
}

export const updateLedgerRecord = async (ledgerId, recordId, record) => {
  const response = await request.put(`/ledgers/${ledgerId}/records/${recordId}`, mapRecordPayload(undefined, record))
  return mapRecordDto(response.data)
}

export const deleteLedgerRecord = async (ledgerId, recordId) => {
  await request.delete(`/ledgers/${ledgerId}/records/${recordId}`)
}
