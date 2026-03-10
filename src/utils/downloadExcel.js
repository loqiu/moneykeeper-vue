import { downloadExcelFile } from '@/api/modules/excel'

export const downloadExcel = async (userId) => {
  const fileData = await downloadExcelFile(userId)
  const blob = new Blob([fileData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `记账记录_${new Date().toLocaleDateString()}.xlsx`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(link.href)
}
