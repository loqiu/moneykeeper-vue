<template>
  <PlatformPageShell
    :eyebrow="pageConfig.eyebrow"
    :title="pageConfig.title"
    :description="pageConfig.description"
  >
    <template #summary>
      <div class="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Current focus</p>
        <p class="mt-3 text-2xl font-semibold">{{ pageConfig.statusTitle }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-300">{{ pageConfig.statusText }}</p>
      </div>
    </template>

    <div class="space-y-6">
      <section class="grid gap-4 lg:grid-cols-3">
        <article
          v-for="item in pageConfig.highlights"
          :key="item.title"
          class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
        >
          <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
          <p class="mt-3 text-sm leading-6 text-slate-600">{{ item.description }}</p>
        </article>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-6">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">接入计划</h2>
            <p class="mt-1 text-sm text-slate-500">
              这个页面骨架已经接入导航，下一步会按后端 handoff 文档逐条补 API 和交互。
            </p>
          </div>
          <router-link
            class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-slate-800"
            to="/accounting"
          >
            返回账本首页
          </router-link>
        </div>

        <ul class="mt-5 grid gap-3 md:grid-cols-2">
          <li
            v-for="step in pageConfig.nextSteps"
            :key="step"
            class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
          >
            {{ step }}
          </li>
        </ul>
      </section>
    </div>

    <template #aside>
      <section class="rounded-[28px] border border-slate-200 bg-white/88 p-5 shadow-sm">
        <p class="text-sm font-semibold text-slate-900">当前 ledger 上下文</p>
        <p class="mt-3 text-lg font-semibold text-slate-900">{{ currentLedgerName }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          {{ currentLedgerDescription }}
        </p>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white/88 p-5 shadow-sm">
        <p class="text-sm font-semibold text-slate-900">建议先接的接口</p>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="api in pageConfig.apiChecklist" :key="api" class="rounded-2xl bg-slate-50 px-3 py-2">
            {{ api }}
          </li>
        </ul>
      </section>
    </template>
  </PlatformPageShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import { useLedgerStore } from '@/stores/ledger'

const route = useRoute()
const ledgerStore = useLedgerStore()
const { currentLedger } = storeToRefs(ledgerStore)

const defaultPageConfig = {
  eyebrow: 'Platform',
  title: '平台功能页面',
  description: '这个页面已经进入路由和导航结构，下一步按 handoff 文档接入真实接口。',
  statusTitle: 'Preparing',
  statusText: '先把页面结构、上下文和入口搭好，再逐步接入预算、通知、导出、统计等能力。',
  highlights: [],
  nextSteps: [],
  apiChecklist: []
}

const pageConfig = computed(() => ({
  ...defaultPageConfig,
  ...(route.meta.platformPage || {})
}))

const currentLedgerName = computed(() => currentLedger.value?.name || '默认平台上下文')
const currentLedgerDescription = computed(() => {
  if (!currentLedger.value) {
    return '账本上下文已经预留，等 ledger 接口稳定后，这些页面会自动绑定到当前账本。'
  }

  return `当前角色：${currentLedger.value.memberRole || 'member'}，后续页面会以这个账本作为默认范围。`
})
</script>
