<template>
  <PlatformPageShell
    :eyebrow="t('platform.categories.eyebrow')"
    :title="t('platform.categories.title')"
    :description="t('platform.categories.description')"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.categories.summary.expenseLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ expenseCategories.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.categories.summary.expenseHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.categories.summary.incomeLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ incomeCategories.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.categories.summary.incomeHint') }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <section class="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">{{ currentLedgerTitle }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ t('platform.categories.workspaceDescription') }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <el-button
            class="!rounded-full !px-4"
            :disabled="!hasLedgerContext || !canManageCategories"
            @click="showAddCategoryDialog('expense')"
          >
            {{ t('platform.categories.actions.addExpense') }}
          </el-button>
          <el-button
            class="!rounded-full !px-4"
            :disabled="!hasLedgerContext || !canManageCategories"
            @click="showAddCategoryDialog('income')"
          >
            {{ t('platform.categories.actions.addIncome') }}
          </el-button>
          <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" @click="fetchCategories">
            {{ t('common.refresh') }}
          </el-button>
        </div>
      </section>

      <PlatformStateCard
        v-if="!hasLedgerContext"
        variant="warning"
        compact
        :centered="false"
        :title="t('platform.categories.states.ledgerRequiredTitle')"
        :description="t('platform.categories.states.ledgerRequiredDescription')"
      >
        <template #actions>
          <router-link
            to="/ledgers"
            class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            {{ t('platform.categories.states.ledgerRequiredAction') }}
          </router-link>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-else-if="!canManageCategories"
        variant="info"
        compact
        :centered="false"
        :title="t('platform.categories.states.readOnlyTitle')"
        :description="t('platform.categories.states.readOnlyDescription')"
      />

      <section class="grid gap-6 xl:grid-cols-2">
        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">{{ t('platform.categories.expense.title') }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ t('platform.categories.expense.description') }}</p>
            </div>
            <span class="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
              {{ t('platform.categories.countBadge', { count: expenseCategories.length }) }}
            </span>
          </div>

          <div v-if="expenseCategories.length" class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="item in expenseCategories"
              :key="item.id"
              type="button"
              :disabled="!canManageCategories"
              class="group rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:bg-slate-50"
              @click="handleDeleteCategory({ category: item, type: 'expense' })"
            >
              <div class="flex items-start justify-between gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl"
                  :style="{ backgroundColor: item.bgColor || '#f8fafc' }"
                >
                  <el-icon :size="20" :class="resolveCategoryIconClass(item.icon)"><component :is="resolveCategoryIcon(item.icon)" /></el-icon>
                </div>
                <span class="text-xs text-slate-400 opacity-0 transition group-hover:opacity-100">
                  {{ t('common.delete') }}
                </span>
              </div>
              <div class="mt-4 text-sm font-semibold text-slate-900">{{ item.name }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ item.icon }}</div>
            </button>
          </div>

          <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <p class="text-sm font-medium text-slate-900">{{ t('platform.categories.expense.emptyTitle') }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ t('platform.categories.expense.emptyDescription') }}</p>
          </div>
        </article>

        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">{{ t('platform.categories.income.title') }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ t('platform.categories.income.description') }}</p>
            </div>
            <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {{ t('platform.categories.countBadge', { count: incomeCategories.length }) }}
            </span>
          </div>

          <div v-if="incomeCategories.length" class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="item in incomeCategories"
              :key="item.id"
              type="button"
              :disabled="!canManageCategories"
              class="group rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:bg-slate-50"
              @click="handleDeleteCategory({ category: item, type: 'income' })"
            >
              <div class="flex items-start justify-between gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl"
                  :style="{ backgroundColor: item.bgColor || '#f8fafc' }"
                >
                  <el-icon :size="20" :class="resolveCategoryIconClass(item.icon)"><component :is="resolveCategoryIcon(item.icon)" /></el-icon>
                </div>
                <span class="text-xs text-slate-400 opacity-0 transition group-hover:opacity-100">
                  {{ t('common.delete') }}
                </span>
              </div>
              <div class="mt-4 text-sm font-semibold text-slate-900">{{ item.name }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ item.icon }}</div>
            </button>
          </div>

          <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <p class="text-sm font-medium text-slate-900">{{ t('platform.categories.income.emptyTitle') }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ t('platform.categories.income.emptyDescription') }}</p>
          </div>
        </article>
      </section>
    </div>

    <AddCategoryDialog
      v-model="dialogVisible"
      :category-type="categoryType"
      :available-icons="availableIcons"
      @add="addCategory"
    />
  </PlatformPageShell>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AddCategoryDialog from '@/components/AddCategoryDialog.vue'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import { resolveCategoryIcon, resolveCategoryIconClass } from '@/constants/categoryIcons'
import { useCategory } from '@/composables/useCategory'
import { useLedgerStore } from '@/stores/ledger'

const { t } = useI18n()
const ledgerStore = useLedgerStore()
const { currentLedger, currentLedgerId } = storeToRefs(ledgerStore)

const {
  expenseCategories,
  incomeCategories,
  dialogVisible,
  categoryType,
  availableIcons,
  fetchCategories,
  showAddCategoryDialog,
  deleteCategory: handleDeleteCategory,
  addCategory
} = useCategory()

const hasLedgerContext = computed(() => Boolean(currentLedgerId.value))
const canManageCategories = computed(() => ['owner', 'admin'].includes(currentLedger.value?.memberRole || ''))
const currentLedgerTitle = computed(() => currentLedger.value?.name || t('platform.categories.states.ledgerFallback'))

watch(
  () => currentLedgerId.value,
  async (ledgerId) => {
    if (ledgerId) {
      await fetchCategories()
    }
  }
)

onMounted(async () => {
  if (currentLedgerId.value) {
    await fetchCategories()
  }
})
</script>
