<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="dialogTitle"
    width="500px"
    class="!rounded-2xl"
  >
    <el-form :model="category" label-width="60px" class="space-y-4">
      <el-form-item label="名称">
        <el-input
          v-model="category.name"
          placeholder="请输入分类名称"
          class="!w-full"
        />
      </el-form-item>

      <el-form-item label="图标">
        <div class="grid grid-cols-6 gap-2 w-full max-h-[200px] overflow-y-auto p-1">
          <div
            v-for="icon in normalizedIcons"
            :key="icon.value"
            class="flex items-center justify-center"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-gray-100"
              :class="category.icon === icon.value ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500 ring-offset-2' : 'text-gray-500'"
              :title="icon.label"
              @click="category.icon = icon.value"
            >
              <el-icon :size="20"><component :is="icon.value" /></el-icon>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="颜色">
        <div class="grid grid-cols-6 gap-3 w-full">
          <div
            v-for="(color, index) in presetColors"
            :key="color"
            class="flex items-center justify-center"
          >
            <div
              class="w-8 h-8 rounded-full cursor-pointer transition-all shadow-sm hover:scale-110"
              :class="category.bgColor === color ? 'ring-2 ring-gray-400 ring-offset-2 scale-110' : ''"
              :style="{ backgroundColor: color }"
              :title="colorNames[index]"
              @click="category.bgColor = color"
            ></div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button class="!rounded-lg" @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button
          type="primary"
          class="!rounded-lg !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700"
          @click="handleAdd"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const presetColors = [
  '#fef0f0',
  '#f0f9eb',
  '#f5f7fa',
  '#ecf5ff',
  '#fdf6ec',
  '#f4f4f5',
  '#e8f4d9',
  '#fdf1f1',
  '#f0f7ff',
  '#fef7e6',
  '#f5f5f5',
  '#e6f7ff'
]

const colorNames = [
  '浅红色',
  '浅绿色',
  '浅灰色',
  '浅蓝色',
  '浅橙色',
  '浅灰白',
  '青柠色',
  '粉红色',
  '天蓝色',
  '米黄色',
  '灰白色',
  '淡蓝色'
]

const defaultCategory = {
  name: '',
  icon: '',
  bgColor: presetColors[0]
}

const props = defineProps({
  modelValue: Boolean,
  categoryType: {
    type: String,
    default: 'expense'
  },
  availableIcons: {
    type: Array,
    default: () => ([
      'Money', 'Food', 'House', 'Van', 'Shop',
      'ShoppingCart', 'Present', 'Goods', 'Wallet',
      'Basketball', 'Ship', 'Ticket', 'School',
      'Coffee', 'Apple', 'Burger', 'Sugar', 'Dessert'
    ])
  }
})

const emit = defineEmits(['update:modelValue', 'add'])

const category = ref({ ...defaultCategory })

const dialogTitle = computed(() => {
  return `添加${props.categoryType === 'expense' ? '支出' : '收入'}分类`
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

watch(() => props.modelValue, (visible) => {
  if (!visible) {
    category.value = { ...defaultCategory }
  }
})

const handleAdd = () => {
  if (!category.value.name || !category.value.icon) {
    ElMessage.warning('请填写完整的分类信息')
    return
  }

  emit('add', {
    name: category.value.name,
    icon: category.value.icon,
    color: category.value.bgColor
  })

  category.value = { ...defaultCategory }
  emit('update:modelValue', false)
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
