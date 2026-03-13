import request from '@/utils/axios'
import { mapExportJobDto, mapExportJobPayload } from '@/api/mappers/exportJobMapper'

const mapJobList = (payload) => {
  return Array.isArray(payload) ? payload.map(mapExportJobDto) : []
}

const parseContentDispositionFilename = (headerValue = '') => {
  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const quotedMatch = headerValue.match(/filename="([^"]+)"/i)
  if (quotedMatch?.[1]) {
    return quotedMatch[1]
  }

  const plainMatch = headerValue.match(/filename=([^;]+)/i)
  if (plainMatch?.[1]) {
    return plainMatch[1].trim()
  }

  return ''
}

export const createLedgerExportJob = async (ledgerId, payload = {}) => {
  const response = await request.post(`/ledgers/${ledgerId}/export-jobs`, mapExportJobPayload(payload))
  return mapExportJobDto(response.data)
}

export const fetchLedgerExportJobs = async (ledgerId, params = {}) => {
  const response = await request.get(`/ledgers/${ledgerId}/export-jobs`, { params })
  return mapJobList(response.data)
}

export const fetchLedgerExportJob = async (ledgerId, jobId) => {
  const response = await request.get(`/ledgers/${ledgerId}/export-jobs/${jobId}`)
  return mapExportJobDto(response.data)
}

export const downloadLedgerExportJob = async (ledgerId, jobId) => {
  const response = await request.get(`/ledgers/${ledgerId}/export-jobs/${jobId}/download`, {
    responseType: 'blob'
  })

  return {
    blob: response.data,
    filename: parseContentDispositionFilename(response.headers['content-disposition'])
  }
}
