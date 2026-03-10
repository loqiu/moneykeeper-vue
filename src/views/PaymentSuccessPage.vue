<template>
  <div class="min-h-screen overflow-hidden bg-[linear-gradient(145deg,#ecfdf5_0%,#f8fafc_46%,#ecfeff_100%)] px-4 py-6 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-0 top-16 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl"></div>
      <div class="absolute right-0 top-10 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-5xl space-y-6">
      <section class="rounded-[36px] border border-white/75 bg-white/88 p-6 shadow-[0_22px_70px_rgba(148,163,184,0.16)] backdrop-blur sm:p-8 lg:p-10">
        <div class="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div class="flex h-24 w-24 items-center justify-center rounded-[32px] shadow-sm" :class="heroIconWrapperClass">
            <el-icon :size="54" :class="heroIconClass"><component :is="heroIcon" /></el-icon>
          </div>

          <div class="space-y-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.28em]" :class="heroEyebrowClass">Billing Return</p>
              <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{{ successTitle }}</h1>
              <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">{{ successDescription }}</p>
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
            :type="verificationAlertType"
            :closable="false"
            show-icon
            :title="verificationAlertTitle"
            class="!rounded-3xl"
          />

          <div class="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-slate-900">会话标识</h2>
                <p class="mt-1 text-sm text-slate-500">仅用于排查和对账展示，不直接代表业务成功。</p>
              </div>
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {{ hasSessionId ? '已返回 session_id' : '未返回 session_id' }}
              </span>
            </div>

            <div class="mt-4 rounded-3xl bg-slate-900 px-4 py-4 font-mono text-sm text-slate-100">
              {{ hasSessionId ? sessionId : '当前地址未携带可展示的 session_id' }}
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">后端结果摘要</h2>
            <div class="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p><span class="font-medium text-slate-900">确认方式：</span>{{ confirmedByText }}</p>
              <p><span class="font-medium text-slate-900">订阅周期：</span>{{ currentPeriodText }}</p>
              <p v-if="latestOrder"><span class="font-medium text-slate-900">最新订单：</span>{{ latestOrder.orderNo || '后端未返回订单号' }}</p>
              <p v-if="latestOrder"><span class="font-medium text-slate-900">订单时间：</span>{{ formatDate(latestOrder.paidAt || latestOrder.updatedAt || latestOrder.createdAt) }}</p>
            </div>
          </div>
        </section>

        <aside class="space-y-4 rounded-[32px] border border-white/75 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.15)] backdrop-blur">
          <div class="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                <el-icon :size="20"><InfoFilled /></el-icon>
              </div>
              <div>
                <h3 class="text-base font-semibold text-emerald-900">下一步建议</h3>
                <p class="mt-2 text-sm leading-6 text-emerald-800">
                  {{ sideHintText }}
                </p>
              </div>
            </div>
          </div>

          <div class="grid gap-3">
            <el-button
              v-if="verificationState !== 'confirmed'"
              class="!h-12 !rounded-full !border-slate-200 !bg-white hover:!bg-slate-50"
              :disabled="polling"
              @click="retryVerification"
            >
              {{ polling ? '轮询中...' : '重新确认结果' }}
            </el-button>
            <el-button class="!h-12 !rounded-full !border-slate-200 !bg-white hover:!bg-slate-50" @click="goBack">
              返回订阅页
            </el-button>
            <el-button type="primary" class="!h-12 !rounded-full !border-0 !bg-slate-900 hover:!bg-slate-800" @click="goToHome">
              返回记账页
            </el-button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  CircleCheckFilled,
  InfoFilled,
  Loading,
  WarningFilled
} from '@element-plus/icons-vue'
import { usePaymentResult } from '@/composables/usePaymentResult'

const {
  verificationState,
  verificationAlertType,
  verificationAlertTitle,
  polling,
  sessionId,
  hasSessionId,
  latestOrder,
  confirmedByText,
  subscriptionStatusText,
  latestOrderStatusText,
  currentPeriodText,
  pollingProgressText,
  successTitle,
  successDescription,
  retryVerification,
  goToHome,
  goBack,
  formatDate
} = usePaymentResult('success')

const heroIcon = computed(() => {
  if (verificationState.value === 'confirmed') {
    return CircleCheckFilled
  }

  if (verificationState.value === 'timeout') {
    return WarningFilled
  }

  return Loading
})

const heroIconWrapperClass = computed(() => {
  if (verificationState.value === 'confirmed') {
    return 'bg-emerald-100 text-emerald-600'
  }

  if (verificationState.value === 'timeout') {
    return 'bg-amber-100 text-amber-600'
  }

  return 'bg-cyan-100 text-cyan-600'
})

const heroIconClass = computed(() => {
  return verificationState.value === 'checking' ? 'animate-spin' : ''
})

const heroEyebrowClass = computed(() => {
  if (verificationState.value === 'confirmed') {
    return 'text-emerald-600'
  }

  if (verificationState.value === 'timeout') {
    return 'text-amber-600'
  }

  return 'text-cyan-600'
})

const summaryCards = computed(() => [
  {
    title: '轮询进度',
    value: pollingProgressText.value,
    description: '按约定每 2 秒轮询一次，最多 10 次。',
    className: verificationState.value === 'confirmed' ? 'border-emerald-100 bg-emerald-50/80' : 'border-cyan-100 bg-cyan-50/80'
  },
  {
    title: '订阅状态',
    value: subscriptionStatusText.value,
    description: currentPeriodText.value,
    className: verificationState.value === 'confirmed' ? 'border-emerald-100 bg-emerald-50/80' : 'border-slate-200 bg-slate-50/80'
  },
  {
    title: '最新订单',
    value: latestOrderStatusText.value,
    description: latestOrder.value?.orderNo || '后端暂未返回订单号',
    className: latestOrder.value?.status === 'paid' ? 'border-emerald-100 bg-emerald-50/80' : 'border-amber-100 bg-amber-50/80'
  }
])

const sideHintText = computed(() => {
  if (verificationState.value === 'confirmed') {
    return '支付结果已经被后端确认。你现在可以回到账单页继续管理订阅，或者直接返回记账页。'
  }

  if (verificationState.value === 'timeout') {
    return '如果后端稍后才落库，你可以重新进入这个页面再次确认，或回到账单页手动刷新。'
  }

  return '页面正在等后端同步订阅与订单状态。只要拿到 active 订阅或 paid 订单，就会自动停止轮询。'
})
</script>