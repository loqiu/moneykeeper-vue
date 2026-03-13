const toNumber = (value, fallback = 0) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : fallback
}

const toNullableNumber = (value) => {
  if (value === null || typeof value === 'undefined') {
    return null
  }

  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : null
}

export const mapStatisticsBucketDto = (bucket = {}) => ({
  bucketKey: bucket.bucketKey || '',
  label: bucket.label || '',
  startDate: bucket.startDate || '',
  endDate: bucket.endDate || '',
  totalIncome: toNumber(bucket.totalIncome),
  totalExpense: toNumber(bucket.totalExpense),
  balance: toNumber(bucket.balance),
  recordCount: toNumber(bucket.recordCount)
})

export const mapStatisticsCategoryDto = (category = {}) => ({
  categoryId: category.categoryId ?? null,
  categoryName: category.categoryName || '',
  type: category.type || '',
  totalAmount: toNumber(category.totalAmount),
  percentage: toNumber(category.percentage),
  recordCount: toNumber(category.recordCount)
})

export const mapLedgerStatisticsDto = (stats = {}) => ({
  ledgerId: stats.ledgerId,
  userId: stats.userId ?? null,
  period: stats.period || 'month',
  bucketGranularity: stats.bucketGranularity || 'day',
  anchorDate: stats.anchorDate || '',
  startDate: stats.startDate || '',
  endDate: stats.endDate || '',
  previousStartDate: stats.previousStartDate || '',
  previousEndDate: stats.previousEndDate || '',
  totalIncome: toNumber(stats.totalIncome),
  totalExpense: toNumber(stats.totalExpense),
  balance: toNumber(stats.balance),
  recordCount: toNumber(stats.recordCount),
  incomeRecordCount: toNumber(stats.incomeRecordCount),
  expenseRecordCount: toNumber(stats.expenseRecordCount),
  incomeDelta: toNumber(stats.incomeDelta),
  expenseDelta: toNumber(stats.expenseDelta),
  balanceDelta: toNumber(stats.balanceDelta),
  incomeChangePercentage: toNullableNumber(stats.incomeChangePercentage),
  expenseChangePercentage: toNullableNumber(stats.expenseChangePercentage),
  balanceChangePercentage: toNullableNumber(stats.balanceChangePercentage),
  buckets: Array.isArray(stats.buckets) ? stats.buckets.map(mapStatisticsBucketDto) : [],
  expenseCategories: Array.isArray(stats.expenseCategories) ? stats.expenseCategories.map(mapStatisticsCategoryDto) : [],
  incomeCategories: Array.isArray(stats.incomeCategories) ? stats.incomeCategories.map(mapStatisticsCategoryDto) : []
})
