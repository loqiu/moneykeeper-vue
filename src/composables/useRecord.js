import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { downloadExcel } from '@/utils/downloadExcel'

export function useRecord() {
  const userStore = useUserStore()
  const { userId } = storeToRefs(userStore)
  const API_URL = process.env.VUE_APP_API_URL

  // 响应式数据
  const records = ref([])
  const loading = ref(false)
  const timeUnit = ref('month')
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 新记录表单
  const newRecord = ref({
    type: 'expense',
    amount: 0,
    category: '',
    categoryName: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  })

  // 编辑相关
  const editingRecord = ref(null)
  const showEditDialog = computed({
    get: () => editingRecord.value !== null,
    set: (value) => { if (!value) editingRecord.value = null }
  })

  // 获取记录列表
  const fetchRecords = async () => {
    if (!userId.value) {
      console.warn('No userId available')
      return
    }

    loading.value = true
    try {
      const response = await axios.get(`${API_URL}/records/listWithCategoryName`, {
        params: {
          userId: userId.value
        }
      })
      if (response.data) {
        // 转换后端数据格式为前端所需格式
        records.value = response.data.map(record => ({
          id: record.id,
          type: record.type === '支出' ? 'expense' : 'income',
          amount: record.amount,
          category: record.categoryName,
          date: record.transactionDate,
          note: record.notes
        }))

        // 设置总数
        pagination.value.total = records.value.length

        // 手动处理分页
        const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
        const end = start + pagination.value.pageSize
        records.value = records.value.slice(start, end)
      }
    } catch (error) {
      console.error('获取记录列表失败:', error)
      ElMessage.error('获取记录列表失败')
      records.value = []
      pagination.value.total = 0
    } finally {
      loading.value = false
    }
  }

  // 添加记录
  const addRecord = async (record) => {
    console.log('record: ', JSON.stringify(record))
    if (!record.amount || !record.category) {
      ElMessage.warning('请填写完整的记账信息')
      return
    }

    try {
      const response = await axios.post(`${API_URL}/records`, {
        userId: userId.value,
        categoryId: Number(record.category),
        type: record.type === 'expense' ? '支出' : '收入',
        amount: Number(record.amount),
        transactionDate: record.date,
        notes: record.note || ''
      })

      if (response.data) {
        await fetchRecords()
        // 清空表单
        newRecord.value = {
          type: 'expense',
          amount: 0,
          category: '',
          categoryName: '',
          note: '',
          date: new Date().toISOString().split('T')[0]
        }
        ElMessage.success('添加成功')
      }
    } catch (error) {
      console.error('添加记录失败:', error)
      ElMessage.error('添加失败')
    }
  }

  // 删除记录
  const deleteRecord = async (id) => {
    try {
      // 确保 recordId 是数字类型
      const recordId = Number(id)
      if (isNaN(recordId)) {
        throw new Error('Invalid record ID')
      }

      await ElMessageBox.confirm(
        '确定要删除这条记录吗？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await axios.delete(`${API_URL}/records/${recordId}`)
      await fetchRecords()
      ElMessage.success('删除成功')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除记录失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  // 编辑记录相关方法
  const startEdit = (record) => {
    editingRecord.value = { ...record }
  }

  const cancelEdit = () => {
    editingRecord.value = null
  }
  // 保存修改
  const saveEdit = async () => {
    if (!editingRecord.value) return

    if (!editingRecord.value.amount || !editingRecord.value.category) {
      ElMessage.warning('请填写完整的记账信息')
      return
    }

    try {
      // 确保 recordId 是数字类型
      const recordId = Number(editingRecord.value.id)
      if (isNaN(recordId)) {
        throw new Error('Invalid record ID')
      }

      // 构建请求体，只包含需要更新的字段
      const updateData = {
        amount: Number(editingRecord.value.amount),
        transactionDate: editingRecord.value.date,
        notes: editingRecord.value.note || ''
      }

      await axios.put(`${API_URL}/records/${recordId}`, updateData)
      
      await fetchRecords()
      ElMessage.success('修改成功')
      editingRecord.value = null
    } catch (error) {
      console.error('修改记录失败:', error)
      ElMessage.error('修改失败')
    }
  }

  // 统计数据
  const totalIncome = computed(() => {
    return records.value
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0)
  })

  const totalExpense = computed(() => {
    return records.value
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0)
  })

  const balance = computed(() => totalIncome.value - totalExpense.value)

  // 分页处理
  const handleCurrentChange = async (val) => {
    pagination.value.currentPage = val
    await fetchRecords()
  }

  const handleSizeChange = async (val) => {
    pagination.value.pageSize = val
    pagination.value.currentPage = 1
    await fetchRecords()
  }

  // 下载Excel
  const handleDownloadExcel = async () => {
    try {
      await downloadExcel(userId.value)
      ElMessage.success('下载成功')
    } catch (error) {
      ElMessage.error('下载失败')
    }
  }

  return {
    records,
    newRecord,
    loading,
    timeUnit,
    pagination,
    totalIncome,
    totalExpense,
    balance,
    editingRecord,
    showEditDialog,
    fetchRecords,
    addRecord,
    deleteRecord,
    startEdit,
    cancelEdit,
    saveEdit,
    handleCurrentChange,
    handleSizeChange,
    handleDownloadExcel
  }
} 