import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
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

export function useCategory() {
  const { t } = useI18n()
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

  const canManageCategories = () => {
    return ['owner', 'admin'].includes(ledgerStore.currentLedgerRole || ledgerStore.currentLedger?.memberRole || '')
  }

  const ensureLedgerContext = ({ requireManage = false } = {}) => {
    if (!userStore.userId) {
      ElMessage.warning(t('accounting.messages.loginRequired'))
      return false
    }

    if (!ledgerStore.currentLedgerId) {
      ElMessage.warning(t('accounting.messages.ledgerRequired'))
      return false
    }

    if (requireManage && !canManageCategories()) {
      ElMessage.warning(t('accounting.messages.categoryPermission'))
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
      ElMessage.error(getApiErrorMessage(error, t('accounting.messages.categoriesFetchFailed')))
    }
  }

  const showAddCategoryDialog = (type) => {
    if (!ensureLedgerContext({ requireManage: true })) {
      return
    }

    categoryType.value = type
    dialogVisible.value = true
  }

  const deleteCategoryItem = async ({ category, type }) => {
    if (!ensureLedgerContext({ requireManage: true })) {
      return
    }

    const categoryLabel = type === 'expense' ? t('common.expense') : t('common.income')

    try {
      await ElMessageBox.confirm(
        t('accounting.messages.deleteCategoryDescription', { type: categoryLabel, name: category.name }),
        t('accounting.messages.deleteCategoryTitle'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )

      const categoryId = Number(category.id)
      if (Number.isNaN(categoryId)) {
        throw new Error('Invalid category ID')
      }

      await deleteLedgerCategory(ledgerStore.currentLedgerId, categoryId)
      await fetchCategories()
      ElMessage.success(t('accounting.messages.categoryDeleted', { type: categoryLabel, name: category.name }))
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(getApiErrorMessage(error, t('accounting.messages.categoryDeleteFailed')))
      }
    }
  }

  const addCategory = async (category) => {
    if (!ensureLedgerContext({ requireManage: true })) {
      return
    }

    if (!category.name || !category.icon || !category.color) {
      ElMessage.warning(t('accounting.categoryDialog.incompleteWarning'))
      return
    }

    try {
      await createLedgerCategory(ledgerStore.currentLedgerId, category, categoryType.value)
      await fetchCategories()
      dialogVisible.value = false
      newCategory.value = { name: '', icon: 'ShoppingCart' }
      ElMessage.success(t('accounting.messages.categoryAdded'))
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, t('accounting.messages.categoryAddFailed')))
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
