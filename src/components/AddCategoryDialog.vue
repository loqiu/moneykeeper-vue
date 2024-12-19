<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="`添加${categoryType === 'expense' ? '支出' : '收入'}分类`"
    width="50%"
  >
    <el-form :model="category" label-width="80px">
      <el-form-item label="名称">
        <el-input v-model="category.name" class="category-name-input" placeholder="请输入分类名称" />
      </el-form-item>
      
      <el-form-item label="图标">
        <div class="icon-grid">
          <el-tooltip
            v-for="icon in availableIcons"
            :key="icon.value"
            :content="icon.label"
            placement="top"
          >
            <el-button
              :class="{ 'active': category.icon === icon.value }"
              class="icon-button"
              circle
              @click="category.icon = icon.value"
            >
              <el-icon><component :is="icon.value" /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </el-form-item>

      <el-form-item label="颜色">
        <!-- <el-color-picker v-model="category.bgColor" /> -->
        <div class="color-grid">
            <template v-for="(color, index) in presetColors" :key="color">
                <el-tooltip 
                :content="colorNames[index]" 
                placement="top">
                <div
                    class="color-item"
                    :class="{ 'active': category.bgColor === color }"
                    :style="{ backgroundColor: color }"
                    @click="handleColorClick(color, index)"
                ></div>
                </el-tooltip>
            </template>

        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
// 定义可用的图标列表
const iconList = [
  'Money', 'Food', 'House', 'Van', 'Shop', 
  'ShoppingCart', 'Present', 'Goods', 'Wallet',
  'Basketball', 'Ship', 'Ticket', 'School',
  'Coffee', 'Apple', 'Burger', 'Sugar', 'Dessert'
]

export default {
  name: 'AddCategoryDialog',
  props: {
    modelValue: Boolean,
    categoryType: String,
    availableIcons: {
      type: Array,
      default: () => iconList
    }
  }
}
</script>

<script setup>
import { ref, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['update:modelValue', 'add'])  
// 预设颜色列表
const presetColors = [
  '#fef0f0', // 浅红
  '#f0f9eb', // 浅绿
  '#f5f7fa', // 浅灰
  '#ecf5ff', // 浅蓝
  '#fdf6ec', // 浅橙
  '#f4f4f5', // 浅灰白
  '#e8f4d9', // 青柠
  '#fdf1f1', // 粉红
  '#f0f7ff', // 天蓝
  '#fef7e6', // 米黄
  '#f5f5f5', // 灰白
  '#e6f7ff'  // 淡蓝
]
const colorNames = [
  '浅红色',
  '浅绿色',
  '浅灰色',
  '浅蓝色',
  '浅橙色',
  '浅灰白色',
  '青柠色',
  '粉红色',
  '天蓝色',
  '米黄色',
  '灰白色',
  '淡蓝色'
]
// console.log('预设颜色数组：', presetColors)
// console.log('预设颜色名称数组：', colorNames)
const defaultCategory = {
  name: '',
  icon: '',
  bgColor: presetColors[0]  // 默认颜色
}

const category = ref({ ...defaultCategory })

// 在颜色点击事件中添加日志
const handleColorClick = (color, index) => {
//   console.log('点击的颜色：', color)
//   console.log('颜色索引：', index)
//   console.log('颜色名称：', colorNames[index])
  category.value.bgColor = color
}

const handleAdd = () => {
  if (!category.value.name || !category.value.icon) {
    ElMessage.warning('请填写完整的分类信息')
    return
  }
    // 创建正确的分类对象
  const newCategory = {
    name: category.value.name,        // 分类名称
    icon: category.value.icon,        // 图标
    color: category.value.bgColor     // 使用 color 作为属性名而不是 bgColor
  }
  console.log("newCategory: ", newCategory)
  emit('add', newCategory)
  category.value = { 
    ...defaultCategory,
    bgColor: category.value.bgColor  // 保留当前选择的颜色
  }
  emit('update:modelValue', false)
}
</script>

<style src="@/assets/styles/addCategoryDialog.css" scoped></style> 