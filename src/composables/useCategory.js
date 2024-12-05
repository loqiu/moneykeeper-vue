import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

export function useCategory() {
  const userStore = useUserStore()
  const API_URL = process.env.VUE_APP_API_URL

  // 分类数据
  const expenseCategories = ref([])
  const incomeCategories = ref([])
  const dialogVisible = ref(false)
  const categoryType = ref('expense')
  const newCategory = ref({
    name: '',
    icon: 'Food'
  })

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/list`)
      if (response.data) {
        expenseCategories.value = response.data
          .filter(category => category.type === '支出')
          .map(category => ({
            name: category.name,
            icon: category.icon,
            bgColor: category.color,
            id: category.id
          }))

        incomeCategories.value = response.data
          .filter(category => category.type === '收入')
          .map(category => ({
            name: category.name,
            icon: category.icon,
            bgColor: category.color,
            id: category.id
          }))
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
    }
  }

  // 显示添加分类对话框
  const showAddCategoryDialog = (type) => {
    categoryType.value = type
    newCategory.value = {
      name: '',
      icon: 'Food'
    }
    dialogVisible.value = true
  }

  // 删除分类
  const deleteCategory = async (index, type) => {
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

      // 确保 categoryId 是数字类型
      const categoryId = Number(category.id)
      if (isNaN(categoryId)) {
        throw new Error('Invalid category ID')
      }

      // 调用后端删除 API
      await axios.delete(`${API_URL}/categories/${categoryId}`)

      // 删除成功后重新获取分类列表
      await fetchCategories()
      ElMessage.success(`已删除${type === 'expense' ? '支出' : '收入'}分类：${category.name}`)
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除分类失败:', error)
        ElMessage.error('删除分类失败')
      }
    }
  }

  // 可用的图标列表 - 使用 Element Plus 的图标名称
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

  // 修改添加分类方法
  const addCategory = async (category) => {
    if (!category.name || !category.icon) {
      ElMessage.warning('请填写完整的分类信息')
      return
    }

    if (!userStore.userId) {
      ElMessage.error('用户未登录')
      return
    }

    const bgColors = [
      '#fef0f0', '#f0f9eb', '#f5f7fa', '#ecf5ff', '#fdf6ec',
      '#f5f5f5', '#e8f4d9', '#fdf1f1', '#f0f7ff', '#fef7e6'
    ]
    const randomBgColor = bgColors[Math.floor(Math.random() * bgColors.length)]

    try {
      // 找到对应的图标对象
      const iconObj = availableIcons.find(icon => icon.label === category.icon)
      const iconName = iconObj ? iconObj.value : 'More'  // 使用 PascalCase 格式的图标名

      const response = await axios.post(`${API_URL}/categories/${userStore.userId}`, {
        name: category.name,
        icon: iconName,  // 使用 PascalCase 格式的图标名
        color: randomBgColor,
        type: categoryType.value === 'expense' ? '支出' : '收入'
      })

      if (response.data) {
        await fetchCategories()
        dialogVisible.value = false
        newCategory.value = { name: '', icon: 'shopping-cart' }  // 使用 kebab-case 格式作为默认值
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
    newCategory,
    availableIcons,
    fetchCategories,
    showAddCategoryDialog,
    deleteCategory,
    addCategory
  }
} 