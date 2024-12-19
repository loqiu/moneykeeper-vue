<template>
  <el-card class="form-section" :body-style="{ padding: '20px' }">
    <template #header>
      <div class="card-header">
        <h2>添加新记录</h2>
      </div>
    </template>
    
    <el-form :model="localRecord" class="add-record-form">
      <div class="form-content">
        <el-form-item label="类型" class="form-item">
          <el-select 
            :model-value="localRecord.type" 
            @update:model-value="updateRecord('type', $event)"
            class="form-input"
          >
            <el-option label="支出" value="expense" />
            <el-option label="收入" value="income" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="金额" class="form-item">
          <el-input-number 
            :model-value="localRecord.amount"
            @update:model-value="updateRecord('amount', $event)"
            :min="0" 
            :precision="2" 
            :step="0.01"
            class="form-input"
          />
        </el-form-item>
        
        <el-form-item label="分类" class="form-item">
          <div class="category-icons">
            <template v-if="localRecord.type === 'expense'">
              <el-tooltip
                v-for="(item, index) in expenseCategories"
                :key="index"
                :content="item.name"
                placement="top"
              >
                <el-button
                  :class="{ active: localRecord.category === item.id }"
                  class="icon-button"
                  circle
                  @click="handleCategorySelect(item)"
                  :style="{ backgroundColor: item.bgColor || '#f5f5f5' }"
                >
                  <el-icon><Icon :icon="item.icon" /></el-icon>
                  <span class="delete-icon" @click.stop="handleDeleteCategory(index, 'expense')">
                    <el-icon><Close /></el-icon>
                  </span>
                </el-button>
              </el-tooltip>
              <el-tooltip content="添加新分类" placement="top">
                <el-button
                  class="icon-button add-button"
                  circle
                  @click="handleShowAddCategoryDialog(localRecord.type)"
                >
                  <el-icon><Plus /></el-icon>
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
                  :class="{ active: localRecord.category === item.id }"
                  class="icon-button"
                  circle
                  @click="handleCategorySelect(item)"
                  :style="{ backgroundColor: item.bgColor || '#f5f5f5' }"
                >
                  <el-icon><Icon :icon="item.icon" /></el-icon>
                  <span class="delete-icon" @click.stop="handleDeleteCategory(index, 'income')">
                    <el-icon><Close /></el-icon>
                  </span>
                </el-button>
              </el-tooltip>
              <el-tooltip content="添加新分类" placement="top">
                <el-button
                  class="icon-button add-button"
                  circle
                  @click="handleShowAddCategoryDialog(localRecord.type)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </div>
        </el-form-item>
        
        <el-form-item label="日期" class="form-item">
          <el-date-picker
            :model-value="localRecord.date"
            @update:model-value="updateRecord('date', $event)"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :default-value="new Date()"
            class="form-input"
          />
        </el-form-item>
        
        <el-form-item label="备注" class="form-item">
          <el-input 
            :model-value="localRecord.note"
            @update:model-value="updateRecord('note', $event)"
            class="form-input"
            placeholder="请输入备注"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
        
        <el-button type="primary" @click="handleSubmit" class="submit-button">
          添加记录
        </el-button>
      </div>
    </el-form>
  </el-card>
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

<style src="@/assets/styles/addRecordForm.css" scoped></style> 