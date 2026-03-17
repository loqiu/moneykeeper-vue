<template>
  <PlatformPageShell
    :eyebrow="t('platform.budgets.eyebrow')"
    :title="t('platform.budgets.title')"
    :description="t('platform.budgets.description')"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.budgets.summary.budgetsLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ budgetList.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.budgets.summary.budgetsHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.budgets.summary.plannedLabel') }}</p>
          <p class="mt-2 text-2xl font-semibold">{{ formatCurrency(summary.totalBudgetAmount) }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.budgets.summary.plannedHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.budgets.summary.alertsLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ summary.alertCount }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.budgets.summary.alertsHint') }}</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.budgets.form.title') }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ t('platform.budgets.form.description') }}
          </p>
        </div>

        <div
          v-if="hasLedgerContext && !canManageBudgets"
          class="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600"
        >
          {{ t('platform.budgets.form.readOnlyHint') }}
        </div>

        <el-form class="mt-5 space-y-4" label-position="top" @submit.prevent>
          <el-form-item :label="t('platform.budgets.form.nameLabel')">
            <el-input
              v-model="form.name"
              maxlength="50"
              :placeholder="t('platform.budgets.form.namePlaceholder')"
            />
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item :label="t('common.type')">
              <el-select v-model="form.type" class="w-full">
                <el-option
                  v-for="option in typeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('common.category')">
              <el-select
                v-model="form.categoryId"
                clearable
                class="w-full"
                :placeholder="t('platform.budgets.form.categoryPlaceholder')"
              >
                <el-option
                  v-for="category in createCategoryOptions"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <el-form-item :label="t('platform.budgets.filters.yearLabel')">
              <el-input-number v-model="form.budgetYear" :min="2024" :max="2100" controls-position="right" class="!w-full" />
            </el-form-item>

            <el-form-item :label="t('platform.budgets.filters.monthLabel')">
              <el-select v-model="form.budgetMonth" class="w-full">
                <el-option
                  v-for="month in monthOptions"
                  :key="month.value"
                  :label="month.label"
                  :value="month.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('platform.budgets.form.amountLabel')">
              <el-input-number
                v-model="form.amount"
                :min="0"
                :step="50"
                :precision="2"
                controls-position="right"
                class="!w-full"
              />
            </el-form-item>
          </div>

          <el-form-item :label="t('common.note')">
            <el-input
              v-model="form.notes"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
              :placeholder="t('platform.budgets.form.notesPlaceholder')"
            />
          </el-form-item>

          <el-button
            type="primary"
            class="!mt-2 !w-full !rounded-full !border-0 !bg-slate-900 !py-6 hover:!bg-slate-800 disabled:!bg-slate-300"
            :disabled="!hasLedgerContext || !canManageBudgets"
            :loading="isSubmitting"
            @click="handleCreateBudget"
          >
            {{ t('platform.budgets.form.submitAction') }}
          </el-button>
        </el-form>
      </article>
    </template>

    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ currentLedgerName }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ t('platform.budgets.workspaceDescription') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" :loading="isLoading" @click="loadBudgetWorkspace">
              {{ t('platform.budgets.actions.refresh') }}
            </el-button>
            <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" @click="resetFilters">
              {{ t('common.reset') }}
            </el-button>
          </div>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
          <el-select v-model="filters.year" class="w-full">
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="t('platform.budgets.filters.yearOption', { year })"
              :value="year"
            />
          </el-select>

          <el-select v-model="filters.month" class="w-full">
            <el-option v-for="month in monthOptions" :key="month.value" :label="month.label" :value="month.value" />
          </el-select>

          <el-select
            v-model="filters.type"
            clearable
            class="w-full"
            :placeholder="t('platform.budgets.filters.allTypes')"
          >
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-select
            v-model="filters.categoryId"
            clearable
            class="w-full"
            :placeholder="t('platform.budgets.filters.allCategories')"
          >
            <el-option
              v-for="category in filterCategoryOptions"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>

          <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" @click="loadBudgets">
            {{ t('platform.budgets.actions.applyFilters') }}
          </el-button>
        </div>
      </section>

      <PlatformStateCard
        v-if="errorMessage"
        variant="error"
        compact
        :centered="false"
        :title="t('platform.budgets.states.errorTitle')"
        :description="errorMessage"
        :action-label="t('common.refresh')"
        @action="loadBudgetWorkspace"
      />

      <PlatformStateCard
        v-if="!hasLedgerContext"
        variant="warning"
        :title="t('platform.budgets.states.ledgerRequiredTitle')"
        :description="t('platform.budgets.states.ledgerRequiredDescription')"
      >
        <template #actions>
          <router-link
            to="/ledgers"
            class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-slate-400 hover:bg-slate-50"
          >
            {{ t('platform.budgets.states.ledgerRequiredAction') }}
          </router-link>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-else-if="isLoading"
        variant="loading"
        :title="t('platform.budgets.states.loadingTitle')"
        :description="t('platform.budgets.states.loadingDescription')"
      />

      <PlatformStateCard
        v-else-if="!budgetList.length"
        variant="empty"
        :title="t('platform.budgets.states.emptyTitle')"
        :description="t('platform.budgets.states.emptyDescription')"
      />

      <section v-else class="grid gap-5 xl:grid-cols-2">
        <article
          v-for="budget in budgetList"
          :key="budget.id"
          class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-xl font-semibold text-slate-900">{{ budget.name }}</h3>
                <span
                  class="rounded-full px-3 py-1 text-xs font-medium"
                  :class="budget.type === 'expense' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'"
                >
                  {{ budget.type === 'expense' ? t('platform.budgets.cards.expenseBudget') : t('platform.budgets.cards.incomeBudget') }}
                </span>
                <span v-if="budget.progress.exceeded" class="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  {{ t('platform.budgets.cards.exceededBadge') }}
                </span>
              </div>

              <p class="mt-2 text-sm text-slate-500">
                {{
                  t('platform.budgets.cards.meta', {
                    category: budget.categoryName || t('platform.budgets.cards.ledgerTotal'),
                    year: budget.budgetYear,
                    month: budget.budgetMonth
                  })
                }}
              </p>
            </div>

            <el-button class="!rounded-full !px-4" :disabled="!canManageBudgets" @click="handleDeleteBudget(budget)">
              {{ t('common.delete') }}
            </el-button>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-3">
            <div class="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ t('platform.budgets.cards.budgetLabel') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(budget.amount) }}</p>
            </div>
            <div class="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ t('platform.budgets.cards.spentLabel') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(budget.progress.spentAmount) }}</p>
            </div>
            <div class="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ t('platform.budgets.cards.remainingLabel') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(budget.progress.remainingAmount) }}</p>
            </div>
          </div>

          <div class="mt-5">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="font-medium text-slate-700">{{ t('platform.budgets.cards.usageLabel') }}</span>
              <span :class="usageTextClass(budget.progress.usagePercentage, budget.progress.exceeded)">
                {{ formatPercentage(budget.progress.usagePercentage) }}
              </span>
            </div>
            <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full transition-all"
                :class="usageBarClass(budget.progress.usagePercentage, budget.progress.exceeded)"
                :style="{ width: `${usageWidth(budget.progress.usagePercentage)}%` }"
              ></div>
            </div>

            <div v-if="budget.progress.triggeredThresholdPercentages.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="threshold in budget.progress.triggeredThresholdPercentages"
                :key="threshold"
                class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
              >
                {{ t('platform.budgets.cards.thresholdHit', { threshold }) }}
              </span>
            </div>
          </div>

          <div v-if="budget.notes" class="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            {{ budget.notes }}
          </div>

          <div class="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h4 class="text-sm font-semibold text-slate-900">{{ t('platform.budgets.rules.title') }}</h4>
                <p class="mt-1 text-sm text-slate-500">{{ t('platform.budgets.rules.description') }}</p>
              </div>
              <el-button class="!rounded-full !px-4" :disabled="!canManageBudgets" @click="openRuleDialog(budget)">
                {{ t('platform.budgets.rules.addAction') }}
              </el-button>
            </div>

            <div v-if="budget.rules.length" class="mt-4 space-y-3">
              <div
                v-for="rule in budget.rules"
                :key="rule.id"
                class="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-sm font-semibold text-slate-900">{{ rule.thresholdPercentage }}%</span>
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-medium"
                      :class="rule.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                    >
                      {{ rule.enabled ? t('platform.budgets.rules.enabled') : t('platform.budgets.rules.disabled') }}
                    </span>
                  </div>
                  <p class="mt-2 text-sm text-slate-700">{{ rule.notificationTitle }}</p>
                  <p class="mt-1 text-sm text-slate-500">{{ rule.notificationMessage }}</p>
                </div>

                <el-button class="!rounded-full !px-4" :disabled="!canManageBudgets" @click="handleDeleteRule(budget, rule)">
                  {{ t('common.delete') }}
                </el-button>
              </div>
            </div>

            <div v-else class="mt-4 rounded-[20px] border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
              {{ t('platform.budgets.rules.empty') }}
            </div>
          </div>
        </article>
      </section>
    </div>

    <BudgetRuleDialog
      v-model="ruleDialogVisible"
      :budget-name="activeBudgetForRule?.name || ''"
      :budget-subtitle="activeBudgetSubtitle"
      :loading="isRuleSubmitting"
      @submit="handleCreateRule"
    />
  </PlatformPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import BudgetRuleDialog from '@/components/BudgetRuleDialog.vue'
import { fetchLedgerCategories } from '@/api/modules/categories'
import {
  createLedgerBudget,
  createLedgerBudgetRule,
  deleteLedgerBudget,
  deleteLedgerBudgetRule,
  fetchLedgerBudgets
} from '@/api/modules/budgets'
import { toBackendRecordType } from '@/api/mappers/recordType'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'

const { t, locale } = useI18n()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const ledgerStore = useLedgerStore()
const { currentLedgerId, currentLedger, initialized } = storeToRefs(ledgerStore)

const isLoading = ref(false)
const isSubmitting = ref(false)
const isRuleSubmitting = ref(false)
const errorMessage = ref('')
const budgetList = ref([])
const categoryList = ref([])
const ruleDialogVisible = ref(false)
const activeBudgetForRule = ref(null)

const filters = reactive({
  year: currentYear,
  month: currentMonth,
  type: '',
  categoryId: ''
})

const form = reactive({
  name: '',
  type: 'expense',
  categoryId: '',
  amount: null,
  budgetYear: currentYear,
  budgetMonth: currentMonth,
  notes: ''
})

const monthOptions = computed(() => Array.from({ length: 12 }, (_, index) => ({
  label: t('platform.budgets.filters.monthOption', { month: index + 1 }),
  value: index + 1
})))

const yearOptions = Array.from({ length: 7 }, (_, index) => currentYear - 2 + index)

const typeOptions = computed(() => ([
  { label: t('common.expense'), value: 'expense' },
  { label: t('common.income'), value: 'income' }
]))

const hasLedgerContext = computed(() => Boolean(currentLedgerId.value))
const currentLedgerName = computed(() => currentLedger.value?.name || t('platform.budgets.states.ledgerFallback'))
const canManageBudgets = computed(() => ['owner', 'admin'].includes(currentLedger.value?.memberRole || ''))

const createCategoryOptions = computed(() => {
  return categoryList.value.filter((item) => item.type === form.type)
})

const filterCategoryOptions = computed(() => {
  if (!filters.type) {
    return categoryList.value
  }

  return categoryList.value.filter((item) => item.type === filters.type)
})

const activeBudgetSubtitle = computed(() => {
  if (!activeBudgetForRule.value) {
    return ''
  }

  return t('platform.budgets.cards.meta', {
    category: activeBudgetForRule.value.categoryName || t('platform.budgets.cards.ledgerTotal'),
    year: activeBudgetForRule.value.budgetYear,
    month: activeBudgetForRule.value.budgetMonth
  })
})

const summary = computed(() => {
  return budgetList.value.reduce(
    (accumulator, budget) => {
      accumulator.totalBudgetAmount += budget.amount
      accumulator.totalSpentAmount += budget.progress.spentAmount
      if (budget.progress.exceeded || budget.progress.triggeredThresholdPercentages.length) {
        accumulator.alertCount += 1
      }

      return accumulator
    },
    {
      totalBudgetAmount: 0,
      totalSpentAmount: 0,
      alertCount: 0
    }
  )
})

const formatCurrency = (value) => new Intl.NumberFormat(locale.value, {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2
}).format(Number(value) || 0)

const formatPercentage = (value) => `${Math.round(Number(value) || 0)}%`

const usageWidth = (value) => Math.min(Math.max(Number(value) || 0, 0), 100)

const usageBarClass = (usagePercentage, exceeded) => {
  if (exceeded || usagePercentage >= 100) {
    return 'bg-amber-500'
  }

  if (usagePercentage >= 80) {
    return 'bg-rose-500'
  }

  return 'bg-emerald-500'
}

const usageTextClass = (usagePercentage, exceeded) => {
  if (exceeded || usagePercentage >= 100) {
    return 'font-semibold text-amber-700'
  }

  if (usagePercentage >= 80) {
    return 'font-semibold text-rose-700'
  }

  return 'font-semibold text-emerald-700'
}

const resetFilters = () => {
  filters.year = currentYear
  filters.month = currentMonth
  filters.type = ''
  filters.categoryId = ''
}

const resetBudgetForm = () => {
  form.name = ''
  form.type = 'expense'
  form.categoryId = ''
  form.amount = null
  form.budgetYear = filters.year
  form.budgetMonth = filters.month
  form.notes = ''
}

const buildBudgetParams = () => {
  const params = {
    year: filters.year,
    month: filters.month
  }

  if (filters.type) {
    params.type = toBackendRecordType(filters.type)
  }

  if (filters.categoryId) {
    params.categoryId = Number(filters.categoryId)
  }

  return params
}

const loadCategories = async () => {
  if (!currentLedgerId.value) {
    categoryList.value = []
    return
  }

  categoryList.value = await fetchLedgerCategories(currentLedgerId.value)
}

const loadBudgets = async () => {
  if (!currentLedgerId.value) {
    budgetList.value = []
    return
  }

  const budgets = await fetchLedgerBudgets(currentLedgerId.value, buildBudgetParams())
  budgetList.value = budgets
}

const loadBudgetWorkspace = async () => {
  if (!currentLedgerId.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await Promise.all([loadCategories(), loadBudgets()])
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('platform.budgets.errors.workspaceFetchFailed'))
  } finally {
    isLoading.value = false
  }
}

const handleCreateBudget = async () => {
  if (!hasLedgerContext.value) {
    ElMessage.warning(t('platform.budgets.errors.ledgerRequired'))
    return
  }

  if (!form.name.trim() || !form.amount) {
    ElMessage.warning(t('platform.budgets.errors.formIncomplete'))
    return
  }

  isSubmitting.value = true

  try {
    await createLedgerBudget(currentLedgerId.value, form)
    resetBudgetForm()
    await loadBudgets()
    ElMessage.success(t('platform.budgets.messages.created'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.budgets.errors.createFailed')))
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteBudget = async (budget) => {
  if (!canManageBudgets.value) {
    ElMessage.warning(t('platform.budgets.errors.deletePermission'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('platform.budgets.dialogs.deleteBudgetDescription', { name: budget.name }),
      t('platform.budgets.dialogs.deleteBudgetTitle'),
      {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel')
      }
    )

    await deleteLedgerBudget(currentLedgerId.value, budget.id)
    await loadBudgets()
    ElMessage.success(t('platform.budgets.messages.deleted'))
  } catch (error) {
    if (error === 'cancel') {
      return
    }

    ElMessage.error(getApiErrorMessage(error, t('platform.budgets.errors.deleteFailed')))
  }
}

const openRuleDialog = (budget) => {
  if (!canManageBudgets.value) {
    ElMessage.warning(t('platform.budgets.errors.ruleCreatePermission'))
    return
  }

  activeBudgetForRule.value = budget
  ruleDialogVisible.value = true
}

const handleCreateRule = async (payload) => {
  if (!activeBudgetForRule.value) {
    return
  }

  isRuleSubmitting.value = true

  try {
    await createLedgerBudgetRule(currentLedgerId.value, activeBudgetForRule.value.id, payload)
    ruleDialogVisible.value = false
    activeBudgetForRule.value = null
    await loadBudgets()
    ElMessage.success(t('platform.budgets.messages.ruleCreated'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.budgets.errors.ruleCreateFailed')))
  } finally {
    isRuleSubmitting.value = false
  }
}

const handleDeleteRule = async (budget, rule) => {
  if (!canManageBudgets.value) {
    ElMessage.warning(t('platform.budgets.errors.ruleDeletePermission'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('platform.budgets.dialogs.deleteRuleDescription', { threshold: rule.thresholdPercentage }),
      t('platform.budgets.dialogs.deleteRuleTitle'),
      {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel')
      }
    )

    await deleteLedgerBudgetRule(currentLedgerId.value, budget.id, rule.id)
    await loadBudgets()
    ElMessage.success(t('platform.budgets.messages.ruleDeleted'))
  } catch (error) {
    if (error === 'cancel') {
      return
    }

    ElMessage.error(getApiErrorMessage(error, t('platform.budgets.errors.ruleDeleteFailed')))
  }
}

watch(
  () => form.type,
  (type) => {
    const selectedCategory = categoryList.value.find((item) => item.id === form.categoryId)
    if (selectedCategory && selectedCategory.type !== type) {
      form.categoryId = ''
    }
  }
)

watch(
  () => filters.type,
  (type) => {
    const selectedCategory = categoryList.value.find((item) => item.id === filters.categoryId)
    if (selectedCategory && type && selectedCategory.type !== type) {
      filters.categoryId = ''
    }
  }
)

watch(
  () => [filters.year, filters.month],
  ([year, month]) => {
    form.budgetYear = year
    form.budgetMonth = month
  }
)

watch(
  () => currentLedgerId.value,
  async (ledgerId) => {
    if (!ledgerId) {
      budgetList.value = []
      categoryList.value = []
      return
    }

    await loadBudgetWorkspace()
  },
  { immediate: true }
)

onMounted(async () => {
  if (!initialized.value) {
    await ledgerStore.initializeLedgers()
  }
})
</script>

<style scoped>
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 18px;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: inset 0 0 0 2px #0f172a !important;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  width: 100%;
}

:deep(.el-select__wrapper) {
  border-radius: 18px;
  min-height: 42px;
}
</style>
