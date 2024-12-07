import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/axios'

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

  // 获取分类列表
  const fetchCategories = async () => {
    if (!userStore.userId) {
      console.warn('No userId available')
      return
    }

    try {
      const response = await request.get(`/categories/user/${userStore.userId}`)
      if (response.data) {
        expenseCategories.value = response.data
          .filter(category => category.type === '支出')
          .map(category => ({
            id: category.id,
            name: category.name,
            icon: category.icon,
            bgColor: category.color
          }))

        incomeCategories.value = response.data
          .filter(category => category.type === '收入')
          .map(category => ({
            id: category.id,
            name: category.name,
            icon: category.icon,
            bgColor: category.color
          }))
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
    }
  }

  // 显示添加分类对话框
  const showAddCategoryDialog = (type) => {
    if (!userStore.userId) {
      ElMessage.warning('请先登录')
      return
    }
    categoryType.value = type
    dialogVisible.value = true
  }

  // 删除分类
  const deleteCategory = async (index, type) => {
    if (!userStore.userId) {
      ElMessage.warning('请先登录')
      return
    }

    try {
      const category = type === 'expense' 
        ? expenseCategories.value[index]
        : incomeCategories.value[index]

      await ElMessageBox.confirm(
        `确定要删除${type === 'expense' ? '支出' : '收入'}分类"${category.name}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const categoryId = Number(category.id)
      if (isNaN(categoryId)) {
        throw new Error('Invalid category ID')
      }

      await request.delete(`/categories/${categoryId}`)
      await fetchCategories()
      ElMessage.success(`已删除${type === 'expense' ? '支出' : '收入'}分类：${category.name}`)
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除分类失败:', error)
        ElMessage.error('删除分类失败')
      }
    }
  }

  // 可用的图标列表
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

  // 添加分类
  const addCategory = async (category) => {
    if (!userStore.userId) {
      ElMessage.warning('请先登录')
      return
    }

    if (!category.name || !category.icon) {
      ElMessage.warning('请填写完整的分类信息')
      return
    }

    const bgColors = [
      '#fef0f0', '#f0f9eb', '#f5f7fa', '#ecf5ff', '#fdf6ec',
      '#f5f5f5', '#e8f4d9', '#fdf1f1', '#f0f7ff', '#fef7e6'
    ]
    const randomBgColor = bgColors[Math.floor(Math.random() * bgColors.length)]

    try {
      const iconObj = availableIcons.find(icon => icon.label === category.icon)
      const iconName = iconObj ? iconObj.value : 'More'

      const response = await request.post(`/categories/${userStore.userId}`, {
        name: category.name,
        icon: iconName,
        color: randomBgColor,
        type: categoryType.value === 'expense' ? '支出' : '收入'
      })

      if (response.data) {
        await fetchCategories()
        dialogVisible.value = false
        newCategory.value = { name: '', icon: 'shopping-cart' }
        ElMessage.success('添加分类成功')
      }
    } catch (error) {
      console.error('添加分类失败:', error)
      ElMessage.error(error.response?.data?.message || '添加分类失败')
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
    deleteCategory,
    addCategory
  }
} 