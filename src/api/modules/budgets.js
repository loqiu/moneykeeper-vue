import request from '@/utils/axios'
import { unwrapMkApiResponse } from '@/api/response'
import {
  mapBudgetDto,
  mapBudgetPayload,
  mapBudgetRulePayload
} from '@/api/mappers/budgetMapper'

const mapBudgetList = (payload) => {
  return Array.isArray(payload) ? payload.map(mapBudgetDto) : []
}

export const fetchLedgerBudgets = async (ledgerId, params = {}) => {
  const response = await request.get(`/ledgers/${ledgerId}/budgets`, { params })
  return mapBudgetList(unwrapMkApiResponse(response, '获取预算列表失败'))
}

export const createLedgerBudget = async (ledgerId, budget) => {
  const response = await request.post(`/ledgers/${ledgerId}/budgets`, mapBudgetPayload(budget))
  return mapBudgetDto(unwrapMkApiResponse(response, '创建预算失败'))
}

export const deleteLedgerBudget = async (ledgerId, budgetId) => {
  const response = await request.delete(`/ledgers/${ledgerId}/budgets/${budgetId}`)
  unwrapMkApiResponse(response, '删除预算失败', { allowUndefinedData: true })
}

export const createLedgerBudgetRule = async (ledgerId, budgetId, rule) => {
  const response = await request.post(
    `/ledgers/${ledgerId}/budgets/${budgetId}/rules`,
    mapBudgetRulePayload(rule)
  )

  return unwrapMkApiResponse(response, '创建预算规则失败', { allowUndefinedData: true })
}

export const deleteLedgerBudgetRule = async (ledgerId, budgetId, ruleId) => {
  const response = await request.delete(`/ledgers/${ledgerId}/budgets/${budgetId}/rules/${ruleId}`)
  unwrapMkApiResponse(response, '删除预算规则失败', { allowUndefinedData: true })
}
