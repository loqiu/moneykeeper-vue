import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLedgerStore } from '@/stores/ledger'
import { useUserStore } from '@/stores/user'
import {
  createLedgerRecord,
  deleteLedgerRecord,
  fetchLedgerRecords,
  fetchLedgerRecordsSummary,
  updateLedgerRecord
} from '@/api/modules/records'
import { getApiErrorMessage } from '@/api/response'

const LEDGER_REQUIRED_MESSAGE = '请先选择账本'

export function useRecord() {
  const { userId } = storeToRefs(useUserStore())
  const ledgerStore = useLedgerStore()
  const { currentLedgerId } = storeToRefs(ledgerStore)

  const loading = ref(false)
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  const filterState = ref({
    type: '',
    category: ''
  })

  const newRecord = ref({
    type: 'expense',
    amount: 0,
    categoryId: null,
    categoryName: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  })

  const editingRecord = ref(null)
  const showEditDialog = computed({
    get: () => editingRecord.value !== null,
    set: (value) => {
      if (!value) {
        editingRecord.value = null
      }
    }
  })

  const totalIncome = ref(0)
  const totalExpense = ref(0)
  const balance = ref(0)
  const allRecords = ref([])

  const filteredAllRecords = computed(() => {
    return allRecords.value.filter((record) => {
      const matchType = !filterState.value.type || record.type === filterState.value.type
      const matchCategory = !filterState.value.category || record.categoryName === filterState.value.category
      return matchType && matchCategory
    })
  })

  const records = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredAllRecords.value.slice(start, end)
  })

  const totalRecords = computed(() => filteredAllRecords.value.length)

  const resetSummary = () => {
    totalIncome.value = 0
    totalExpense.value = 0
    balance.value = 0
  }

  const ensureLedgerContext = () => {
    if (!currentLedgerId.value) {
      ElMessage.warning(LEDGER_REQUIRED_MESSAGE)
      return false
    }

    return true
  }

  const loadSummary = async (params = {}) => {
    if (!userId.value || !currentLedgerId.value) {
      resetSummary()
      return
    }

    try {
      const summary = await fetchLedgerRecordsSummary(currentLedgerId.value, params)
      totalIncome.value = summary.totalIncome
      totalExpense.value = summary.totalExpense
      balance.value = summary.balance
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '获取统计数据失败'))
    }
  }

  const fetchRecords = async (params = {}) => {
    if (!userId.value || !currentLedgerId.value) {
      allRecords.value = []
      resetSummary()
      return []
    }

    loading.value = true
    try {
      const data = await fetchLedgerRecords(currentLedgerId.value, params)
      allRecords.value = data
      await loadSummary(params)
      return data
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '获取记录列表失败'))
      allRecords.value = []
      resetSummary()
      return []
    } finally {
      loading.value = false
    }
  }

  const setFilter = (type, category) => {
    filterState.value.type = type
    filterState.value.category = category
    pagination.value.currentPage = 1
  }

  const resetNewRecord = () => {
    newRecord.value = {
      type: 'expense',
      amount: 0,
      categoryId: null,
      categoryName: '',
      note: '',
      date: new Date().toISOString().split('T')[0]
    }
  }

  const addRecord = async (record) => {
    if (!ensureLedgerContext()) {
      return
    }

    if (!record.amount || !record.categoryId) {
      ElMessage.warning('请填写完整的记账信息')
      return
    }

    try {
      await createLedgerRecord(currentLedgerId.value, userId.value, record)
      await fetchRecords()
      resetNewRecord()
      ElMessage.success('添加成功')
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '添加失败'))
    }
  }

  const deleteRecordItem = async (id) => {
    if (!ensureLedgerContext()) {
      return
    }

    try {
      const recordId = Number(id)
      if (Number.isNaN(recordId)) {
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

      await deleteLedgerRecord(currentLedgerId.value, recordId)
      await fetchRecords()
      ElMessage.success('删除成功')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(getApiErrorMessage(error, '删除失败'))
      }
    }
  }

  const startEdit = (record) => {
    editingRecord.value = {
      ...record,
      categoryId: record.categoryId ?? null,
      categoryName: record.categoryName ?? ''
    }
  }

  const cancelEdit = () => {
    editingRecord.value = null
  }

  const saveEdit = async () => {
    if (!ensureLedgerContext() || !editingRecord.value) {
      return
    }

    if (!editingRecord.value.amount || !editingRecord.value.categoryId) {
      ElMessage.warning('请填写完整的记账信息')
      return
    }

    try {
      const recordId = Number(editingRecord.value.id)
      if (Number.isNaN(recordId)) {
        throw new Error('Invalid record ID')
      }

      await updateLedgerRecord(currentLedgerId.value, recordId, editingRecord.value)
      await fetchRecords()
      ElMessage.success('修改成功')
      editingRecord.value = null
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '修改失败'))
    }
  }

  const handleCurrentChange = (val) => {
    pagination.value.currentPage = val
  }

  const handleSizeChange = (val) => {
    pagination.value.pageSize = val
    pagination.value.currentPage = 1
  }

  return {
    allRecords,
    records,
    newRecord,
    loading,
    pagination: computed(() => ({ ...pagination.value, total: totalRecords.value })),
    editingRecord,
    showEditDialog,
    fetchRecords,
    addRecord,
    deleteRecord: deleteRecordItem,
    startEdit,
    cancelEdit,
    saveEdit,
    handleCurrentChange,
    handleSizeChange,
    totalIncome,
    totalExpense,
    balance,
    setFilter,
    filterState
  }
}
