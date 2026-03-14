const LEGACY_EXPENSE_TYPE = '\u652f\u51fa'
const LEGACY_INCOME_TYPE = '\u6536\u5165'
const API_EXPENSE_TYPE = 'expense'
const API_INCOME_TYPE = 'income'

export const toFrontendRecordType = (type) => {
  if (type === LEGACY_EXPENSE_TYPE || type === API_EXPENSE_TYPE) {
    return API_EXPENSE_TYPE
  }

  if (type === LEGACY_INCOME_TYPE || type === API_INCOME_TYPE) {
    return API_INCOME_TYPE
  }

  return API_EXPENSE_TYPE
}

export const toBackendRecordType = (type) => {
  return type === API_INCOME_TYPE || type === LEGACY_INCOME_TYPE
    ? API_INCOME_TYPE
    : API_EXPENSE_TYPE
}
