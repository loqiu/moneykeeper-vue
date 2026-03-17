<template>
  <div class="space-y-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-slate-900">{{ t('accounting.filter.title') }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ t('accounting.filter.description') }}</p>
      </div>
      <el-button
        v-if="hasActiveFilter"
        link
        class="!px-0 !text-slate-500 hover:!text-slate-900"
        @click="handleReset"
      >
        <el-icon class="mr-1"><RefreshRight /></el-icon>
        {{ t('common.reset') }}
      </el-button>
    </div>

    <section class="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
      <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
        <el-icon><Filter /></el-icon>
        <span>{{ t('accounting.filter.recordTypeTitle') }}</span>
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
          <p class="text-sm font-medium text-slate-700">{{ t('common.category') }}</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ selectedType ? t('accounting.filter.categoryHint', { count: categoryList.length }) : t('accounting.filter.categoryPending') }}
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
        {{ t('accounting.filter.pickTypeFirst') }}
      </div>

      <div
        v-else-if="categoryList.length === 0"
        class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500"
      >
        {{ t('accounting.filter.noCategories') }}
      </div>

      <div v-else class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full border px-3 py-2 text-sm transition-all"
          :class="!selectedCategory ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900'"
          @click="handleCategoryChange('')"
        >
          {{ t('accounting.filter.allCategories') }}
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
      {{ t('accounting.filter.chartHint') }}
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

const selectedType = ref(props.filterState.type || '')
const selectedCategory = ref(props.filterState.category || '')

watch(() => props.filterState, (newVal) => {
  selectedType.value = newVal.type || ''
  selectedCategory.value = newVal.category || ''
}, { deep: true })

const typeOptions = computed(() => ([
  {
    value: '',
    label: t('common.all'),
    activeClass: 'border-slate-900 bg-slate-900 text-white shadow-sm'
  },
  {
    value: 'expense',
    label: t('common.expense'),
    activeClass: 'border-rose-200 bg-rose-100 text-rose-700 shadow-sm'
  },
  {
    value: 'income',
    label: t('common.income'),
    activeClass: 'border-emerald-200 bg-emerald-100 text-emerald-700 shadow-sm'
  }
]))

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
