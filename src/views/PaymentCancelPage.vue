<template>
  <div class="min-h-screen overflow-hidden bg-[linear-gradient(145deg,#fff7ed_0%,#f8fafc_46%,#fff1f2_100%)] px-4 py-6 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-0 top-16 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl"></div>
      <div class="absolute right-0 top-10 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-5xl space-y-6">
      <section class="rounded-[36px] border border-white/75 bg-white/88 p-6 shadow-[0_22px_70px_rgba(148,163,184,0.16)] backdrop-blur sm:p-8 lg:p-10">
        <div class="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div class="flex h-24 w-24 items-center justify-center rounded-[32px] bg-rose-100 text-rose-600 shadow-sm">
            <el-icon :size="54"><CircleCloseFilled /></el-icon>
          </div>

          <div class="space-y-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">{{ t('billing.result.eyebrow') }}</p>
              <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{{ cancelTitle }}</h1>
              <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">{{ cancelDescription }}</p>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              <article
                v-for="item in summaryCards"
                :key="item.title"
                class="rounded-3xl border p-4"
                :class="item.className"
              >
                <div class="text-sm font-medium text-slate-600">{{ item.title }}</div>
                <div class="mt-3 text-2xl font-semibold text-slate-900">{{ item.value }}</div>
                <p class="mt-2 text-xs leading-5 text-slate-500">{{ item.description }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section class="space-y-5 rounded-[32px] border border-white/75 bg-white/90 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.15)] backdrop-blur">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            :title="t('billing.result.alert.cancel')"
            class="!rounded-3xl"
          />

          <div class="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <h2 class="text-lg font-semibold text-slate-900">{{ t('billing.result.cancelPage.whatNextTitle') }}</h2>
            <div class="mt-4 space-y-3">
              <div
                v-for="(item, index) in nextSteps"
                :key="item.title"
                class="flex gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  {{ index + 1 }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ item.title }}</div>
                  <p class="mt-1 text-sm leading-6 text-slate-500">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">{{ t('billing.result.cancelPage.notesTitle') }}</h2>
            <p class="mt-3 text-sm leading-7 text-slate-500">
              {{ t('billing.result.cancelPage.notesDescription') }}
            </p>
          </div>
        </section>

        <aside class="space-y-4 rounded-[32px] border border-white/75 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.15)] backdrop-blur">
          <div class="rounded-3xl border border-amber-200 bg-amber-50/90 p-5">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                <el-icon :size="20"><InfoFilled /></el-icon>
              </div>
              <div>
                <h3 class="text-base font-semibold text-amber-900">{{ t('billing.result.side.cancelTitle') }}</h3>
                <p class="mt-2 text-sm leading-6 text-amber-800">
                  {{ t('billing.result.side.cancelDescription') }}
                </p>
              </div>
            </div>
          </div>

          <div class="grid gap-3">
            <el-button class="!h-12 !rounded-full !border-slate-200 !bg-white hover:!bg-slate-50" @click="goBack">
              {{ t('billing.result.actions.backToBilling') }}
            </el-button>
            <el-button type="primary" class="!h-12 !rounded-full !border-0 !bg-slate-900 hover:!bg-slate-800" @click="goToHome">
              {{ t('billing.result.actions.backToAccounting') }}
            </el-button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CircleCloseFilled, InfoFilled } from '@element-plus/icons-vue'
import { usePaymentResult } from '@/composables/usePaymentResult'

const { t } = useI18n()
const { cancelTitle, cancelDescription, goToHome, goBack } = usePaymentResult('cancel')

const summaryCards = computed(() => [
  {
    title: t('billing.result.summaryCards.flow'),
    value: t('billing.result.summaryCards.flowValue'),
    description: t('billing.result.summaryCards.flowHint'),
    className: 'border-amber-100 bg-amber-50/80'
  },
  {
    title: t('billing.result.summaryCards.verification'),
    value: t('billing.result.summaryCards.verificationValue'),
    description: t('billing.result.summaryCards.verificationHint'),
    className: 'border-slate-200 bg-slate-50/80'
  },
  {
    title: t('billing.result.summaryCards.next'),
    value: t('billing.result.summaryCards.nextValue'),
    description: t('billing.result.summaryCards.nextHint'),
    className: 'border-cyan-100 bg-cyan-50/80'
  }
])

const nextSteps = computed(() => [
  {
    title: t('billing.result.cancelPage.steps.review.title'),
    description: t('billing.result.cancelPage.steps.review.description')
  },
  {
    title: t('billing.result.cancelPage.steps.retry.title'),
    description: t('billing.result.cancelPage.steps.retry.description')
  },
  {
    title: t('billing.result.cancelPage.steps.continue.title'),
    description: t('billing.result.cancelPage.steps.continue.description')
  }
])
</script>
