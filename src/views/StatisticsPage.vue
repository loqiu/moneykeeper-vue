<template>
  <PlatformPageShell
    :eyebrow="t('platform.statistics.eyebrow')"
    :title="t('platform.statistics.title')"
    :description="t('platform.statistics.description')"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.statistics.summary.incomeLabel') }}</p>
          <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(statistics.totalIncome) }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ formatDelta(statistics.incomeChangePercentage) }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.statistics.summary.expenseLabel') }}</p>
          <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(statistics.totalExpense) }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ formatDelta(statistics.expenseChangePercentage) }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.statistics.summary.balanceLabel') }}</p>
          <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(statistics.balance) }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ formatDelta(statistics.balanceChangePercentage) }}</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.statistics.window.title') }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ t('platform.statistics.window.description') }}
          </p>
        </div>

        <div class="mt-5 space-y-4">
          <div class="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ t('platform.statistics.window.rangeLabel') }}</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ statistics.startDate || '-' }} ~ {{ statistics.endDate || '-' }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ selectedPeriodLabel }} · {{ granularityLabel }}</p>
          </div>

          <div class="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ t('platform.statistics.window.previousLabel') }}</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">
              {{ statistics.previousStartDate || '-' }} ~ {{ statistics.previousEndDate || '-' }}
            </p>
            <p class="mt-2 text-xs text-slate-500">{{ t('platform.statistics.window.previousHint') }}</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ t('platform.statistics.window.recordsLabel') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ statistics.recordCount }}</p>
              <p class="mt-2 text-xs text-slate-500">
                {{ t('platform.statistics.window.recordsHint', { income: statistics.incomeRecordCount, expense: statistics.expenseRecordCount }) }}
              </p>
            </div>
            <div class="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ t('platform.statistics.window.anchorLabel') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ statistics.anchorDate || filters.anchorDate }}</p>
              <p class="mt-2 text-xs text-slate-500">{{ t('platform.statistics.window.anchorHint') }}</p>
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
              {{ t('platform.statistics.ledgerDescription') }}
            </p>
          </div>

          <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadStatistics">
            {{ t('platform.statistics.actions.refresh') }}
          </el-button>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,180px)_minmax(0,220px)_minmax(0,220px)_auto]">
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
            :placeholder="t('platform.statistics.filters.anchorPlaceholder')"
          />

          <el-select
            v-model="filters.userId"
            clearable
            class="w-full"
            :placeholder="t('platform.statistics.filters.memberPlaceholder')"
          >
            <el-option :label="t('platform.statistics.filters.allMembers')" :value="null" />
            <el-option
              v-for="member in memberOptions"
              :key="member.value"
              :label="member.label"
              :value="member.value"
            />
          </el-select>

          <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" @click="loadStatistics">
            {{ t('platform.statistics.actions.applyFilters') }}
          </el-button>
        </div>
      </section>

      <PlatformStateCard
        v-if="errorMessage"
        variant="error"
        compact
        :centered="false"
        :title="t('platform.statistics.states.errorTitle')"
        :description="errorMessage"
        :action-label="t('common.refresh')"
        @action="loadStatistics"
      />

      <PlatformStateCard
        v-else-if="!hasLedgerContext"
        variant="warning"
        :title="t('platform.statistics.states.ledgerRequiredTitle')"
        :description="t('platform.statistics.states.ledgerRequiredDescription')"
      >
        <template #actions>
          <router-link
            to="/ledgers"
            class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            {{ t('platform.statistics.states.ledgerRequiredAction') }}
          </router-link>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-else-if="isLoading"
        variant="loading"
        :title="t('platform.statistics.states.loadingTitle')"
        :description="t('platform.statistics.states.loadingDescription')"
      />

      <PlatformStateCard
        v-else-if="!hasStatisticsData"
        variant="empty"
        :title="t('platform.statistics.states.emptyTitle')"
        :description="t('platform.statistics.states.emptyDescription')"
      />

      <section v-else class="grid gap-6 xl:grid-cols-2">
        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">{{ t('platform.statistics.trend.title') }}</h3>
              <p class="mt-1 text-sm text-slate-500">
                {{ t('platform.statistics.trend.description', { granularity: granularityLabel }) }}
              </p>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              {{ t('platform.statistics.trend.bucketCount', { count: statistics.buckets.length }) }}
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
                <span class="text-xs text-slate-500">{{ t('platform.statistics.trend.records', { count: bucket.recordCount }) }}</span>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-600">{{ t('platform.statistics.trend.income') }}</span>
                    <span class="font-medium text-emerald-700">{{ formatCurrency(bucket.totalIncome) }}</span>
                  </div>
                  <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${bucketIncomeWidth(bucket)}%` }"></div>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-600">{{ t('platform.statistics.trend.expense') }}</span>
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
            {{ t('platform.statistics.trend.empty') }}
          </div>
        </article>

        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ t('platform.statistics.categories.title') }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ t('platform.statistics.categories.description') }}</p>
          </div>

          <div class="mt-5 grid gap-5">
            <section class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div class="flex items-center justify-between gap-3">
                <h4 class="text-sm font-semibold text-slate-900">{{ t('platform.statistics.categories.expenseTitle') }}</h4>
                <span class="text-xs text-slate-500">{{ t('platform.statistics.categories.count', { count: statistics.expenseCategories.length }) }}</span>
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
                {{ t('platform.statistics.categories.expenseEmpty') }}
              </div>
            </section>

            <section class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div class="flex items-center justify-between gap-3">
                <h4 class="text-sm font-semibold text-slate-900">{{ t('platform.statistics.categories.incomeTitle') }}</h4>
                <span class="text-xs text-slate-500">{{ t('platform.statistics.categories.count', { count: statistics.incomeCategories.length }) }}</span>
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
                {{ t('platform.statistics.categories.incomeEmpty') }}
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
import { useI18n } from 'vue-i18n'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import { fetchLedgerMembers } from '@/api/modules/ledgers'
import { fetchLedgerStatistics } from '@/api/modules/statistics'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'

const { t, locale } = useI18n()

const today = new Date().toISOString().slice(0, 10)

const ledgerStore = useLedgerStore()
const { currentLedgerId, currentLedger } = storeToRefs(ledgerStore)

const isLoading = ref(false)
const errorMessage = ref('')
const memberOptions = ref([])
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

const currencyFormatter = computed(() => new Intl.NumberFormat(locale.value, {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2
}))

const periodOptions = computed(() => [
  { label: t('platform.statistics.filters.period.week'), value: 'week' },
  { label: t('platform.statistics.filters.period.month'), value: 'month' },
  { label: t('platform.statistics.filters.period.year'), value: 'year' }
])

const hasLedgerContext = computed(() => Boolean(currentLedgerId.value))
const currentLedgerName = computed(() => currentLedger.value?.name || t('platform.ledgers.messages.currentLedgerFallback'))
const selectedPeriodLabel = computed(() => t(`platform.statistics.filters.period.${filters.period}`))
const granularityLabel = computed(() => t(`platform.statistics.filters.granularity.${statistics.value.bucketGranularity === 'month' ? 'month' : 'day'}`))
const hasStatisticsData = computed(() => Boolean(
  statistics.value.recordCount ||
    statistics.value.buckets.length ||
    statistics.value.expenseCategories.length ||
    statistics.value.incomeCategories.length
))
const maxBucketAmount = computed(() => Math.max(
  1,
  ...statistics.value.buckets.map((bucket) => Math.max(bucket.totalIncome, bucket.totalExpense))
))

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

const loadMembers = async () => {
  if (!currentLedgerId.value) {
    memberOptions.value = []
    return
  }

  const members = await fetchLedgerMembers(currentLedgerId.value)
  memberOptions.value = members.map((member) => ({
    value: Number(member.userId),
    label: member.email ? `${member.username || t('platform.statistics.filters.memberFallback', { id: member.userId })} (${member.email})` : (member.username || t('platform.statistics.filters.memberFallback', { id: member.userId }))
  }))
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
    errorMessage.value = getApiErrorMessage(error, t('platform.statistics.errors.fetchFailed'))
  } finally {
    isLoading.value = false
  }
}

const formatCurrency = (value) => currencyFormatter.value.format(Number(value) || 0)
const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`

const formatDelta = (value) => {
  if (value === null || typeof value === 'undefined') {
    return t('platform.statistics.messages.noBaseline')
  }

  const numeric = Number(value) || 0
  const prefix = numeric > 0 ? '+' : ''
  return t('platform.statistics.messages.vsPrevious', { value: `${prefix}${numeric.toFixed(2)}` })
}

const bucketIncomeWidth = (bucket) => Math.min(100, Math.max(0, (bucket.totalIncome / maxBucketAmount.value) * 100))
const bucketExpenseWidth = (bucket) => Math.min(100, Math.max(0, (bucket.totalExpense / maxBucketAmount.value) * 100))
const categoryWidth = (percentage) => Math.min(100, Math.max(0, Number(percentage) || 0))

watch(
  () => currentLedgerId.value,
  async (ledgerId) => {
    if (!ledgerId) {
      memberOptions.value = []
      return
    }

    await Promise.all([loadMembers(), loadStatistics()])
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
</style>
