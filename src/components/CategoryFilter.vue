<template>
  <div class="p-4">
    <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <el-icon class="text-purple-500"><Filter /></el-icon>
      筛选记录
    </h2>
    
    <div class="space-y-3">
      <!-- 选择类型（收入/支出） -->
      <el-select 
        v-model="selectedType" 
        placeholder="类型" 
        @change="handleFilterChange"
        class="!w-full"
        clearable
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>

      <!-- 选择分类 -->
      <el-select 
        v-model="selectedCategory" 
        placeholder="分类" 
        @change="handleFilterChange"
        class="!w-full"
        clearable
      >
        <el-option
          v-for="item in categoryList"
          :key="item.id"
          :label="item.name"
          :value="item.name">
        </el-option>
      </el-select>
      
      <el-button 
        @click="handleReset" 
        class="!w-full !rounded-lg !text-gray-600 hover:!bg-gray-100 hover:!text-indigo-600"
      >
        重置筛选
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Filter } from '@element-plus/icons-vue'
import { useAccounting } from '@/composables/useAccounting'
import { ref, computed, watch } from 'vue'

const { setFilter, filterState, expenseCategories, incomeCategories } = useAccounting()

const selectedType = ref(filterState.value.type)
const selectedCategory = ref(filterState.value.category)

// 监听全局筛选状态变化（例如从图表点击触发）
watch(filterState, (newVal) => {
  selectedType.value = newVal.type
  selectedCategory.value = newVal.category
}, { deep: true })

const typeOptions = [
  { value: 'expense', label: '支出' },
  { value: 'income', label: '收入' }
]

const categoryList = computed(() => {
  if (selectedType.value === 'income') {
    return incomeCategories.value
  }
  return expenseCategories.value
})

const handleFilterChange = () => {
  setFilter(selectedType.value, selectedCategory.value)
}

const handleReset = () => {
  selectedType.value = ''
  selectedCategory.value = ''
  setFilter('', '')
}
</script>

<style scoped>
/* TailwindCSS handles styling */
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #6366f1 inset !important;
}
</style>