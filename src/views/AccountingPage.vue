<template>
  <div class="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#fff7ed_0%,#f8fafc_42%,#ecfeff_100%)] px-4 py-6 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-16 top-16 h-56 w-56 rounded-full bg-amber-200/35 blur-3xl"></div>
      <div class="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-7xl space-y-6">
      <TopNavBar />

      <section class="overflow-hidden rounded-[32px] bg-slate-900 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div class="relative isolate px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.30),transparent_48%),radial-gradient(circle_at_bottom,rgba(45,212,191,0.26),transparent_44%)]"></div>
          <div class="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-2xl space-y-4">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur">
                <el-icon><Calendar /></el-icon>
                <span>{{ currentMonthLabel }}</span>
              </div>
              <div class="space-y-3">
                <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">我的记账台</h1>
                <p class="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  把记一笔、筛选和趋势分析放在同一屏里。顶部总览展示全量数据，筛选用于快速聚焦明细记录。
                </p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div class="text-xs uppercase tracking-[0.24em] text-slate-300">最近更新</div>
                <div class="mt-3 text-xl font-semibold">{{ latestRecordDate }}</div>
                <div class="mt-1 text-xs text-slate-300">最近一笔记录的日期</div>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div class="text-xs uppercase tracking-[0.24em] text-slate-300">筛选状态</div>
                <div class="mt-3 text-xl font-semibold">{{ hasActiveFilters ? '已启用' : '未筛选' }}</div>
                <div class="mt-1 text-xs text-slate-300">{{ hasActiveFilters ? activeFilterTags.join(' / ') : '查看全部记录' }}</div>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div class="text-xs uppercase tracking-[0.24em] text-slate-300">分类总数</div>
                <div class="mt-3 text-xl font-semibold">{{ categoryCount }}</div>
                <div class="mt-1 text-xs text-slate-300">支出和收入分类总和</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in summaryCards"
          :key="card.title"
          class="rounded-[28px] border p-5 shadow-[0_20px_50px_rgba(148,163,184,0.15)] transition-transform duration-300 hover:-translate-y-1"
          :class="card.className"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-slate-600">{{ card.title }}</p>
              <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ card.value }}</p>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl" :class="card.iconClass">
              <el-icon :size="22"><component :is="card.icon" /></el-icon>
            </div>
          </div>
          <p class="mt-4 text-sm text-slate-500">{{ card.hint }}</p>
        </article>
      </section>

      <section
        v-if="hasActiveFilters"
        class="flex flex-col gap-4 rounded-[28px] border border-amber-200 bg-amber-50/90 p-5 shadow-[0_18px_45px_rgba(251,191,36,0.15)] lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <el-icon><Filter /></el-icon>
            <span>明细列表已启用筛选</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in activeFilterTags"
              :key="tag"
              class="rounded-full border border-amber-300 bg-white px-3 py-1 text-sm text-amber-900"
            >
              {{ tag }}
            </span>
          </div>
          <p class="text-sm text-amber-800">
            当前命中 {{ filteredCount }} 条记录，收入 {{ formatCurrency(filteredIncome) }}，支出 {{ formatCurrency(filteredExpense) }}，结余 {{ formatCurrency(filteredBalance) }}。
          </p>
          <p class="text-xs text-amber-700/80">图表和顶部总览保持展示全部数据，明细区按当前筛选结果聚焦。</p>
        </div>

        <el-button
          class="!self-start !rounded-full !border-amber-300 !bg-white !px-5 !text-amber-900 hover:!bg-amber-100 lg:!self-center"
          @click="resetFilters"
        >
          <el-icon class="mr-1"><RefreshRight /></el-icon>
          清除筛选
        </el-button>
      </section>

      <div class="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside class="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section class="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(148,163,184,0.14)] backdrop-blur">
            <div class="mb-5 flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <el-icon :size="20"><Plus /></el-icon>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-slate-900">记一笔</h2>
                <p class="text-sm text-slate-500">快速录入今天的收支。</p>
              </div>
            </div>
            <AddRecordForm
              v-model:new-record="newRecord"
              :expense-categories="expenseCategories"
              :income-categories="incomeCategories"
              @add-record="addRecord"
              @delete-category="handleDeleteCategory"
              @show-add-category-dialog="showAddCategoryDialog"
            />
          </section>

          <section class="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(148,163,184,0.14)] backdrop-blur">
            <div class="mb-5 flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <el-icon :size="20"><Filter /></el-icon>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-slate-900">筛选记录</h2>
                <p class="text-sm text-slate-500">用分类和类型快速定位目标记录。</p>
              </div>
            </div>
            <CategoryFilter
              :filter-state="filterState"
              :expense-categories="expenseCategories"
              :income-categories="incomeCategories"
              @filter-change="setFilter"
            />
          </section>
        </aside>

        <div class="space-y-6">
          <section class="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
            <AccountingCharts
              :loading="loading"
              :pie-option="pieOption"
              :line-option="lineOption"
              :bar-option="barOption"
              v-model:time-unit="timeUnit"
              v-model:selected-category="selectedCategory"
            />
          </section>

          <section class="rounded-[32px] border border-white/70 bg-white/92 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
            <RecordsList
              :loading="loading"
              :records="records"
              :total-income="totalIncome"
              :total-expense="totalExpense"
              :balance="balance"
              :pagination="pagination"
              :user-id="userStore.userId"
              @edit="startEdit"
              @delete="deleteRecord"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </section>
        </div>
      </div>

      <EditRecordDialog
        v-model="showEditDialog"
        v-model:record="editingRecord"
        :expense-categories="expenseCategories"
        :income-categories="incomeCategories"
        @cancel="cancelEdit"
        @save="saveEdit"
      />

      <AddCategoryDialog
        v-model="dialogVisible"
        :category-type="categoryType"
        :available-icons="availableIcons"
        @add="addCategory"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { Calendar, DataAnalysis, Filter, Plus, RefreshRight, Wallet } from '@element-plus/icons-vue'
import AddRecordForm from '@/components/AddRecordForm.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import RecordsList from '@/components/RecordsList.vue'
import TopNavBar from '@/components/TopNavBar.vue'
import { useAccounting } from '@/composables/useAccounting'
import { useUserStore } from '@/stores/user'

const AccountingCharts = defineAsyncComponent(() => import('@/components/AccountingCharts.vue'))
const EditRecordDialog = defineAsyncComponent(() => import('@/components/EditRecordDialog.vue'))
const AddCategoryDialog = defineAsyncComponent(() => import('@/components/AddCategoryDialog.vue'))

const userStore = useUserStore()

const {
  newRecord,
  timeUnit,
  totalIncome,
  totalExpense,
  balance,
  pieOption,
  lineOption,
  barOption,
  addRecord,
  expenseCategories,
  incomeCategories,
  deleteRecord,
  editingRecord,
  showEditDialog,
  startEdit,
  cancelEdit,
  saveEdit,
  fetchRecords,
  dialogVisible,
  categoryType,
  availableIcons,
  showAddCategoryDialog,
  deleteCategory,
  addCategory,
  pagination,
  handleCurrentChange,
  handleSizeChange,
  loading,
  fetchCategories,
  records,
  allRecords,
  selectedCategory,
  filterState,
  setFilter
} = useAccounting()

const formatCurrency = (value) => {
  return `£${Number(value || 0).toFixed(2)}`
}

const currentMonthLabel = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long'
  }).format(new Date())
})

const categoryCount = computed(() => {
  return expenseCategories.value.length + incomeCategories.value.length
})

const latestRecordDate = computed(() => {
  const latest = allRecords.value
    .map((item) => item.date)
    .filter(Boolean)
    .sort()
    .slice(-1)[0]

  return latest || '暂无记录'
})

const hasActiveFilters = computed(() => {
  return Boolean(filterState.value.type || filterState.value.category)
})

const activeFilterTags = computed(() => {
  const tags = []

  if (filterState.value.type) {
    tags.push(filterState.value.type === 'expense' ? '支出' : '收入')
  }

  if (filterState.value.category) {
    tags.push(filterState.value.category)
  }

  return tags
})

const filteredRecordsPreview = computed(() => {
  return allRecords.value.filter((item) => {
    const matchType = !filterState.value.type || item.type === filterState.value.type
    const matchCategory = !filterState.value.category || item.categoryName === filterState.value.category
    return matchType && matchCategory
  })
})

const filteredCount = computed(() => filteredRecordsPreview.value.length)

const filteredIncome = computed(() => {
  return filteredRecordsPreview.value
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
})

const filteredExpense = computed(() => {
  return filteredRecordsPreview.value
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
})

const filteredBalance = computed(() => filteredIncome.value - filteredExpense.value)

const summaryCards = computed(() => ([
  {
    title: '总收入',
    value: formatCurrency(totalIncome.value),
    hint: '所有收入记录的累计金额',
    icon: Wallet,
    className: 'border-emerald-100 bg-emerald-50/80',
    iconClass: 'bg-emerald-500 text-white'
  },
  {
    title: '总支出',
    value: formatCurrency(totalExpense.value),
    hint: '所有支出记录的累计金额',
    icon: DataAnalysis,
    className: 'border-rose-100 bg-rose-50/80',
    iconClass: 'bg-rose-500 text-white'
  },
  {
    title: '当前结余',
    value: formatCurrency(balance.value),
    hint: '收入减去支出的净值',
    icon: Calendar,
    className: 'border-cyan-100 bg-cyan-50/80',
    iconClass: 'bg-cyan-500 text-white'
  },
  {
    title: '明细条数',
    value: String(pagination.value.total || 0),
    hint: hasActiveFilters.value ? '当前筛选命中的记录条数' : '当前已载入的记录条数',
    icon: Filter,
    className: 'border-amber-100 bg-amber-50/80',
    iconClass: 'bg-amber-500 text-white'
  }
]))

const resetFilters = () => {
  setFilter('', '')
}

const handleDeleteCategory = async (payload) => {
  await deleteCategory(payload)
}

onMounted(async () => {
  if (userStore.userId) {
    await Promise.all([
      fetchRecords(),
      fetchCategories()
    ])
  }
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.45);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}
</style>