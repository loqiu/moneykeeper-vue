import { downloadExcelFile } from '@/api/modules/excel'

export const downloadExcel = async (userId, options = {}) => {
  const fileData = await downloadExcelFile(userId)
  const blob = new Blob([fileData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const {
    locale = 'zh-CN',
    filenamePrefix = '记账记录'
  } = options

  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  const safeDate = new Date().toLocaleDateString(locale).replace(/[\\/]/g, '-')
  link.download = `${filenamePrefix}_${safeDate}.xlsx`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(link.href)
}
