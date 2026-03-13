import { toBackendRecordType, toFrontendRecordType } from '@/api/mappers/recordType'

const toNumber = (value, fallback = 0) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : fallback
}

export const mapBudgetRuleDto = (rule = {}) => ({
  id: rule.id,
  thresholdPercentage: toNumber(rule.thresholdPercentage),
  enabled: rule.enabled !== false,
  notificationTitle: rule.notificationTitle || '',
  notificationMessage: rule.notificationMessage || ''
})

export const mapBudgetProgress = (progress = {}) => ({
  spentAmount: toNumber(progress.spentAmount),
  remainingAmount: toNumber(progress.remainingAmount),
  usagePercentage: toNumber(progress.usagePercentage),
  exceeded: Boolean(progress.exceeded),
  triggeredThresholdPercentages: Array.isArray(progress.triggeredThresholdPercentages)
    ? progress.triggeredThresholdPercentages.map((item) => toNumber(item))
    : []
})

export const mapBudgetDto = (budget = {}) => ({
  id: budget.id,
  ledgerId: budget.ledgerId,
  name: budget.name || '',
  categoryId: budget.categoryId ?? null,
  categoryName: budget.categoryName || '',
  type: toFrontendRecordType(budget.type),
  amount: toNumber(budget.amount),
  budgetYear: toNumber(budget.budgetYear),
  budgetMonth: toNumber(budget.budgetMonth),
  startDate: budget.startDate || '',
  endDate: budget.endDate || '',
  notes: budget.notes || '',
  progress: mapBudgetProgress(budget.progress || {}),
  rules: Array.isArray(budget.rules) ? budget.rules.map(mapBudgetRuleDto) : []
})

export const mapBudgetPayload = (budget = {}) => {
  const payload = {
    name: budget.name?.trim(),
    type: toBackendRecordType(budget.type),
    amount: toNumber(budget.amount),
    budgetYear: toNumber(budget.budgetYear),
    budgetMonth: toNumber(budget.budgetMonth),
    notes: budget.notes?.trim() || ''
  }

  if (budget.categoryId) {
    payload.categoryId = Number(budget.categoryId)
  }

  return payload
}

export const mapBudgetRulePayload = (rule = {}) => ({
  thresholdPercentage: toNumber(rule.thresholdPercentage),
  enabled: rule.enabled !== false,
  notificationTitle: rule.notificationTitle?.trim() || '',
  notificationMessage: rule.notificationMessage?.trim() || ''
})
