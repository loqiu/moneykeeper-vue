import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  createCategory,
  deleteCategory,
  fetchUserCategories
} from '@/api/modules/categories'
import { splitCategoriesByType } from '@/api/mappers/categoryMapper'
import { availableCategoryIcons } from '@/constants/categoryIcons'
import { getApiErrorMessage } from '@/api/response'

const LOGIN_REQUIRED_MESSAGE = '\u8bf7\u5148\u767b\u5f55'
const FETCH_CATEGORY_ERROR_MESSAGE = '\u83b7\u53d6\u5206\u7c7b\u5217\u8868\u5931\u8d25'
const ADD_CATEGORY_ERROR_MESSAGE = '\u6dfb\u52a0\u5206\u7c7b\u5931\u8d25'
const DELETE_CATEGORY_ERROR_MESSAGE = '\u5220\u9664\u5206\u7c7b\u5931\u8d25'
const INVALID_CATEGORY_MESSAGE = '\u8bf7\u586b\u5199\u5b8c\u6574\u7684\u5206\u7c7b\u4fe1\u606f'

export function useCategory() {
  const userStore = useUserStore()
  const expenseCategories = ref([])
  const incomeCategories = ref([])
  const dialogVisible = ref(false)
  const categoryType = ref('expense')
  const newCategory = ref({
    name: '',
    icon: 'ShoppingCart'
  })

  const fetchCategories = async () => {
    if (!userStore.userId) {
      expenseCategories.value = []
      incomeCategories.value = []
      return
    }

    try {
      const categories = await fetchUserCategories(userStore.userId)
      const grouped = splitCategoriesByType(categories)
      expenseCategories.value = grouped.expenseCategories
      incomeCategories.value = grouped.incomeCategories
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, FETCH_CATEGORY_ERROR_MESSAGE))
    }
  }

  const showAddCategoryDialog = (type) => {
    if (!userStore.userId) {
      ElMessage.warning(LOGIN_REQUIRED_MESSAGE)
      return
    }

    categoryType.value = type
    dialogVisible.value = true
  }

  const deleteCategoryItem = async ({ category, type }) => {
    if (!userStore.userId) {
      ElMessage.warning(LOGIN_REQUIRED_MESSAGE)
      return
    }

    const categoryLabel = type === 'expense' ? '\u652f\u51fa' : '\u6536\u5165'

    try {
      await ElMessageBox.confirm(
        `\u786e\u5b9a\u8981\u5220\u9664${categoryLabel}\u5206\u7c7b\u201c${category.name}\u201d\u5417\uff1f`,
        '\u5220\u9664\u786e\u8ba4',
        {
          confirmButtonText: '\u786e\u5b9a',
          cancelButtonText: '\u53d6\u6d88',
          type: 'warning'
        }
      )

      const categoryId = Number(category.id)
      if (Number.isNaN(categoryId)) {
        throw new Error('Invalid category ID')
      }

      await deleteCategory(categoryId)
      await fetchCategories()
      ElMessage.success(`\u5df2\u5220\u9664${categoryLabel}\u5206\u7c7b\uff1a${category.name}`)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(getApiErrorMessage(error, DELETE_CATEGORY_ERROR_MESSAGE))
      }
    }
  }

  const addCategory = async (category) => {
    if (!userStore.userId) {
      ElMessage.warning(LOGIN_REQUIRED_MESSAGE)
      return
    }

    if (!category.name || !category.icon || !category.color) {
      ElMessage.warning(INVALID_CATEGORY_MESSAGE)
      return
    }

    try {
      await createCategory(userStore.userId, category, categoryType.value)
      await fetchCategories()
      dialogVisible.value = false
      newCategory.value = { name: '', icon: 'ShoppingCart' }
      ElMessage.success('\u6dfb\u52a0\u5206\u7c7b\u6210\u529f')
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