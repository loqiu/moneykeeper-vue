<template>
  <div class="space-y-6">
    <section class="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-base font-semibold text-slate-900">记录类型</h3>
          <p class="mt-1 text-sm text-slate-500">切换收入或支出，会自动切换可选分类。</p>
        </div>
        <span class="inline-flex h-10 min-w-[60px] items-center justify-center rounded-full px-4 text-sm font-semibold leading-none" :class="typeBadgeClass">
          {{ typeLabel }}
        </span>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="rounded-2xl border px-4 py-3 text-sm font-semibold transition-all"
          :class="localRecord.type === 'expense' ? 'border-rose-200 bg-rose-100 text-rose-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'"
          @click="updateRecord('type', 'expense')"
        >
          支出
        </button>
        <button
          type="button"
          class="rounded-2xl border px-4 py-3 text-sm font-semibold transition-all"
          :class="localRecord.type === 'income' ? 'border-emerald-200 bg-emerald-100 text-emerald-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'"
          @click="updateRecord('type', 'income')"
        >
          收入
        </button>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <label class="text-sm font-medium text-slate-700">金额</label>
        <el-input-number
          :model-value="localRecord.amount"
          @update:model-value="updateRecord('amount', $event)"
          :min="0"
          :precision="2"
          :step="0.01"
          class="!mt-3 !w-full"
          placeholder="0.00"
          :controls="false"
        />
        <p class="mt-2 text-xs text-slate-500">支持两位小数，提交前会自动按数字格式处理。</p>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <label class="text-sm font-medium text-slate-700">日期</label>
          <button type="button" class="text-xs font-medium text-indigo-600" @click="setToday">
            设为今天
          </button>
        </div>
        <el-date-picker
          :model-value="localRecord.date"
          @update:model-value="updateRecord('date', $event)"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :default-value="new Date()"
          class="!mt-3 !w-full"
        />
        <p class="mt-2 text-xs text-slate-500">默认使用今天，你也可以补录历史记录。</p>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 class="text-base font-semibold text-slate-900">分类</h3>
          <p class="mt-1 text-sm text-slate-500">
            {{ currentCategories.length ? '选择一个最贴近本笔记录的分类。' : '当前类型还没有分类，先新增一个分类。' }}
          </p>
        </div>
        <el-button
          class="!rounded-full !border-slate-200 !bg-slate-50 !text-slate-700 hover:!bg-slate-100"
          @click="handleShowAddCategoryDialog(localRecord.type)"
        >
          <el-icon class="mr-1"><Plus /></el-icon>
          新增分类
        </el-button>
      </div>

      <div v-if="currentCategories.length" class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        <div
          v-for="(item, index) in currentCategories"
          :key="item.id ?? index"
          class="group relative cursor-pointer rounded-3xl border p-3 text-center transition-all"
          :class="Number(localRecord.categoryId) === Number(item.id) ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white'"
          @click="handleCategorySelect(item)"
        >
          <button
            type="button"
            class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-rose-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            @click.stop="handleDeleteCategory(index, localRecord.type)"
          >
            <el-icon :size="12"><Close /></el-icon>
          </button>
          <div
            class="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl transition-colors"
            :style="{ backgroundColor: Number(localRecord.categoryId) === Number(item.id) ? 'rgba(255,255,255,0.18)' : item.bgColor || '#f8fafc' }"
          >
            <el-icon :size="20" :class="resolveCategoryIconClass(item.icon)"><component :is="resolveCategoryIcon(item.icon)" /></el-icon>
          </div>
          <div class="mt-3 text-xs font-medium leading-5" :class="Number(localRecord.categoryId) === Number(item.id) ? 'text-white' : 'text-slate-600'">
            {{ item.name }}
          </div>
        </div>
      </div>

      <div v-else class="mt-4 rounded-3xl border border-dashed border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-800">
        当前还没有可选分类，先新增一个 {{ typeLabel }} 分类再继续。
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <label class="text-sm font-medium text-slate-700">备注</label>
        <span class="text-xs text-slate-400">可选</span>
      </div>
      <el-input
        :model-value="localRecord.note"
        @update:model-value="updateRecord('note', $event)"
        placeholder="写下这笔记录的背景，例如场景、对象或支付方式。"
        maxlength="255"
        show-word-limit
        type="textarea"
        :rows="3"
        resize="none"
        class="!mt-3"
      />
    </section>

    <section class="rounded-3xl bg-slate-900 px-4 py-4 text-white shadow-lg">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-sm font-medium">{{ selectedCategoryName || '尚未选择分类' }}</p>
          <p class="text-xs text-slate-300">{{ localRecord.date || todayString }} · {{ localRecord.amount ? formatCurrency(localRecord.amount) : '等待填写金额' }}</p>
        </div>
        <el-button
          type="primary"
          :disabled="submitDisabled"
          class="!rounded-full !border-0 !bg-amber-400 !px-6 !font-semibold !text-slate-900 hover:!bg-amber-300 disabled:!bg-slate-700 disabled:!text-slate-400"
          @click="handleSubmit"
        >
          保存记录
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Plus } from '@element-plus/icons-vue'
import { resolveCategoryIcon, resolveCategoryIconClass } from '@/constants/categoryIcons'

const props = defineProps({
  newRecord: {
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

const emit = defineEmits([
  'update:newRecord',
  'add-record',
  'delete-category',
  'show-add-category-dialog'
])

const todayString = new Date().toISOString().split('T')[0]
const localRecord = ref({ ...props.newRecord })

watch(() => props.newRecord, (newVal) => {
  localRecord.value = { ...newVal }
}, { deep: true })

const currentCategories = computed(() => {
  return localRecord.value.type === 'income' ? props.incomeCategories : props.expenseCategories
})

const selectedCategoryName = computed(() => {
  return currentCategories.value.find((item) => Number(item.id) === Number(localRecord.value.categoryId))?.name || localRecord.value.categoryName || ''
})

const typeLabel = computed(() => {
  return localRecord.value.type === 'income' ? '收入' : '支出'
})

const typeBadgeClass = computed(() => {
  return localRecord.value.type === 'income'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-rose-100 text-rose-700'
})

const submitDisabled = computed(() => {
  return !localRecord.value.amount || !localRecord.value.categoryId
})

const formatCurrency = (value) => {
  return `£${Number(value || 0).toFixed(2)}`
}

const syncRecord = (nextRecord) => {
  localRecord.value = nextRecord
  emit('update:newRecord', nextRecord)
}

const updateRecord = (field, value) => {
  const updatedRecord = {
    ...localRecord.value,
    [field]: value
  }

  if (field === 'type') {
    updatedRecord.categoryId = null
    updatedRecord.categoryName = ''
  }

  syncRecord(updatedRecord)
}

const setToday = () => {
  updateRecord('date', todayString)
}

const handleCategorySelect = (category) => {
  syncRecord({
    ...localRecord.value,
    categoryId: category.id,
    categoryName: category.name
  })
}

const handleDeleteCategory = (index, type) => {
  const category = type === 'expense'
    ? props.expenseCategories[index]
    : props.incomeCategories[index]

  emit('delete-category', { category, type })
}

const handleShowAddCategoryDialog = (type) => {
  emit('show-add-category-dialog', type)
}

const handleSubmit = () => {
  if (submitDisabled.value) {
    ElMessage.warning('请填写完整的记账信息')
    return
  }

  emit('add-record', localRecord.value)
}
</script>

<style scoped>
:deep(.el-input__wrapper) {
  box-shadow: inset 0 0 0 1px #e2e8f0;
  border-radius: 18px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: inset 0 0 0 2px #0f172a !important;
}

:deep(.el-textarea__inner) {
  border-radius: 18px;
}

button {
  outline: none;
}
</style>