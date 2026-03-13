import request from '@/utils/axios'
import { mapLedgerStatisticsDto } from '@/api/mappers/statisticsMapper'

export const fetchLedgerStatistics = async (ledgerId, params = {}) => {
  const response = await request.get(`/ledgers/${ledgerId}/statistics`, { params })
  return mapLedgerStatisticsDto(response.data)
}
