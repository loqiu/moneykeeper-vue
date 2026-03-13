import request from '@/utils/axios'
import { mapSearchResultDto } from '@/api/mappers/searchMapper'

const mapSearchResultList = (payload) => {
  return Array.isArray(payload) ? payload.map(mapSearchResultDto) : []
}

export const searchLedgerRecords = async (ledgerId, params = {}) => {
  const response = await request.get(`/ledgers/${ledgerId}/search/records`, { params })
  return mapSearchResultList(response.data)
}
