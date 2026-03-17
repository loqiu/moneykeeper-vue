<template>
  <PlatformPageShell
    :eyebrow="t('platform.search.eyebrow')"
    :title="t('platform.search.title')"
    :description="t('platform.search.description')"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.search.summary.matchesLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ results.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.search.summary.matchesHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.search.summary.bestMatchLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ topScore }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.search.summary.bestMatchHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.search.summary.scopeLabel') }}</p>
          <p class="mt-2 text-lg font-semibold">{{ currentLedgerName }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.search.summary.scopeHint') }}</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.search.filters.title') }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ t('platform.search.filters.description') }}
          </p>
        </div>

        <el-form class="mt-5 space-y-4" label-position="top" @submit.prevent>
          <el-form-item :label="t('platform.search.filters.queryLabel')">
            <el-input
              v-model="filters.query"
              maxlength="100"
              clearable
              :placeholder="t('platform.search.filters.queryPlaceholder')"
            />
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item :label="t('common.type')">
              <el-select
                v-model="filters.type"
                clearable
                class="w-full"
                :placeholder="t('platform.search.filters.allTypes')"
              >
                <el-option
                  v-for="option in typeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('platform.search.filters.memberLabel')">
              <el-select
                v-model="filters.userId"
                clearable
                class="w-full"
                :placeholder="t('platform.search.filters.allMembers')"
              >
                <el-option
                  v-for="member in memberOptions"
                  :key="member.userId"
                  :label="memberLabel(member)"
                  :value="member.userId"
                />
              </el-select>
            </el-form-item>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item :label="t('common.category')">
              <el-select
                v-model="filters.categoryId"
                clearable
                class="w-full"
                :placeholder="t('platform.search.filters.allCategories')"
              >
                <el-option
                  v-for="category in categoryList"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('platform.search.filters.categoryNameLabel')">
              <el-input
                v-model="filters.categoryName"
                clearable
                maxlength="50"
                :placeholder="t('platform.search.filters.categoryNamePlaceholder')"
              />
            </el-form-item>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item :label="t('platform.search.filters.startDateLabel')">
              <el-date-picker
                v-model="filters.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="!w-full"
                :placeholder="t('platform.search.filters.dateOptional')"
              />
            </el-form-item>

            <el-form-item :label="t('platform.search.filters.endDateLabel')">
              <el-date-picker
                v-model="filters.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="!w-full"
                :placeholder="t('platform.search.filters.dateOptional')"
              />
            </el-form-item>
          </div>

          <el-form-item :label="t('platform.search.filters.limitLabel')">
            <el-select v-model="filters.limit" class="w-full">
              <el-option
                v-for="option in limitOptions"
                :key="option"
                :label="t('platform.search.filters.limitOption', { count: option })"
                :value="option"
              />
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
              {{ t('platform.search.filters.searchAction') }}
            </el-button>
            <el-button class="!rounded-full !px-5" @click="resetFilters">
              {{ t('platform.search.filters.resetAction') }}
            </el-button>
          </div>
        </el-form>
      </article>
    </template>

    <div class="space-y-6">
      <section class="rounded-[28px] border border-amber-200 bg-amber-50/80 p-5 text-sm leading-6 text-amber-900">
        {{ t('platform.search.notice') }}
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ currentLedgerName }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ t('platform.search.resultDescription') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadSearchResults">
              {{ t('platform.search.refreshAction') }}
            </el-button>
          </div>
        </div>
      </section>

      <PlatformStateCard
        v-if="errorMessage"
        variant="error"
        compact
        :centered="false"
        :title="t('platform.search.states.errorTitle')"
        :description="errorMessage"
        :action-label="t('common.refresh')"
        @action="loadSearchResults"
      />

      <PlatformStateCard
        v-if="!hasLedgerContext"
        variant="warning"
        :title="t('platform.search.states.ledgerRequiredTitle')"
        :description="t('platform.search.states.ledgerRequiredDescription')"
      >
        <template #actions>
          <router-link
            to="/ledgers"
            class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-slate-400 hover:bg-slate-50"
          >
            {{ t('platform.search.states.ledgerRequiredAction') }}
          </router-link>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-else-if="isLoading"
        variant="loading"
        :title="t('platform.search.states.loadingTitle')"
        :description="t('platform.search.states.loadingDescription')"
      />

      <PlatformStateCard
        v-else-if="!results.length"
        variant="empty"
        :title="emptyStateTitle"
        :description="emptyStateDescription"
      />

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
                  {{ item.type === 'expense' ? t('common.expense') : t('common.income') }}
                </span>
                <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                  {{ item.categoryName || t('common.unclassified') }}
                </span>
                <span class="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                  {{ t('platform.search.results.scoreLabel', { score: formatScore(item.score) }) }}
                </span>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span>{{ t('platform.search.results.recordId', { id: item.id }) }}</span>
                <span>{{ t('platform.search.results.member', { name: memberName(item.userId) }) }}</span>
                <span>{{ t('platform.search.results.date', { value: item.transactionDate || '-' }) }}</span>
                <span>{{ t('platform.search.results.updated', { value: formatDateTime(item.updatedAt) }) }}</span>
              </div>

              <p v-if="item.notes" class="mt-4 text-sm leading-7 text-slate-600">{{ item.notes }}</p>
              <p v-else class="mt-4 text-sm text-slate-400">{{ t('platform.search.results.noNote') }}</p>
            </div>

            <div class="shrink-0 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-right">
              <div class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ t('platform.search.results.amountLabel') }}</div>
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
import { useI18n } from 'vue-i18n'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import { fetchLedgerCategories } from '@/api/modules/categories'
import { fetchLedgerMembers } from '@/api/modules/ledgers'
import { searchLedgerRecords } from '@/api/modules/search'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'

const { t, locale } = useI18n()
const ledgerStore = useLedgerStore()
const { currentLedgerId, currentLedger } = storeToRefs(ledgerStore)

const isLoading = ref(false)
const hasLoadedResults = ref(false)
const errorMessage = ref('')
const results = ref([])
const categoryList = ref([])
const memberOptions = ref([])

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
const typeOptions = computed(() => ([
  { label: t('common.expense'), value: 'expense' },
  { label: t('common.income'), value: 'income' }
]))

const hasLedgerContext = computed(() => Boolean(currentLedgerId.value))
const currentLedgerName = computed(() => currentLedger.value?.name || t('platform.search.states.ledgerFallback'))
const hasActiveFilters = computed(() => {
  return Boolean(
    filters.query.trim()
      || filters.userId
      || filters.type
      || filters.categoryId
      || filters.categoryName.trim()
      || filters.startDate
      || filters.endDate
  )
})
const topScore = computed(() => {
  return results.value.length ? formatScore(results.value[0].score) : '0.00'
})
const emptyStateTitle = computed(() => {
  if (!hasLoadedResults.value) {
    return t('platform.search.empty.idleTitle')
  }

  if (hasActiveFilters.value) {
    return t('platform.search.empty.filteredTitle')
  }

  return t('platform.search.empty.ledgerTitle')
})
const emptyStateDescription = computed(() => {
  if (!hasLoadedResults.value) {
    return t('platform.search.empty.idleDescription')
  }

  if (hasActiveFilters.value) {
    return t('platform.search.empty.filteredDescription')
  }

  return t('platform.search.empty.ledgerDescription')
})

const memberLabel = (member) => {
  if (!member) {
    return ''
  }

  if (member.email) {
    return `${member.username} (${member.email})`
  }

  return member.username || t('platform.search.filters.memberFallback', { id: member.userId })
}

const memberName = (userId) => {
  const matchedMember = memberOptions.value.find((member) => Number(member.userId) === Number(userId))
  return matchedMember ? memberLabel(matchedMember) : t('platform.search.results.memberFallback', { id: userId })
}

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

const loadMembers = async () => {
  if (!currentLedgerId.value) {
    memberOptions.value = []
    return
  }

  memberOptions.value = await fetchLedgerMembers(currentLedgerId.value)
}

const loadSearchResults = async () => {
  if (!currentLedgerId.value) {
    return
  }

  if (filters.startDate && filters.endDate && filters.endDate < filters.startDate) {
    errorMessage.value = t('platform.search.errors.invalidDateRange')
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
    errorMessage.value = getApiErrorMessage(error, t('platform.search.errors.fetchFailed'))
  } finally {
    isLoading.value = false
  }
}

const resetFilters = async () => {
  Object.assign(filters, defaultFilters())
  await loadSearchResults()
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
  }).format(Number(value) || 0)
}

const formatScore = (value) => (Number(value) || 0).toFixed(2)

const formatDateTime = (value) => {
  if (!value) {
    return t('platform.search.results.noTimestamp')
  }

  return new Intl.DateTimeFormat(locale.value, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(value))
}

watch(
  () => currentLedgerId.value,
  async (ledgerId) => {
    if (!ledgerId) {
      categoryList.value = []
      memberOptions.value = []
      results.value = []
      hasLoadedResults.value = false
      return
    }

    await Promise.all([loadCategories(), loadMembers()])
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
