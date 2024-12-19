<template>
  <el-row :gutter="20" class="charts-section" v-if="!loading">
    <!-- 分类饼图 -->
    <el-col :span="8">
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>支出分类占比</h3>
            <el-button 
              v-if="selectedCategory"
              size="small"
              @click="$emit('update:selectedCategory', null)"
            >
              清除筛选
            </el-button>
          </div>
        </template>
        <div class="chart-container">
          <v-chart 
            ref="pieChartRef"
            class="chart" 
            :option="pieOption" 
            @click="handlePieClick"
          />
        </div>
      </el-card>
    </el-col>
    
    <!-- 支出趋势图 -->
    <el-col :span="8">
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>支出趋势</h3>
          </div>
        </template>
        <div class="chart-container">
          <v-chart 
            ref="lineChartRef"
            class="chart" 
            :option="lineOption"
          />
        </div>
      </el-card>
    </el-col>
    
    <!-- 月度统计图 -->
    <el-col :span="8">
      <el-card class="chart-card" :body-style="{ padding: '20px' }">
        <template #header>
          <div class="chart-header">
            <h3>年度统计</h3>
            <el-radio-group 
              :modelValue="timeUnit"
              @update:modelValue="$emit('update:timeUnit', $event)" 
              size="small"
            >
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="day">日</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container">
          <v-chart 
            ref="barChartRef"
            class="chart" 
            :option="barOption"
          />
        </div>
      </el-card>
    </el-col>
  </el-row>

  <el-row v-else>
    <el-col :span="24">
      <div class="loading-container" v-loading="true">
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  PieChart,
  LineChart,
  BarChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册必需的 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

// 定义props
defineProps({
  loading: Boolean,
  pieOption: Object,
  lineOption: Object,
  barOption: Object,
  timeUnit: String,
  selectedCategory: [String, null]
})

// 定义emit
const emit = defineEmits(['update:timeUnit', 'update:selectedCategory'])

// 处理饼图点击
const handlePieClick = (params) => {
  console.log('饼图点击参数：', params)
  if (params.data) {
    emit('update:selectedCategory', params.data.name)
  }
}
</script>

<style src="@/assets/styles/accountingCharts.css" scoped></style> 