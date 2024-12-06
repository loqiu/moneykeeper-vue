import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL

export const downloadExcel = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/excel/download/${userId}`, {
      responseType: 'blob'
    })
    
    // 创建 Blob 对象
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `记账记录_${new Date().toLocaleDateString()}.xlsx`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('下载Excel失败:', error)
    throw error
  }
} 