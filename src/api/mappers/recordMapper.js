import { toBackendRecordType, toFrontendRecordType } from '@/api/mappers/recordType'

export const mapRecordDto = (record = {}) => ({
  id: record.id,
  type: toFrontendRecordType(record.type),
  amount: Number(record.amount ?? 0),
  categoryId: record.categoryId ?? null,
  categoryName: record.categoryName || '',
  date: record.transactionDate || '',
  note: record.notes || ''
})

export const mapRecordPayload = (userId, record = {}) => ({
  ...(typeof userId !== 'undefined' ? { userId } : {}),
  categoryId: Number(record.categoryId),
  type: toBackendRecordType(record.type),
  amount: Number(record.amount),
  transactionDate: record.date,
  notes: record.note || ''
})

export const mapRecordSummary = (summary = {}) => ({
  totalIncome: Number(summary.totalIncome ?? 0),
  totalExpense: Number(summary.totalExpense ?? 0),
  balance: Number(summary.balance ?? 0)
})
