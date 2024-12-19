import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/axios'
import axios from 'axios'

export function useRecord() {
  const userStore = useUserStore()
  const { userId } = storeToRefs(userStore)

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

  // 新增统计数据的响应式引用
  const totalIncome = ref(0)
  const totalExpense = ref(0)
  const balance = ref(0)
  // 所有记录
  const allRecords = ref([])

  // 新增获取统计数据的方法
  const fetchRecordsSummary = async () => {
    try {
      const response = await axios.get(`/api/records/summary/${userStore.userId}`)
      totalIncome.value = response.data.totalIncome
      totalExpense.value = response.data.totalExpense
      balance.value = response.data.balance
    } catch (error) {
      console.error('获取统计数据失败:', error)
      ElMessage.error('获取统计数据失败')
    }
  }

  // 获取记录列表
  const fetchRecords = async (params = {}) => {
    loading.value = true
    try {
      const response = await request.get(`/records/listWithCategoryName/${userId.value}`, { params })
      if (response.data) {
        allRecords.value = response.data.map(record => ({
          id: record.id,
          type: record.type === '支出' ? 'expense' : 'income',
          amount: record.amount,
          category: record.categoryName,
          categoryId: record.categoryId,
          date: record.transactionDate,
          note: record.notes
        }))

        pagination.value.total = allRecords.value.length

        const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
        const end = start + pagination.value.pageSize
        records.value = allRecords.value.slice(start, end)

        // 获取统计数据
        await fetchRecordsSummary()

        return response.data
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
    if (!record.amount || !record.category) {
      ElMessage.warning('请填写完整的记账信息')
      return
    }

    try {
      const response = await request.post(`/records`, {
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

      await request.delete(`/records/${recordId}`)
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
    // console.log("startEdit: ", record)
    editingRecord.value = {
      ...record,
      categoryId: record.categoryId || record.category,
      type: record.type === "expense" ? 'expense' : 'income'  // 确保类型格式正确
    }
    // console.log('开始编辑的记录：', editingRecord.value) // 调试用
  }

  const cancelEdit = () => {
    editingRecord.value = null
  }

  // 保存修改
  const saveEdit = async () => {
    console.log("saveEdit: ", editingRecord.value)
    if (!editingRecord.value) return

    if (!editingRecord.value.amount || !editingRecord.value.category) {
      ElMessage.warning('请填写完整的记账信息')
      return
    }

    try {
      const recordId = Number(editingRecord.value.id)
      if (isNaN(recordId)) {
        throw new Error('Invalid record ID')
      }

      const updateData = {
        categoryId: Number(editingRecord.value.category),
        type: editingRecord.value.type === 'expense' ? '支出' : '收入',
        amount: Number(editingRecord.value.amount),
        transactionDate: editingRecord.value.date,
        notes: editingRecord.value.note || ''
      }

      await request.put(`/records/${recordId}`, updateData)
      
      await fetchRecords()
      ElMessage.success('修改成功')
      editingRecord.value = null
    } catch (error) {
      console.error('修改记录失败:', error)
      ElMessage.error('修改失败')
    }
  }

  // 分页处理
  const handleCurrentChange = async (val) => {
    pagination.value.currentPage = val
    // await fetchRecords()
    const start = (val - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    records.value = allRecords.value.slice(start, end)
  }

  const handleSizeChange = async (val) => {
    pagination.value.pageSize = val
    pagination.value.currentPage = 1
    // await fetchRecords()
    const start = 0
    const end = val
    records.value = allRecords.value.slice(start, end)
  }

  return {
    allRecords,
    records,
    newRecord,
    loading,
    timeUnit,
    pagination,
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
    totalIncome,
    totalExpense,
    balance
  }
} 