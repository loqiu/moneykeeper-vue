<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="640px"
    class="category-dialog"
  >
    <template #header>
      <div class="space-y-2 pr-8">
        <h2 class="text-xl font-semibold text-slate-900">{{ dialogTitle }}</h2>
        <p class="text-sm text-slate-500">{{ t('accounting.categoryDialog.description') }}</p>
      </div>
    </template>

    <div class="space-y-5">
      <section class="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-700">{{ t('accounting.categoryDialog.previewTitle') }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ t('accounting.categoryDialog.previewDescription', { type: categoryTypeLabel }) }}</p>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl" :style="{ backgroundColor: category.bgColor }">
                <el-icon :size="20" :class="resolveCategoryIconClass(category.icon)"><component :is="resolveCategoryIcon(category.icon)" /></el-icon>
              </div>
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ category.name || t('accounting.categoryDialog.unnamed') }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ selectedIconLabel }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <label class="text-sm font-medium text-slate-700">{{ t('accounting.categoryDialog.nameTitle') }}</label>
        <el-input
          v-model="category.name"
          maxlength="20"
          show-word-limit
          :placeholder="t('accounting.categoryDialog.namePlaceholder')"
          class="!mt-3 !w-full"
        />
        <p class="mt-2 text-xs text-slate-500">{{ t('accounting.categoryDialog.nameHint') }}</p>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-slate-900">{{ t('accounting.categoryDialog.iconTitle') }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ t('accounting.categoryDialog.iconDescription') }}</p>
          </div>
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {{ selectedIconLabel }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          <button
            v-for="icon in normalizedIcons"
            :key="icon.value"
            type="button"
            class="rounded-3xl border p-3 text-center transition-all"
            :class="category.icon === icon.value ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white'"
            @click="category.icon = icon.value"
          >
            <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl" :style="{ backgroundColor: category.icon === icon.value ? 'rgba(255,255,255,0.18)' : category.bgColor }">
              <el-icon :size="20" :class="resolveCategoryIconClass(icon.value)"><component :is="resolveCategoryIcon(icon.value)" /></el-icon>
            </div>
            <div class="mt-3 text-xs font-medium leading-5">
              {{ icon.label }}
            </div>
          </button>
        </div>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 class="text-base font-semibold text-slate-900">{{ t('accounting.categoryDialog.colorTitle') }}</h3>
          <p class="mt-1 text-sm text-slate-500">{{ t('accounting.categoryDialog.colorDescription') }}</p>
        </div>

        <div class="mt-4 grid grid-cols-6 gap-3">
          <button
            v-for="(color, index) in presetColors"
            :key="color"
            type="button"
            class="flex h-11 w-full items-center justify-center rounded-2xl border transition-all"
            :class="category.bgColor === color ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-transparent hover:border-slate-200'"
            :style="{ backgroundColor: color }"
            :title="colorNames[index]"
            @click="category.bgColor = color"
          >
            <span class="sr-only">{{ colorNames[index] }}</span>
          </button>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-left text-sm text-slate-500">
          {{ categoryTypeLabel }} · {{ category.name || t('accounting.categoryDialog.summaryPendingName') }}
        </div>
        <div class="flex items-center justify-end gap-3">
          <el-button class="!rounded-full !px-5" @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</el-button>
          <el-button
            type="primary"
            class="!rounded-full !border-0 !bg-slate-900 !px-6 hover:!bg-slate-800 disabled:!bg-slate-300"
            :disabled="submitDisabled"
            @click="handleAdd"
          >
            {{ t('accounting.categoryDialog.createCategory') }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { availableCategoryIcons, resolveCategoryIcon, resolveCategoryIconClass } from '@/constants/categoryIcons'

const presetColors = [
  '#fef3c7',
  '#fde68a',
  '#fecaca',
  '#fecdd3',
  '#bfdbfe',
  '#c7d2fe',
  '#bbf7d0',
  '#a7f3d0',
  '#ddd6fe',
  '#f5d0fe',
  '#e2e8f0',
  '#d1fae5'
]

const colorNames = [
  '浅琥珀',
  '暖黄色',
  '浅红色',
  '浅粉色',
  '浅蓝色',
  '浅紫色',
  '浅绿色',
  '薄荷绿',
  '雾紫色',
  '浅洋红',
  '石板灰',
  '青绿色'
]

const createDefaultCategory = () => ({
  name: '',
  icon: availableCategoryIcons[0]?.value || '',
  bgColor: presetColors[0]
})

const props = defineProps({
  modelValue: Boolean,
  categoryType: {
    type: String,
    default: 'expense'
  },
  availableIcons: {
    type: Array,
    default: () => availableCategoryIcons
  }
})

const emit = defineEmits(['update:modelValue', 'add'])
const { t } = useI18n()

const category = ref(createDefaultCategory())

const categoryTypeLabel = computed(() => {
  return props.categoryType === 'expense'
    ? t('accounting.categoryDialog.expenseType')
    : t('accounting.categoryDialog.incomeType')
})

const dialogTitle = computed(() => {
  return props.categoryType === 'expense'
    ? t('accounting.categoryDialog.expenseDialogTitle')
    : t('accounting.categoryDialog.incomeDialogTitle')
})

const normalizedIcons = computed(() => {
  return props.availableIcons.map((icon) => {
    if (typeof icon === 'string') {
      return {
        value: icon,
        label: icon
      }
    }

    return {
      value: icon.value,
      label: icon.label || icon.value
    }
  })
})

const selectedIconLabel = computed(() => {
  return normalizedIcons.value.find((item) => item.value === category.value.icon)?.label || t('accounting.categoryDialog.iconUnselected')
})

const submitDisabled = computed(() => {
  return !category.value.name.trim() || !category.value.icon
})

const resetCategory = () => {
  category.value = createDefaultCategory()
}

watch(() => props.modelValue, (visible) => {
  if (!visible) {
    resetCategory()
  }
})

const handleAdd = () => {
  if (submitDisabled.value) {
    ElMessage.warning(t('accounting.categoryDialog.incompleteWarning'))
    return
  }

  emit('add', {
    name: category.value.name.trim(),
    icon: category.value.icon,
    color: category.value.bgColor
  })

  resetCategory()
  emit('update:modelValue', false)
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

button {
  outline: none;
}
</style>
