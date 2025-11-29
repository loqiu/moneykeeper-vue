<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="修改记录"
    width="500px"
    :close-on-click-modal="false"
    class="!rounded-2xl"
  >
    <el-form v-if="record && modelValue" label-width="60px" class="space-y-4">
      <el-form-item label="类型">
        <div class="flex gap-4 w-full">
          <div 
            class="flex-1 cursor-pointer py-2 text-center rounded-lg border transition-all"
            :class="localRecord.type === 'expense' ? 'bg-red-50 border-red-200 text-red-600 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'"
            @click="updateRecord('type', 'expense')"
          >
            支出
          </div>
          <div 
            class="flex-1 cursor-pointer py-2 text-center rounded-lg border transition-all"
            :class="localRecord.type === 'income' ? 'bg-green-50 border-green-200 text-green-600 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'"
            @click="updateRecord('type', 'income')"
          >
            收入
          </div>
        </div>
      </el-form-item>

      <el-form-item label="金额">
        <el-input-number 
          :model-value="localRecord.amount"
          @update:model-value="updateRecord('amount', $event)"
          :min="0" 
          :precision="2" 
          :step="0.01"
          class="!w-full"
          :controls="false"
        />
      </el-form-item>

      <el-form-item label="分类">
        <div class="grid grid-cols-5 gap-3 w-full max-h-[200px] overflow-y-auto p-1">
          <template v-if="localRecord.type === 'expense'">
            <div
              v-for="(item, index) in expenseCategories"
              :key="index"
              class="flex flex-col items-center gap-1 cursor-pointer group"
              @click="updateRecord('category', item.id)"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm"
                :class="Number(localRecord.category) === Number(item.id) ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'"
                :style="{ backgroundColor: item.bgColor || '#f3f4f6', color: Number(localRecord.category) === Number(item.id) ? '#fff' : '#4b5563' }"
              >
                <el-icon :size="20"><Icon :icon="item.icon" /></el-icon>
              </div>
              <span class="text-xs text-gray-500 truncate w-full text-center">{{ item.name }}</span>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, index) in incomeCategories"
              :key="index"
              class="flex flex-col items-center gap-1 cursor-pointer group"
              @click="updateRecord('category', item.id)"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm"
                :class="Number(localRecord.category) === Number(item.id) ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'"
                :style="{ backgroundColor: item.bgColor || '#f3f4f6', color: Number(localRecord.category) === Number(item.id) ? '#fff' : '#4b5563' }"
              >
                <el-icon :size="20"><Icon :icon="item.icon" /></el-icon>
              </div>
              <span class="text-xs text-gray-500 truncate w-full text-center">{{ item.name }}</span>
            </div>
          </template>
        </div>
      </el-form-item>

      <el-form-item label="日期">
        <el-date-picker
          :model-value="localRecord.date"
          @update:model-value="updateRecord('date', $event)"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="!w-full"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input 
          :model-value="localRecord.note"
          @update:model-value="updateRecord('note', $event)"
          placeholder="请输入备注"
          maxlength="255"
          show-word-limit
          type="textarea"
          :rows="2"
          resize="none"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('cancel')" class="!rounded-lg">取消</el-button>
        <el-button 
          type="primary" 
          @click="$emit('save', localRecord)"
          :disabled="!record"
          class="!rounded-lg !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch,defineEmits, defineProps } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { h } from 'vue'

const emit = defineEmits(['update:modelValue', 'cancel', 'save', 'update:record'])

const Icon = (props) => {
  const { icon } = props
  return h(ElementPlusIconsVue[icon])
}

const props = defineProps({
  modelValue: Boolean,
  record: {
    type: Object,
    default: () => ({
      type: 'expense',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    })
  },
  expenseCategories: Array,
  incomeCategories: Array
})

const localRecord = ref({ ...props.record })

watch(() => props.record, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    localRecord.value = {
      ...newVal,
      category: newVal.categoryId || newVal.category // 确保使用正确的 categoryId
    }
    // console.log('本地记录：', localRecord.value) // 调试用
  }
}, { deep: true, immediate: true })

const updateRecord = (field, value) => {
    // console.log('更新字段:', field, '新值:', value) // 调试用
  if (field === 'category') {
    localRecord.value = {
      ...localRecord.value,
      category: value,
      categoryId: value  // 同时更新 categoryId
    }
  } else {
    localRecord.value = {
      ...localRecord.value,
      [field]: value
    }
  }
//   console.log('更新后的记录:', localRecord.value) // 调试用
  emit('update:record', localRecord.value)
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