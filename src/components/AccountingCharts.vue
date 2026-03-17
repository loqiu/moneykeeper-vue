<template>
  <div v-if="loading" class="flex h-[420px] items-center justify-center">
    <div class="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-500">
      <div class="h-3 w-3 animate-ping rounded-full bg-sky-500"></div>
      <span>{{ t('accounting.charts.loading') }}</span>
    </div>
  </div>

  <div v-else class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">{{ t('accounting.charts.insightBoard') }}</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{{ t('accounting.charts.title') }}</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">{{ t('accounting.charts.description') }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="selectedCategory"
          class="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900"
        >
          {{ t('accounting.charts.lockedCategory', { category: selectedCategory }) }}
        </span>
        <el-button
          v-if="selectedCategory"
          class="!rounded-full !border-slate-200 !bg-white !text-slate-600 hover:!border-slate-300 hover:!text-slate-900"
          @click="$emit('update:selectedCategory', '')"
        >
          <el-icon class="mr-1"><RefreshRight /></el-icon>
          {{ t('accounting.charts.clearCategory') }}
        </el-button>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-12">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 xl:col-span-5">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
              <el-icon :size="22"><PieChartIcon /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900">{{ t('accounting.charts.expenseBreakdownTitle') }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ t('accounting.charts.expenseBreakdownDescription') }}</p>
            </div>
          </div>
        </div>

        <div v-if="hasPieData" class="h-[300px] w-full">
          <v-chart
            class="chart"
            :option="pieOption"
            @click="handlePieClick"
            autoresize
          />
        </div>
        <EmptyChartState
          v-else
          :title="t('accounting.charts.expenseBreakdownEmptyTitle')"
          :description="t('accounting.charts.expenseBreakdownEmptyDescription')"
        />
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-7">
        <div class="mb-4 flex items-start gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <el-icon :size="22"><TrendCharts /></el-icon>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900">{{ t('accounting.charts.trendTitle') }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ t('accounting.charts.trendDescription') }}</p>
          </div>
        </div>

        <div v-if="hasLineData" class="h-[300px] w-full">
          <v-chart class="chart" :option="lineOption" autoresize />
        </div>
        <EmptyChartState
          v-else
          :title="t('accounting.charts.trendEmptyTitle')"
          :description="t('accounting.charts.trendEmptyDescription')"
        />
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm xl:col-span-12">
        <div class="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-amber-300 backdrop-blur">
              <el-icon :size="22"><Histogram /></el-icon>
            </div>
            <div>
              <h3 class="font-semibold">{{ t('accounting.charts.summaryTitle') }}</h3>
              <p class="mt-1 text-sm text-slate-300">{{ t('accounting.charts.summaryDescription') }}</p>
            </div>
          </div>

          <div class="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              v-for="option in timeOptions"
              :key="option.value"
              type="button"
              class="rounded-full px-4 py-2 text-sm font-medium transition-all"
              :class="timeUnit === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'"
              @click="$emit('update:timeUnit', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div v-if="hasBarData" class="h-[320px] w-full">
          <v-chart class="chart" :option="barOption" autoresize />
        </div>
        <div v-else class="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-slate-300">
          <el-icon :size="28" class="mb-3 text-amber-300"><WarningFilled /></el-icon>
          <div class="text-base font-medium text-white">{{ t('accounting.charts.timeSummaryEmptyTitle') }}</div>
          <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
            {{ t('accounting.charts.timeSummaryEmptyDescription') }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, defineEmits, defineProps, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { Histogram, PieChart as PieChartIcon, RefreshRight, TrendCharts, WarningFilled } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'

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

const props = defineProps({
  loading: Boolean,
  pieOption: {
    type: Object,
    default: () => ({})
  },
  lineOption: {
    type: Object,
    default: () => ({})
  },
  barOption: {
    type: Object,
    default: () => ({})
  },
  timeUnit: {
    type: String,
    default: 'day'
  },
  selectedCategory: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:timeUnit', 'update:selectedCategory'])
const { t } = useI18n()

const timeOptions = computed(() => ([
  { value: 'year', label: t('accounting.charts.byYear') },
  { value: 'month', label: t('accounting.charts.byMonth') },
  { value: 'day', label: t('accounting.charts.byDay') }
]))

const pieData = computed(() => props.pieOption?.series?.[0]?.data || [])
const lineData = computed(() => props.lineOption?.series?.[0]?.data || [])
const barSeries = computed(() => props.barOption?.series || [])

const hasPieData = computed(() => Array.isArray(pieData.value) && pieData.value.length > 0)
const hasLineData = computed(() => Array.isArray(lineData.value) && lineData.value.length > 0)
const hasBarData = computed(() => Array.isArray(barSeries.value) && barSeries.value.some((item) => Array.isArray(item.data) && item.data.length > 0))

const handlePieClick = (params) => {
  if (!params?.name) {
    return
  }

  emit('update:selectedCategory', params.name)
}

const EmptyChartState = defineComponent({
  name: 'EmptyChartState',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  setup(emptyProps) {
    return () => h(
      'div',
      {
        class: 'rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500'
      },
      [
        h('div', { class: 'mb-3 text-amber-500 flex justify-center' }, [
          h('span', { class: 'flex h-12 w-12 items-center justify-center rounded-full bg-amber-50' }, [
            h(WarningFilled, { size: 24 })
          ])
        ]),
        h('div', { class: 'text-base font-medium text-slate-900' }, emptyProps.title),
        h('p', { class: 'mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500' }, emptyProps.description)
      ]
    )
  }
})
</script>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}

button {
  outline: none;
}
</style>
