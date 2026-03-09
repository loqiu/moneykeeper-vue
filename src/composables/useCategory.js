import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  createCategory,
  deleteCategory,
  fetchUserCategories
} from '@/api/modules/categories'
import { splitCategoriesByType } from '@/api/mappers/categoryMapper'
import { getApiErrorMessage } from '@/api/response'

export function useCategory() {
  const userStore = useUserStore()
  const expenseCategories = ref([])
  const incomeCategories = ref([])
  const dialogVisible = ref(false)
  const categoryType = ref('expense')
  const newCategory = ref({
    name: '',
    icon: 'shopping-cart'
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
      ElMessage.error(getApiErrorMessage(error, '获取分类列表失败'))
    }
  }

  const showAddCategoryDialog = (type) => {
    if (!userStore.userId) {
      ElMessage.warning('请先登录')
      return
    }

    categoryType.value = type
    dialogVisible.value = true
  }

  const deleteCategoryItem = async ({ category, type }) => {
    if (!userStore.userId) {
      ElMessage.warning('请先登录')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除${type === 'expense' ? '支出' : '收入'}分类“${category.name}”吗？`,
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

      await deleteCategory(categoryId)
      await fetchCategories()
      ElMessage.success(`已删除${type === 'expense' ? '支出' : '收入'}分类：${category.name}`)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(getApiErrorMessage(error, '删除分类失败'))
      }
    }
  }

  const availableIcons = [
    { value: 'ShoppingCart', label: 'shopping-cart' },
    { value: 'Food', label: 'food' },
    { value: 'House', label: 'house' },
    { value: 'Van', label: 'van' },
    { value: 'Ticket', label: 'ticket' },
    { value: 'Money', label: 'money' },
    { value: 'Wallet', label: 'wallet' },
    { value: 'CreditCard', label: 'credit-card' },
    { value: 'Present', label: 'present' },
    { value: 'More', label: 'more' }
  ]

  const addCategory = async (category) => {
    if (!userStore.userId) {
      ElMessage.warning('请先登录')
      return
    }

    if (!category.name || !category.icon || !category.color) {
      ElMessage.warning('请填写完整的分类信息')
      return
    }

    try {
      await createCategory(userStore.userId, category, categoryType.value)
      await fetchCategories()
      dialogVisible.value = false
      newCategory.value = { name: '', icon: 'shopping-cart' }
      ElMessage.success('添加分类成功')
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '添加分类失败'))
    }
  }

  return {
    expenseCategories,
    incomeCategories,
    dialogVisible,
    categoryType,
    availableIcons,
    newCategory,
    fetchCategories,
    showAddCategoryDialog,
    deleteCategory: deleteCategoryItem,
    addCategory
  }
}
