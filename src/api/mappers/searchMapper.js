import { toFrontendRecordType } from '@/api/mappers/recordType'

export const mapSearchResultDto = (record = {}) => ({
  id: record.id,
  ledgerId: record.ledgerId,
  userId: record.userId,
  categoryId: record.categoryId ?? null,
  categoryName: record.categoryName || '',
  type: toFrontendRecordType(record.type),
  amount: Number(record.amount ?? 0),
  transactionDate: record.transactionDate || '',
  updatedAt: record.updatedAt || '',
  notes: record.notes || '',
  score: typeof record.score === 'number' ? record.score : Number(record.score ?? 0)
})
