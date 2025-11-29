<template>
  <div class="space-y-6" v-if="!loading">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 分类饼图 -->
      <div class="bg-white/50 rounded-xl p-4 shadow-sm border border-white/40">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-gray-700 font-bold">支出分类占比</h3>
          <el-button 
            v-if="selectedCategory"
            size="small"
            link
            type="primary"
            @click="$emit('update:selectedCategory', null)"
          >
            清除筛选
          </el-button>
        </div>
        <div class="h-[250px] w-full">
          <v-chart 
            ref="pieChartRef"
            class="chart" 
            :option="pieOption" 
            @click="handlePieClick"
            autoresize
          />
        </div>
      </div>
      
      <!-- 支出趋势图 -->
      <div class="bg-white/50 rounded-xl p-4 shadow-sm border border-white/40">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-gray-700 font-bold">支出趋势</h3>
        </div>
        <div class="h-[250px] w-full">
          <v-chart 
            ref="lineChartRef"
            class="chart" 
            :option="lineOption"
            autoresize
          />
        </div>
      </div>
      
      <!-- 月度统计图 -->
      <div class="bg-white/50 rounded-xl p-4 shadow-sm border border-white/40">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-gray-700 font-bold">年度统计</h3>
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
        <div class="h-[250px] w-full">
          <v-chart 
            ref="barChartRef"
            class="chart" 
            :option="barOption"
            autoresize
          />
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex justify-center items-center h-[300px]">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
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

<style scoped>
/* TailwindCSS handles styling */
.chart {
  height: 100%;
  width: 100%;
}
</style>