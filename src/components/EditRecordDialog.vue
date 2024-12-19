<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="修改记录"
    width="50%"
    :close-on-click-modal="false"
  >
    <el-form v-if="record && modelValue" label-width="80px">
      <el-form-item label="类型">
        <el-select 
          :model-value="localRecord.type"
          @update:model-value="updateRecord('type', $event)"
        >
          <el-option label="支出" value="expense" />
          <el-option label="收入" value="income" />
        </el-select>
      </el-form-item>

      <el-form-item label="金额">
        <el-input-number 
          :model-value="localRecord.amount"
          @update:model-value="updateRecord('amount', $event)"
          :min="0" 
          :precision="2" 
          :step="0.01"
        />
      </el-form-item>

      <el-form-item label="分类">
        <div class="category-icons">
          <template v-if="localRecord.type === 'expense'">
            <el-tooltip
              v-for="(item, index) in expenseCategories"
              :key="index"
              :content="item.name"
              placement="top"
            >
              <el-button
                :class="{ active: Number(localRecord.category) === Number(item.id) }"
                class="icon-button"
                circle
                @click="updateRecord('category', item.id)"
                :style="{ backgroundColor: item.bgColor || '#f5f5f5' }"
              >
                <el-icon><Icon :icon="item.icon" /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
          <template v-else>
            <el-tooltip
              v-for="(item, index) in incomeCategories"
              :key="index"
              :content="item.name"
              placement="top"
            >
              <el-button
                :class="{ active: Number(localRecord.category) === Number(item.id) }"
                class="icon-button"
                circle
                @click="updateRecord('category', item.id)"
                :style="{ backgroundColor: item.bgColor || '#f5f5f5' }"
              >
                <el-icon><Icon :icon="item.icon" /></el-icon>
              </el-button>
            </el-tooltip>
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
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input 
          :model-value="localRecord.note"
          @update:model-value="updateRecord('note', $event)"
          placeholder="请输入备注"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button 
          type="primary" 
          @click="$emit('save', localRecord)"
          :disabled="!record"
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

<style src="@/assets/styles/editRecordDialog.css" scoped></style> 