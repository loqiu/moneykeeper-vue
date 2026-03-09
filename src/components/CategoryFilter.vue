<template>
  <div class="p-4">
    <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <el-icon class="text-purple-500"><Filter /></el-icon>
      筛选记录
    </h2>

    <div class="space-y-3">
      <el-select
        v-model="selectedType"
        placeholder="类型"
        @change="handleTypeChange"
        class="!w-full"
        clearable
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-select
        v-model="selectedCategory"
        :placeholder="selectedType ? '分类' : '请先选择类型'"
        @change="handleCategoryChange"
        class="!w-full"
        clearable
        :disabled="!selectedType"
      >
        <el-option
          v-for="item in categoryList"
          :key="item.id"
          :label="item.name"
          :value="item.name"
        />
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
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  filterState: {
    type: Object,
    required: true
  },
  expenseCategories: {
    type: Array,
    default: () => []
  },
  incomeCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['filter-change'])

const selectedType = ref(props.filterState.type || '')
const selectedCategory = ref(props.filterState.category || '')

watch(() => props.filterState, (newVal) => {
  selectedType.value = newVal.type || ''
  selectedCategory.value = newVal.category || ''
}, { deep: true })

const typeOptions = [
  { value: 'expense', label: '支出' },
  { value: 'income', label: '收入' }
]

const categoryList = computed(() => {
  if (selectedType.value === 'income') {
    return props.incomeCategories
  }
  if (selectedType.value === 'expense') {
    return props.expenseCategories
  }
  return []
})

const emitFilterChange = () => {
  emit('filter-change', selectedType.value, selectedCategory.value)
}

const handleTypeChange = (value) => {
  selectedType.value = value || ''
  selectedCategory.value = ''
  emitFilterChange()
}

const handleCategoryChange = (value) => {
  selectedCategory.value = value || ''
  emitFilterChange()
}

const handleReset = () => {
  selectedType.value = ''
  selectedCategory.value = ''
  emit('filter-change', '', '')
}
</script>

<style scoped>
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #6366f1 inset !important;
}
</style>
