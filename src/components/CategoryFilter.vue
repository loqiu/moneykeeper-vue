<template>
  <div class="space-y-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-slate-900">快速筛选</h3>
        <p class="mt-1 text-sm text-slate-500">先选类型，再按分类缩小范围。</p>
      </div>
      <el-button
        v-if="hasActiveFilter"
        link
        class="!px-0 !text-slate-500 hover:!text-slate-900"
        @click="handleReset"
      >
        <el-icon class="mr-1"><RefreshRight /></el-icon>
        重置
      </el-button>
    </div>

    <section class="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
      <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
        <el-icon><Filter /></el-icon>
        <span>记录类型</span>
      </div>
      <div class="mt-3 grid grid-cols-3 gap-2">
        <button
          v-for="option in typeOptions"
          :key="option.value"
          type="button"
          class="rounded-2xl border px-3 py-2 text-sm font-medium transition-all"
          :class="selectedType === option.value ? option.activeClass : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'"
          @click="handleTypeChange(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-slate-700">分类</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ selectedType ? `当前共有 ${categoryList.length} 个可选分类` : '选择类型后即可启用分类筛选' }}
          </p>
        </div>
        <span
          v-if="selectedCategory"
          class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
        >
          {{ selectedCategory }}
        </span>
      </div>

      <div
        v-if="!selectedType"
        class="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800"
      >
        先选择“支出”或“收入”，再精确到具体分类。
      </div>

      <div
        v-else-if="categoryList.length === 0"
        class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500"
      >
        当前类型还没有分类，可以先在左侧新增一个分类。
      </div>

      <div v-else class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full border px-3 py-2 text-sm transition-all"
          :class="!selectedCategory ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900'"
          @click="handleCategoryChange('')"
        >
          全部分类
        </button>

        <button
          v-for="item in categoryList"
          :key="item.id"
          type="button"
          class="rounded-full border px-3 py-2 text-sm transition-all"
          :class="selectedCategory === item.name ? 'border-amber-300 bg-amber-100 text-amber-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'"
          @click="handleCategoryChange(item.name)"
        >
          {{ item.name }}
        </button>
      </div>
    </section>

    <div class="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200">
      小技巧：点击右侧饼图的某个扇区，会自动把明细筛选到对应的支出分类。
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { Filter, RefreshRight } from '@element-plus/icons-vue'

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
  {
    value: '',
    label: '全部',
    activeClass: 'border-slate-900 bg-slate-900 text-white shadow-sm'
  },
  {
    value: 'expense',
    label: '支出',
    activeClass: 'border-rose-200 bg-rose-100 text-rose-700 shadow-sm'
  },
  {
    value: 'income',
    label: '收入',
    activeClass: 'border-emerald-200 bg-emerald-100 text-emerald-700 shadow-sm'
  }
]

const hasActiveFilter = computed(() => {
  return Boolean(selectedType.value || selectedCategory.value)
})

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

  const categoryStillExists = categoryList.value.some((item) => item.name === selectedCategory.value)
  if (!categoryStillExists) {
    selectedCategory.value = ''
  }

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
button {
  outline: none;
}
</style>