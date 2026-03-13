const BACKEND_EXPENSE_TYPE = '\u652f\u51fa'
const BACKEND_INCOME_TYPE = '\u6536\u5165'

export const toFrontendRecordType = (type) => {
  if (type === BACKEND_EXPENSE_TYPE || type === 'expense') {
    return 'expense'
  }

  if (type === BACKEND_INCOME_TYPE || type === 'income') {
    return 'income'
  }

  return 'expense'
}

export const toBackendRecordType = (type) => {
  return type === 'income' ? BACKEND_INCOME_TYPE : BACKEND_EXPENSE_TYPE
}
