import request from '@/utils/axios'
import { mapCategoryDto, mapCategoryPayload } from '@/api/mappers/categoryMapper'

const mapCategoryList = (payload) => {
  return Array.isArray(payload) ? payload.map(mapCategoryDto) : []
}

export const fetchLedgerCategories = async (ledgerId) => {
  const [expenseResponse, incomeResponse] = await Promise.all([
    request.get(`/ledgers/${ledgerId}/categories`, { params: { type: 'expense' } }),
    request.get(`/ledgers/${ledgerId}/categories`, { params: { type: 'income' } })
  ])

  return [
    ...mapCategoryList(expenseResponse.data),
    ...mapCategoryList(incomeResponse.data)
  ]
}

export const createLedgerCategory = async (ledgerId, category, type) => {
  const response = await request.post(`/ledgers/${ledgerId}/categories`, mapCategoryPayload(category, type))
  return mapCategoryDto(response.data)
}

export const deleteLedgerCategory = async (ledgerId, categoryId) => {
  await request.delete(`/ledgers/${ledgerId}/categories/${categoryId}`)
}
