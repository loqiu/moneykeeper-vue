<template>
  <div class="p-4">
    <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <el-icon class="text-indigo-500"><Plus /></el-icon>
      添加新记录
    </h2>
    
    <el-form :model="localRecord" class="space-y-4">
      <div class="space-y-4">
        <!-- 类型选择 -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
          <div class="flex gap-4">
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
        </div>
        
        <!-- 金额输入 -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">金额</label>
          <el-input-number 
            :model-value="localRecord.amount"
            @update:model-value="updateRecord('amount', $event)"
            :min="0" 
            :precision="2" 
            :step="0.01"
            class="!w-full"
            placeholder="0.00"
            :controls="false"
          />
        </div>
        
        <!-- 分类选择 -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <div class="grid grid-cols-4 gap-3">
            <template v-if="localRecord.type === 'expense'">
              <div
                v-for="(item, index) in expenseCategories"
                :key="index"
                class="flex flex-col items-center gap-1 cursor-pointer group relative"
                @click="handleCategorySelect(item)"
              >
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm"
                  :class="localRecord.category === item.id ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'"
                  :style="{ backgroundColor: item.bgColor || '#f3f4f6', color: localRecord.category === item.id ? '#fff' : '#4b5563' }"
                >
                  <el-icon :size="20"><Icon :icon="item.icon" /></el-icon>
                </div>
                <span class="text-xs text-gray-500 truncate w-full text-center">{{ item.name }}</span>
                
                <!-- 删除按钮 -->
                <div 
                  class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md z-10"
                  @click.stop="handleDeleteCategory(index, 'expense')"
                >
                  <el-icon :size="10"><Close /></el-icon>
                </div>
              </div>
            </template>
            <template v-else>
              <div
                v-for="(item, index) in incomeCategories"
                :key="index"
                class="flex flex-col items-center gap-1 cursor-pointer group relative"
                @click="handleCategorySelect(item)"
              >
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm"
                  :class="localRecord.category === item.id ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'"
                  :style="{ backgroundColor: item.bgColor || '#f3f4f6', color: localRecord.category === item.id ? '#fff' : '#4b5563' }"
                >
                  <el-icon :size="20"><Icon :icon="item.icon" /></el-icon>
                </div>
                <span class="text-xs text-gray-500 truncate w-full text-center">{{ item.name }}</span>
                
                <div 
                  class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md z-10"
                  @click.stop="handleDeleteCategory(index, 'income')"
                >
                  <el-icon :size="10"><Close /></el-icon>
                </div>
              </div>
            </template>
            
            <!-- 添加按钮 -->
            <div 
              class="flex flex-col items-center gap-1 cursor-pointer group"
              @click="handleShowAddCategoryDialog(localRecord.type)"
            >
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors border border-dashed border-gray-300">
                <el-icon :size="20"><Plus /></el-icon>
              </div>
              <span class="text-xs text-gray-400">添加</span>
            </div>
          </div>
        </div>
        
        <!-- 日期选择 -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <el-date-picker
            :model-value="localRecord.date"
            @update:model-value="updateRecord('date', $event)"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :default-value="new Date()"
            class="!w-full"
          />
        </div>
        
        <!-- 备注输入 -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <el-input 
            :model-value="localRecord.note"
            @update:model-value="updateRecord('note', $event)"
            placeholder="写点什么..."
            maxlength="255"
            show-word-limit
            type="textarea"
            :rows="2"
            resize="none"
          />
        </div>
        
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          class="!w-full !h-10 !text-base !font-semibold !rounded-lg !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
          添加记录
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Plus } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { h } from 'vue'

// 注册所有图标组件
const Icon = (props) => {
  const { icon } = props
  return h(ElementPlusIconsVue[icon])
}

const props = defineProps({
  newRecord: {
    type: Object,
    required: true
  },
  expenseCategories: Array,
  incomeCategories: Array
})
const localRecord = ref({ ...props.newRecord })

// 监听 props 变化
watch(() => props.newRecord, (newVal) => {
  localRecord.value = { ...newVal }
}, { deep: true })

const emit = defineEmits([
  'update:newRecord',
  'add-record',
  'delete-category',
  'show-add-category-dialog'
])

const updateRecord = (field, value) => {
  const updatedRecord = {
    ...localRecord.value,
    [field]: value
  }
  localRecord.value = updatedRecord
  emit('update:newRecord', updatedRecord)
}

const handleCategorySelect = (category) => {
  emit('update:newRecord', {
    ...localRecord.value,
    category: category.id,
    categoryName: category.name
  })
}

const handleDeleteCategory = async (index, type) => {
  // 获取要删除的分类对象
  const category = type === 'expense' 
    ? props.expenseCategories[index] 
    : props.incomeCategories[index]
    
  emit('delete-category', { category, type })
}

const handleShowAddCategoryDialog = (type) => {
  emit('show-add-category-dialog', type)
}

const handleSubmit = () => {
  if (!localRecord.value.amount || !localRecord.value.category) {
    ElMessage.warning('请填写完整的记账信息')
    return
  }
  emit('add-record', localRecord.value)
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