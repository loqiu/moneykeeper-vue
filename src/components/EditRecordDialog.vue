<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="680px"
    :close-on-click-modal="false"
    class="record-dialog"
  >
    <template #header>
      <div class="space-y-2 pr-8">
        <h2 class="text-xl font-semibold text-slate-900">编辑记录</h2>
        <p class="text-sm text-slate-500">调整金额、分类或日期后保存，明细列表会立即同步。</p>
      </div>
    </template>

    <div v-if="record && modelValue" class="space-y-5">
      <section class="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-slate-900">记录类型</h3>
            <p class="mt-1 text-sm text-slate-500">切换类型时会清空当前分类，请重新选择。</p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="typeBadgeClass">
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
            :controls="false"
          />
          <p class="mt-2 text-xs text-slate-500">保存前请确认金额和类型是否匹配。</p>
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
            class="!mt-3 !w-full"
          />
          <p class="mt-2 text-xs text-slate-500">用于图表统计和明细排序。</p>
        </div>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-slate-900">分类</h3>
            <p class="mt-1 text-sm text-slate-500">
              {{ currentCategories.length ? '从当前类型的分类中重新选择一项。' : '当前类型没有可用分类，请先关闭弹窗后新增分类。' }}
            </p>
          </div>
          <span v-if="selectedCategoryName" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {{ selectedCategoryName }}
          </span>
        </div>

        <div v-if="currentCategories.length" class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          <button
            v-for="item in currentCategories"
            :key="item.id"
            type="button"
            class="rounded-3xl border p-3 text-center transition-all"
            :class="Number(localRecord.categoryId) === Number(item.id) ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white'"
            @click="handleCategorySelect(item)"
          >
            <div
              class="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl"
              :style="{ backgroundColor: Number(localRecord.categoryId) === Number(item.id) ? 'rgba(255,255,255,0.18)' : item.bgColor || '#f8fafc' }"
            >
              <el-icon :size="20" :class="resolveCategoryIconClass(item.icon)"><component :is="resolveCategoryIcon(item.icon)" /></el-icon>
            </div>
            <div class="mt-3 text-xs font-medium leading-5" :class="Number(localRecord.categoryId) === Number(item.id) ? 'text-white' : 'text-slate-600'">
              {{ item.name }}
            </div>
          </button>
        </div>

        <div v-else class="mt-4 rounded-3xl border border-dashed border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-800">
          当前没有可选分类，建议先关闭弹窗并新增对应分类后再编辑这条记录。
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
          placeholder="补充这笔记录的背景，例如消费场景或支付对象。"
          maxlength="255"
          show-word-limit
          type="textarea"
          :rows="3"
          resize="none"
          class="!mt-3"
        />
      </section>
    </div>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-left text-sm text-slate-500">
          {{ localRecord.date || todayString }} · {{ localRecord.amount ? formatCurrency(localRecord.amount) : '等待填写金额' }}
        </div>
        <div class="flex items-center justify-end gap-3">
          <el-button @click="$emit('cancel')" class="!rounded-full !px-5">取消</el-button>
          <el-button
            type="primary"
            @click="$emit('save', localRecord)"
            :disabled="submitDisabled"
            class="!rounded-full !border-0 !bg-slate-900 !px-6 hover:!bg-slate-800 disabled:!bg-slate-300"
          >
            保存修改
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { resolveCategoryIcon, resolveCategoryIconClass } from '@/constants/categoryIcons'

const emit = defineEmits(['update:modelValue', 'cancel', 'save', 'update:record'])

const props = defineProps({
  modelValue: Boolean,
  record: {
    type: Object,
    default: () => ({
      type: 'expense',
      amount: 0,
      categoryId: null,
      categoryName: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    })
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

const todayString = new Date().toISOString().split('T')[0]
const localRecord = ref({ ...props.record })

watch(() => props.record, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    localRecord.value = {
      ...newVal,
      categoryId: newVal.categoryId ?? null,
      categoryName: newVal.categoryName ?? ''
    }
  }
}, { deep: true, immediate: true })

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
  emit('update:record', nextRecord)
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