import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLedgerStore } from '@/stores/ledger'
import { useUserStore } from '@/stores/user'
import {
  createLedgerCategory,
  deleteLedgerCategory,
  fetchLedgerCategories
} from '@/api/modules/categories'
import { splitCategoriesByType } from '@/api/mappers/categoryMapper'
import { availableCategoryIcons } from '@/constants/categoryIcons'
import { getApiErrorMessage } from '@/api/response'

const LOGIN_REQUIRED_MESSAGE = '请先登录'
const LEDGER_REQUIRED_MESSAGE = '请先选择账本'
const FETCH_CATEGORY_ERROR_MESSAGE = '获取分类列表失败'
const ADD_CATEGORY_ERROR_MESSAGE = '添加分类失败'
const DELETE_CATEGORY_ERROR_MESSAGE = '删除分类失败'
const INVALID_CATEGORY_MESSAGE = '请填写完整的分类信息'

export function useCategory() {
  const userStore = useUserStore()
  const ledgerStore = useLedgerStore()
  const expenseCategories = ref([])
  const incomeCategories = ref([])
  const dialogVisible = ref(false)
  const categoryType = ref('expense')
  const newCategory = ref({
    name: '',
    icon: 'ShoppingCart'
  })

  const ensureLedgerContext = () => {
    if (!userStore.userId) {
      ElMessage.warning(LOGIN_REQUIRED_MESSAGE)
      return false
    }

    if (!ledgerStore.currentLedgerId) {
      ElMessage.warning(LEDGER_REQUIRED_MESSAGE)
      return false
    }

    return true
  }

  const fetchCategories = async () => {
    if (!userStore.userId || !ledgerStore.currentLedgerId) {
      expenseCategories.value = []
      incomeCategories.value = []
      return
    }

    try {
      const categories = await fetchLedgerCategories(ledgerStore.currentLedgerId)
      const grouped = splitCategoriesByType(categories)
      expenseCategories.value = grouped.expenseCategories
      incomeCategories.value = grouped.incomeCategories
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, FETCH_CATEGORY_ERROR_MESSAGE))
    }
  }

  const showAddCategoryDialog = (type) => {
    if (!ensureLedgerContext()) {
      return
    }

    categoryType.value = type
    dialogVisible.value = true
  }

  const deleteCategoryItem = async ({ category, type }) => {
    if (!ensureLedgerContext()) {
      return
    }

    const categoryLabel = type === 'expense' ? '支出' : '收入'

    try {
      await ElMessageBox.confirm(
        `确定要删除${categoryLabel}分类“${category.name}”吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const categoryId = Number(category.id)
      if (Number.isNaN(categoryId)) {
        throw new Error('Invalid category ID')
      }

      await deleteLedgerCategory(ledgerStore.currentLedgerId, categoryId)
      await fetchCategories()
      ElMessage.success(`已删除${categoryLabel}分类：${category.name}`)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(getApiErrorMessage(error, DELETE_CATEGORY_ERROR_MESSAGE))
      }
    }
  }

  const addCategory = async (category) => {
    if (!ensureLedgerContext()) {
      return
    }

    if (!category.name || !category.icon || !category.color) {
      ElMessage.warning(INVALID_CATEGORY_MESSAGE)
      return
    }

    try {
      await createLedgerCategory(ledgerStore.currentLedgerId, category, categoryType.value)
      await fetchCategories()
      dialogVisible.value = false
      newCategory.value = { name: '', icon: 'ShoppingCart' }
      ElMessage.success('添加分类成功')
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, ADD_CATEGORY_ERROR_MESSAGE))
    }
  }

  return {
    expenseCategories,
    incomeCategories,
    dialogVisible,
    categoryType,
    availableIcons: availableCategoryIcons,
    newCategory,
    fetchCategories,
    showAddCategoryDialog,
    deleteCategory: deleteCategoryItem,
    addCategory
  }
}
