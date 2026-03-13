<template>
  <PlatformPageShell
    eyebrow="Ledger Categories"
    title="分类管理"
    description="这里集中管理当前账本下的收入和支出分类。现有新增分类弹窗已经迁到独立页面里，后续会继续补编辑能力和权限态。"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Expense</p>
          <p class="mt-2 text-3xl font-semibold">{{ expenseCategories.length }}</p>
          <p class="mt-2 text-xs text-slate-300">当前支出分类数量</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Income</p>
          <p class="mt-2 text-3xl font-semibold">{{ incomeCategories.length }}</p>
          <p class="mt-2 text-xs text-slate-300">当前收入分类数量</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <section class="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">{{ currentLedgerTitle }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            分类现在已经切到当前账本维度。后续 owner/admin 和 member 的差异化权限会继续补齐。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" @click="showAddCategoryDialog('expense')">
            新增支出分类
          </el-button>
          <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" @click="showAddCategoryDialog('income')">
            新增收入分类
          </el-button>
          <el-button class="!rounded-full !px-4" :disabled="!hasLedgerContext" @click="fetchCategories">
            刷新列表
          </el-button>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-2">
        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">支出分类</h3>
              <p class="mt-1 text-sm text-slate-500">用于账本记录、筛选和图表归类。</p>
            </div>
            <span class="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
              {{ expenseCategories.length }} 项
            </span>
          </div>

          <div v-if="expenseCategories.length" class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="item in expenseCategories"
              :key="item.id"
              type="button"
              class="group rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              @click="handleDeleteCategory({ category: item, type: 'expense' })"
            >
              <div class="flex items-start justify-between gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl"
                  :style="{ backgroundColor: item.bgColor || '#f8fafc' }"
                >
                  <el-icon :size="20" :class="resolveCategoryIconClass(item.icon)"><component :is="resolveCategoryIcon(item.icon)" /></el-icon>
                </div>
                <span class="text-xs text-slate-400 opacity-0 transition group-hover:opacity-100">删除</span>
              </div>
              <div class="mt-4 text-sm font-semibold text-slate-900">{{ item.name }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ item.icon }}</div>
            </button>
          </div>

          <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <p class="text-sm font-medium text-slate-900">还没有支出分类</p>
            <p class="mt-2 text-sm text-slate-500">先创建几个高频分类，首页录入会更顺手。</p>
          </div>
        </article>

        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">收入分类</h3>
              <p class="mt-1 text-sm text-slate-500">统一管理工资、奖金、报销等收入来源。</p>
            </div>
            <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {{ incomeCategories.length }} 项
            </span>
          </div>

          <div v-if="incomeCategories.length" class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="item in incomeCategories"
              :key="item.id"
              type="button"
              class="group rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              @click="handleDeleteCategory({ category: item, type: 'income' })"
            >
              <div class="flex items-start justify-between gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl"
                  :style="{ backgroundColor: item.bgColor || '#f8fafc' }"
                >
                  <el-icon :size="20" :class="resolveCategoryIconClass(item.icon)"><component :is="resolveCategoryIcon(item.icon)" /></el-icon>
                </div>
                <span class="text-xs text-slate-400 opacity-0 transition group-hover:opacity-100">删除</span>
              </div>
              <div class="mt-4 text-sm font-semibold text-slate-900">{{ item.name }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ item.icon }}</div>
            </button>
          </div>

          <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <p class="text-sm font-medium text-slate-900">还没有收入分类</p>
            <p class="mt-2 text-sm text-slate-500">补几个收入类型后，统计页的收入结构会更清晰。</p>
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
import AddCategoryDialog from '@/components/AddCategoryDialog.vue'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import { resolveCategoryIcon, resolveCategoryIconClass } from '@/constants/categoryIcons'
import { useCategory } from '@/composables/useCategory'
import { useLedgerStore } from '@/stores/ledger'

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
const currentLedgerTitle = computed(() => currentLedger.value?.name || '请先选择账本')

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
