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

  const appendCategoryIfMissing = (category) => {
    if (!category?.id) {
      return
    }

    const targetList = category.type === 'income' ? incomeCategories : expenseCategories
    const alreadyExists = targetList.value.some((item) => Number(item.id) === Number(category.id))

    if (!alreadyExists) {
      targetList.value = [category, ...targetList.value]
    }
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

  const fetchCategories = async ({ notifyError = true } = {}) => {
    if (!userStore.userId || !ledgerStore.currentLedgerId) {
      expenseCategories.value = []
      incomeCategories.value = []
      return []
    }

    try {
      const categories = await fetchLedgerCategories(ledgerStore.currentLedgerId)
      const grouped = splitCategoriesByType(categories)
      expenseCategories.value = grouped.expenseCategories
      incomeCategories.value = grouped.incomeCategories
      return categories
    } catch (error) {
      if (notifyError) {
        ElMessage.error(getApiErrorMessage(error, t('accounting.messages.categoriesFetchFailed')))
      }
      return null
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
      const createdCategory = await createLedgerCategory(ledgerStore.currentLedgerId, category, categoryType.value)
      const refreshedCategories = await fetchCategories({ notifyError: false })

      if (!refreshedCategories) {
        appendCategoryIfMissing(createdCategory)
        ElMessage.warning(t('accounting.messages.categoryRefreshWarning'))
      } else {
        appendCategoryIfMissing(createdCategory)
        ElMessage.success(t('accounting.messages.categoryAdded'))
      }

      dialogVisible.value = false
      newCategory.value = { name: '', icon: 'ShoppingCart' }
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
