import { toFrontendRecordType } from '@/api/mappers/recordType'

export const mapExportJobDto = (job = {}) => ({
  id: job.id,
  ledgerId: job.ledgerId,
  requestedByUserId: job.requestedByUserId,
  targetUserId: job.targetUserId ?? null,
  recordType: job.recordType ? toFrontendRecordType(job.recordType) : '',
  startDate: job.startDate || '',
  endDate: job.endDate || '',
  fileName: job.fileName || '',
  fileFormat: job.fileFormat || 'xlsx',
  status: job.status || 'pending',
  errorMessage: job.errorMessage || '',
  recordCount: Number(job.recordCount) || 0,
  downloadCount: Number(job.downloadCount) || 0,
  startedAt: job.startedAt || '',
  completedAt: job.completedAt || '',
  lastDownloadedAt: job.lastDownloadedAt || '',
  createdAt: job.createdAt || '',
  updatedAt: job.updatedAt || '',
  downloadUrl: job.downloadUrl || ''
})

export const mapExportJobPayload = (payload = {}) => {
  const requestBody = {}

  if (payload.userId) {
    requestBody.userId = Number(payload.userId)
  }

  if (payload.type) {
    requestBody.type = payload.type
  }

  if (payload.startDate) {
    requestBody.startDate = payload.startDate
  }

  if (payload.endDate) {
    requestBody.endDate = payload.endDate
  }

  return requestBody
}
