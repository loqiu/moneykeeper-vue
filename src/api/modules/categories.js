import request from '@/utils/axios'
import { mapCategoryDto, mapCategoryPayload } from '@/api/mappers/categoryMapper'

export const fetchUserCategories = async (userId) => {
  const response = await request.get(`/categories/user/${userId}`)
  return Array.isArray(response.data) ? response.data.map(mapCategoryDto) : []
}

export const createCategory = async (userId, category, type) => {
  const response = await request.post(`/categories/${userId}`, mapCategoryPayload(category, type))
  return mapCategoryDto(response.data)
}

export const deleteCategory = async (categoryId) => {
  await request.delete(`/categories/${categoryId}`)
}
