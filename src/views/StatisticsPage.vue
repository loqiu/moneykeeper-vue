<template>
  <PlatformPageShell
    eyebrow="Ledger Analytics"
    title="统计分析"
    description="统计页已经切到 ledger 维度，先承接周期总览、趋势 buckets 和分类结构，后面再接成员筛选与更细的 drill-down。"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Income</p>
          <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(statistics.totalIncome) }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ formatDelta(statistics.incomeChangePercentage) }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Expense</p>
          <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(statistics.totalExpense) }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ formatDelta(statistics.expenseChangePercentage) }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Balance</p>
          <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(statistics.balance) }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ formatDelta(statistics.balanceChangePercentage) }}</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">当前分析窗口</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            这里显示本次统计窗口和上一周期的对比基线，方便快速判断变化是否异常。
          </p>
        </div>

        <div class="mt-5 space-y-4">
          <div class="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Range</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ statistics.startDate || '-' }} ~ {{ statistics.endDate || '-' }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ periodLabelMap[filters.period] }} · {{ granularityLabel }}</p>
          </div>

          <div class="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Previous</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">
              {{ statistics.previousStartDate || '-' }} ~ {{ statistics.previousEndDate || '-' }}
            </p>
            <p class="mt-2 text-xs text-slate-500">用于计算本页所有 delta 与 change percentage</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Records</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ statistics.recordCount }}</p>
              <p class="mt-2 text-xs text-slate-500">收入 {{ statistics.incomeRecordCount }} · 支出 {{ statistics.expenseRecordCount }}</p>
            </div>
            <div class="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Anchor</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ statistics.anchorDate || filters.anchorDate }}</p>
              <p class="mt-2 text-xs text-slate-500">当前筛选的统计锚点日期</p>
            </div>
          </div>
        </div>
      </article>
    </template>

    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ currentLedgerName }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              当前页直接调用 ledger 统计接口，按 week / month / year 切换，不再依赖首页图表的局部状态。
            </p>
          </div>

          <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadStatistics">刷新统计</el-button>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,180px)_minmax(0,220px)_minmax(0,180px)_auto]">
          <el-select v-model="filters.period" class="w-full">
            <el-option
              v-for="option in periodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-date-picker
            v-model="filters.anchorDate"
            type="date"
            value-format="YYYY-MM-DD"
            class="!w-full"
            placeholder="选择锚点日期"
          />

          <el-input-number
            v-model="filters.userId"
            :min="1"
            controls-position="right"
            class="!w-full"
            placeholder="可选成员 ID"
          />

          <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" @click="loadStatistics">应用筛选</el-button>
        </div>
      </section>

      <section v-if="errorMessage" class="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {{ errorMessage }}
      </section>

      <section v-if="!hasLedgerContext" class="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p class="text-base font-medium text-slate-900">请先选择账本</p>
        <p class="mt-2 text-sm text-slate-500">统计页是账本维度功能，先到“账本中心”切到目标账本再继续。</p>
      </section>

      <section v-else-if="isLoading" class="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
        正在加载统计结果...
      </section>

      <section v-else class="grid gap-6 xl:grid-cols-2">
        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">趋势 buckets</h3>
              <p class="mt-1 text-sm text-slate-500">按 {{ granularityLabel }} 聚合收入、支出和记录数。</p>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              {{ statistics.buckets.length }} 个 bucket
            </span>
          </div>

          <div v-if="statistics.buckets.length" class="mt-5 space-y-4">
            <div
              v-for="bucket in statistics.buckets"
              :key="bucket.bucketKey"
              class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ bucket.label }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ bucket.startDate }} ~ {{ bucket.endDate }}</div>
                </div>
                <span class="text-xs text-slate-500">{{ bucket.recordCount }} 条记录</span>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-600">收入</span>
                    <span class="font-medium text-emerald-700">{{ formatCurrency(bucket.totalIncome) }}</span>
                  </div>
                  <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${bucketIncomeWidth(bucket)}%` }"></div>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-600">支出</span>
                    <span class="font-medium text-rose-700">{{ formatCurrency(bucket.totalExpense) }}</span>
                  </div>
                  <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-full rounded-full bg-rose-500" :style="{ width: `${bucketExpenseWidth(bucket)}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
            当前窗口里还没有可展示的趋势数据。
          </div>
        </article>

        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">分类占比</h3>
            <p class="mt-1 text-sm text-slate-500">按当前窗口统计收入与支出分类结构。</p>
          </div>

          <div class="mt-5 grid gap-5">
            <section class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div class="flex items-center justify-between gap-3">
                <h4 class="text-sm font-semibold text-slate-900">支出分类</h4>
                <span class="text-xs text-slate-500">{{ statistics.expenseCategories.length }} 个分类</span>
              </div>

              <div v-if="statistics.expenseCategories.length" class="mt-4 space-y-3">
                <div v-for="item in statistics.expenseCategories" :key="`expense-${item.categoryId}`">
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="font-medium text-slate-900">{{ item.categoryName }}</span>
                    <span class="text-slate-500">{{ formatCurrency(item.totalAmount) }} · {{ formatPercent(item.percentage) }}</span>
                  </div>
                  <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-full rounded-full bg-rose-500" :style="{ width: `${categoryWidth(item.percentage)}%` }"></div>
                  </div>
                </div>
              </div>

              <div v-else class="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                当前窗口没有支出分类数据。
              </div>
            </section>

            <section class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div class="flex items-center justify-between gap-3">
                <h4 class="text-sm font-semibold text-slate-900">收入分类</h4>
                <span class="text-xs text-slate-500">{{ statistics.incomeCategories.length }} 个分类</span>
              </div>

              <div v-if="statistics.incomeCategories.length" class="mt-4 space-y-3">
                <div v-for="item in statistics.incomeCategories" :key="`income-${item.categoryId}`">
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="font-medium text-slate-900">{{ item.categoryName }}</span>
                    <span class="text-slate-500">{{ formatCurrency(item.totalAmount) }} · {{ formatPercent(item.percentage) }}</span>
                  </div>
                  <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${categoryWidth(item.percentage)}%` }"></div>
                  </div>
                </div>
              </div>

              <div v-else class="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                当前窗口没有收入分类数据。
              </div>
            </section>
          </div>
        </article>
      </section>
    </div>
  </PlatformPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import { fetchLedgerStatistics } from '@/api/modules/statistics'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2
})

const today = new Date().toISOString().slice(0, 10)

const ledgerStore = useLedgerStore()
const { currentLedgerId, currentLedger } = storeToRefs(ledgerStore)

const isLoading = ref(false)
const errorMessage = ref('')
const statistics = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  recordCount: 0,
  incomeRecordCount: 0,
  expenseRecordCount: 0,
  incomeChangePercentage: null,
  expenseChangePercentage: null,
  balanceChangePercentage: null,
  startDate: '',
  endDate: '',
  previousStartDate: '',
  previousEndDate: '',
  anchorDate: today,
  bucketGranularity: 'day',
  buckets: [],
  expenseCategories: [],
  incomeCategories: []
})

const filters = reactive({
  period: 'month',
  anchorDate: today,
  userId: null
})

const periodOptions = [
  { label: '按周', value: 'week' },
  { label: '按月', value: 'month' },
  { label: '按年', value: 'year' }
]

const periodLabelMap = {
  week: '按周',
  month: '按月',
  year: '按年'
}

const hasLedgerContext = computed(() => Boolean(currentLedgerId.value))
const currentLedgerName = computed(() => currentLedger.value?.name || '请先选择账本')
const granularityLabel = computed(() => (statistics.value.bucketGranularity === 'month' ? '月' : '日'))
const maxBucketAmount = computed(() => {
  return Math.max(
    1,
    ...statistics.value.buckets.map((bucket) => Math.max(bucket.totalIncome, bucket.totalExpense))
  )
})

const buildQuery = () => {
  const query = {
    period: filters.period,
    anchorDate: filters.anchorDate
  }

  if (filters.userId) {
    query.userId = Number(filters.userId)
  }

  return query
}

const loadStatistics = async () => {
  if (!currentLedgerId.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    statistics.value = await fetchLedgerStatistics(currentLedgerId.value, buildQuery())
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, '获取统计数据失败')
  } finally {
    isLoading.value = false
  }
}

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0)

const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`

const formatDelta = (value) => {
  if (value === null || typeof value === 'undefined') {
    return '上一周期无可比较基线'
  }

  const numeric = Number(value) || 0
  const prefix = numeric > 0 ? '+' : ''
  return `${prefix}${numeric.toFixed(2)}% vs previous`
}

const bucketIncomeWidth = (bucket) => {
  return Math.min(100, Math.max(0, (bucket.totalIncome / maxBucketAmount.value) * 100))
}

const bucketExpenseWidth = (bucket) => {
  return Math.min(100, Math.max(0, (bucket.totalExpense / maxBucketAmount.value) * 100))
}

const categoryWidth = (percentage) => {
  return Math.min(100, Math.max(0, Number(percentage) || 0))
}

watch(
  () => currentLedgerId.value,
  async (ledgerId) => {
    if (!ledgerId) {
      return
    }

    await loadStatistics()
  },
  { immediate: true }
)

onMounted(async () => {
  if (!ledgerStore.initialized) {
    await ledgerStore.initializeLedgers()
  }
})
</script>

<style scoped>
:deep(.el-select__wrapper) {
  border-radius: 18px;
  min-height: 42px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  width: 100%;
}
</style>
