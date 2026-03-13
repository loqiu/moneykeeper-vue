<template>
  <PlatformPageShell
    eyebrow="Record Search"
    title="记录搜索"
    description="搜索页开始承接 ledger 维度的全文检索和高级筛选。后端索引有轻微异步延迟时，这里会明确提示，而不是假设新记录必定立刻可搜到。"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Results</p>
          <p class="mt-2 text-3xl font-semibold">{{ results.length }}</p>
          <p class="mt-2 text-xs text-slate-300">当前命中的记录数</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Top Score</p>
          <p class="mt-2 text-3xl font-semibold">{{ topScore }}</p>
          <p class="mt-2 text-xs text-slate-300">当前结果里的最高相关度</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Window</p>
          <p class="mt-2 text-lg font-semibold">{{ currentLedgerName }}</p>
          <p class="mt-2 text-xs text-slate-300">当前搜索作用的 ledger 上下文</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">搜索条件</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            可以只用全文关键字，也可以直接按成员、分类、日期和类型筛。没有关键字时仍会按筛选条件返回结果。
          </p>
        </div>

        <el-form class="mt-5 space-y-4" label-position="top" @submit.prevent>
          <el-form-item label="全文关键字">
            <el-input
              v-model="filters.query"
              maxlength="100"
              clearable
              placeholder="例如：lunch、coffee、salary"
            />
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item label="类型">
              <el-select v-model="filters.type" clearable class="w-full" placeholder="全部类型">
                <el-option v-for="option in typeOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="成员 ID">
              <el-input-number
                v-model="filters.userId"
                :min="1"
                controls-position="right"
                class="!w-full"
                placeholder="可选"
              />
            </el-form-item>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item label="分类">
              <el-select v-model="filters.categoryId" clearable class="w-full" placeholder="全部分类">
                <el-option
                  v-for="category in categoryList"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="分类名称">
              <el-input v-model="filters.categoryName" clearable maxlength="50" placeholder="可直接输入分类名" />
            </el-form-item>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="filters.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="!w-full"
                placeholder="可留空"
              />
            </el-form-item>

            <el-form-item label="结束日期">
              <el-date-picker
                v-model="filters.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="!w-full"
                placeholder="可留空"
              />
            </el-form-item>
          </div>

          <el-form-item label="返回条数">
            <el-select v-model="filters.limit" class="w-full">
              <el-option v-for="option in limitOptions" :key="option" :label="`${option} 条`" :value="option" />
            </el-select>
          </el-form-item>

        <div class="flex gap-3">
            <el-button
              type="primary"
              class="!flex-1 !rounded-full !border-0 !bg-slate-900 !py-6 hover:!bg-slate-800 disabled:!bg-slate-300"
              :disabled="!hasLedgerContext"
              :loading="isLoading"
              @click="loadSearchResults"
            >
              开始搜索
            </el-button>
            <el-button class="!rounded-full !px-5" @click="resetFilters">重置并刷新</el-button>
          </div>
        </el-form>
      </article>
    </template>

    <div class="space-y-6">
      <section class="rounded-[28px] border border-amber-200 bg-amber-50/80 p-5 text-sm leading-6 text-amber-900">
        索引说明：新创建、更新、删除的记录会自动同步到搜索索引，但如果后端启用了 Kafka 事件链，搜索结果可能有轻微异步延迟。不要把“刚保存却暂时搜不到”误判为数据丢失。
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ currentLedgerName }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              搜索结果基于当前账本过滤，支持 query、categoryId、categoryName、type、日期区间和成员维度。
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadSearchResults">刷新结果</el-button>
          </div>
        </div>
      </section>

      <section v-if="errorMessage" class="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {{ errorMessage }}
      </section>

      <section v-if="!hasLedgerContext" class="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p class="text-base font-medium text-slate-900">请先选择账本</p>
        <p class="mt-2 text-sm text-slate-500">搜索页是账本维度功能，先到“账本中心”切到目标账本再继续。</p>
      </section>

      <section v-else-if="isLoading" class="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
        正在查询搜索结果...
      </section>

      <section v-else-if="!results.length" class="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p class="text-base font-medium text-slate-900">{{ emptyStateTitle }}</p>
        <p class="mt-2 text-sm text-slate-500">{{ emptyStateDescription }}</p>
      </section>

      <section v-else class="space-y-4">
        <article
          v-for="item in results"
          :key="item.id"
          class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full px-3 py-1 text-xs font-medium"
                  :class="item.type === 'expense' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'"
                >
                  {{ item.type === 'expense' ? '支出' : '收入' }}
                </span>
                <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                  {{ item.categoryName || '未分类' }}
                </span>
                <span class="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                  score {{ formatScore(item.score) }}
                </span>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span>记录 ID：{{ item.id }}</span>
                <span>成员：{{ item.userId }}</span>
                <span>日期：{{ item.transactionDate || '-' }}</span>
                <span>更新：{{ formatDateTime(item.updatedAt) }}</span>
              </div>

              <p v-if="item.notes" class="mt-4 text-sm leading-7 text-slate-600">{{ item.notes }}</p>
              <p v-else class="mt-4 text-sm text-slate-400">这条记录没有备注。</p>
            </div>

            <div class="shrink-0 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-right">
              <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Amount</div>
              <div class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(item.amount) }}</div>
            </div>
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
import { fetchLedgerCategories } from '@/api/modules/categories'
import { searchLedgerRecords } from '@/api/modules/search'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2
})

const ledgerStore = useLedgerStore()
const { currentLedgerId, currentLedger } = storeToRefs(ledgerStore)

const isLoading = ref(false)
const hasLoadedResults = ref(false)
const errorMessage = ref('')
const results = ref([])
const categoryList = ref([])

const defaultFilters = () => ({
  query: '',
  userId: null,
  type: '',
  categoryId: '',
  categoryName: '',
  startDate: '',
  endDate: '',
  limit: 20
})

const filters = reactive(defaultFilters())

const limitOptions = [20, 50, 100]
const typeOptions = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' }
]

const hasLedgerContext = computed(() => Boolean(currentLedgerId.value))
const currentLedgerName = computed(() => currentLedger.value?.name || '请先选择账本')
const hasActiveFilters = computed(() => {
  return Boolean(
    filters.query.trim() ||
      filters.userId ||
      filters.type ||
      filters.categoryId ||
      filters.categoryName.trim() ||
      filters.startDate ||
      filters.endDate
  )
})
const topScore = computed(() => {
  return results.value.length ? formatScore(results.value[0].score) : '0.00'
})
const emptyStateTitle = computed(() => {
  if (!hasLoadedResults.value) {
    return '输入条件后开始搜索'
  }

  if (hasActiveFilters.value) {
    return '当前没有匹配结果'
  }

  return '当前账本还没有可展示的搜索结果'
})
const emptyStateDescription = computed(() => {
  if (!hasLoadedResults.value) {
    return '可以输入关键字，也可以直接按成员、分类、日期和类型组合筛选。'
  }

  if (hasActiveFilters.value) {
    return '可以尝试放宽日期范围、清空分类限制，或者稍后再试一次。'
  }

  return '可以先新增记录，或者输入关键字缩小范围后再试。'
})

const buildQuery = () => {
  const query = {
    limit: filters.limit
  }

  if (filters.query.trim()) {
    query.query = filters.query.trim()
  }

  if (filters.userId) {
    query.userId = Number(filters.userId)
  }

  if (filters.type) {
    query.type = filters.type
  }

  if (filters.categoryId) {
    query.categoryId = Number(filters.categoryId)
  }

  if (filters.categoryName.trim()) {
    query.categoryName = filters.categoryName.trim()
  }

  if (filters.startDate) {
    query.startDate = filters.startDate
  }

  if (filters.endDate) {
    query.endDate = filters.endDate
  }

  return query
}

const loadCategories = async () => {
  if (!currentLedgerId.value) {
    categoryList.value = []
    return
  }

  categoryList.value = await fetchLedgerCategories(currentLedgerId.value)
}

const loadSearchResults = async () => {
  if (!currentLedgerId.value) {
    return
  }

  if (filters.startDate && filters.endDate && filters.endDate < filters.startDate) {
    errorMessage.value = '结束日期不能早于开始日期'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const records = await searchLedgerRecords(currentLedgerId.value, buildQuery())
    results.value = [...records].sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime()
    })
    hasLoadedResults.value = true
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, '搜索记录失败')
  } finally {
    isLoading.value = false
  }
}

const resetFilters = async () => {
  Object.assign(filters, defaultFilters())
  await loadSearchResults()
}

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0)

const formatScore = (value) => (Number(value) || 0).toFixed(2)

const formatDateTime = (value) => {
  if (!value) {
    return '未记录'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

watch(
  () => currentLedgerId.value,
  async (ledgerId) => {
    if (!ledgerId) {
      categoryList.value = []
      results.value = []
      hasLoadedResults.value = false
      return
    }

    await loadCategories()
    await loadSearchResults()
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

:deep(.el-input__wrapper) {
  border-radius: 18px;
}
</style>
