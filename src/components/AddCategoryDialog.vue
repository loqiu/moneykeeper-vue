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
        <p class="text-sm text-slate-500">先定义名称，再选择一个图标和颜色，让分类在列表和图表里更容易识别。</p>
      </div>
    </template>

    <div class="space-y-5">
      <section class="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-700">实时预览</p>
            <p class="mt-1 text-sm text-slate-500">当前会创建一个 {{ categoryTypeLabel }} 分类。</p>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl" :style="{ backgroundColor: category.bgColor }">
                <el-icon :size="20" :class="resolveCategoryIconClass(category.icon)"><component :is="resolveCategoryIcon(category.icon)" /></el-icon>
              </div>
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ category.name || '未命名分类' }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ selectedIconLabel }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <label class="text-sm font-medium text-slate-700">分类名称</label>
        <el-input
          v-model="category.name"
          maxlength="20"
          show-word-limit
          placeholder="例如：餐饮、通勤、工资、奖金"
          class="!mt-3 !w-full"
        />
        <p class="mt-2 text-xs text-slate-500">名称会直接展示在明细列表和图表图例中。</p>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-slate-900">图标</h3>
            <p class="mt-1 text-sm text-slate-500">尽量选择和场景含义一致的图标，后续辨识度会更高。</p>
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
          <h3 class="text-base font-semibold text-slate-900">颜色</h3>
          <p class="mt-1 text-sm text-slate-500">颜色会用于分类按钮和部分视觉提示，不影响数据逻辑。</p>
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
          {{ categoryTypeLabel }} · {{ category.name || '等待填写名称' }}
        </div>
        <div class="flex items-center justify-end gap-3">
          <el-button class="!rounded-full !px-5" @click="$emit('update:modelValue', false)">取消</el-button>
          <el-button
            type="primary"
            class="!rounded-full !border-0 !bg-slate-900 !px-6 hover:!bg-slate-800 disabled:!bg-slate-300"
            :disabled="submitDisabled"
            @click="handleAdd"
          >
            创建分类
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
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

const category = ref(createDefaultCategory())

const categoryTypeLabel = computed(() => {
  return props.categoryType === 'expense' ? '支出' : '收入'
})

const dialogTitle = computed(() => {
  return `新增${categoryTypeLabel.value}分类`
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
  return normalizedIcons.value.find((item) => item.value === category.value.icon)?.label || '未选择图标'
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
    ElMessage.warning('请填写完整的分类信息')
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