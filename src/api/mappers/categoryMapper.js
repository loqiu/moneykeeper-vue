import { toBackendRecordType, toFrontendRecordType } from '@/api/mappers/recordType'

export const mapCategoryDto = (category = {}) => ({
  id: category.id,
  name: category.name || '',
  icon: category.icon || '',
  bgColor: category.color || category.bgColor || '',
  type: toFrontendRecordType(category.type)
})

export const mapCategoryPayload = (category = {}, type = 'expense') => ({
  name: category.name,
  icon: category.icon,
  color: category.color || category.bgColor,
  type: toBackendRecordType(type)
})

export const splitCategoriesByType = (categories = []) => ({
  expenseCategories: categories.filter(category => category.type === 'expense'),
  incomeCategories: categories.filter(category => category.type === 'income')
})
