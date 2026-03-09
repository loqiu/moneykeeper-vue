import request from '@/utils/axios'

export const downloadExcelFile = async (userId) => {
  const response = await request.get(`/excel/download/${userId}`, {
    responseType: 'blob'
  })

  return response.data
}
