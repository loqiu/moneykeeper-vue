<template>
  <el-card class="records-section" :body-style="{ padding: '20px' }" v-loading="loading">
    <div class="category-filter">
      <!-- 选择类型（收入/支出） -->
      <el-select v-model="selectedType" placeholder="请选择类型" @change="handleTypeChange">
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>

      <!-- 选择分类 -->
      <el-select v-model="selectedCategory" placeholder="请选择分类" @change="handleCategoryChange">
        <el-option
          v-for="item in categoryList"
          :key="item.id"
          :label="item.name"
          :value="item.name">
        </el-option>
      </el-select>
      <el-button type="default" @click="handleReset" style="margin-left: 10px;">
        重置
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
/* global defineEmits */
// emit事件定义，必须放在最前面
const emit = defineEmits(['filter-change']);
import { useCategoryFilter } from '@/composables/categoryFilter';

// 组合式函数获取分类数据
const {
  selectedType,
  selectedCategory,
  categoryList,
  onTypeChange,
  onCategoryChange
} = useCategoryFilter();

const typeOptions = [
  { value: 'expense', label: '支出' },
  { value: 'income', label: '收入' }
];

// 监听下拉变化，处理事件
function handleTypeChange(val) {
  onTypeChange(val);
}
async function handleCategoryChange(val) {
    const recordList = await onCategoryChange(val);
    emit('filter-change', recordList);
}
// 重置按钮逻辑
async function handleReset() {
    // 清空分类选择
    selectedCategory.value = '';
    emit('reset-filter'); // 通知父组件重置
}
</script>

<style>
/* 简单样式，可根据需要调整 */
.category-filter {
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
}
</style>