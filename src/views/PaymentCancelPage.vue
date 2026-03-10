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
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">Billing Return</p>
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
            title="当前页面只表示你已经离开支付页，并不代表系统已经记录新的订阅状态。"
            class="!rounded-3xl"
          />

          <div class="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <h2 class="text-lg font-semibold text-slate-900">你可以怎么做</h2>
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
            <h2 class="text-lg font-semibold text-slate-900">页面说明</h2>
            <p class="mt-3 text-sm leading-7 text-slate-500">
              为了避免误导，这个页面不会直接写成“支付取消成功”或“升级失败”。它只表示用户流程返回，业务状态依然以后端为准。
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
                <h3 class="text-base font-semibold text-amber-900">保持当前判断</h3>
                <p class="mt-2 text-sm leading-6 text-amber-800">
                  如果你只是中途离开，这不会影响你继续回到账单页重新发起流程，或者直接返回记账页继续使用当前功能。
                </p>
              </div>
            </div>
          </div>

          <div class="grid gap-3">
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
import { CircleCloseFilled, InfoFilled } from '@element-plus/icons-vue'
import { usePaymentResult } from '@/composables/usePaymentResult'

const {
  cancelTitle,
  cancelDescription,
  goToHome,
  goBack
} = usePaymentResult('cancel')

const summaryCards = [
  {
    title: '流程状态',
    value: '已离开支付页',
    description: '只表示用户流程结束，并不代表新的订阅状态。',
    className: 'border-amber-100 bg-amber-50/80'
  },
  {
    title: '订阅确认',
    value: '没有变更',
    description: '当前页面没有拿到任何新的后端订阅确认结果。',
    className: 'border-slate-200 bg-slate-50/80'
  },
  {
    title: '后续操作',
    value: '可以再试',
    description: '你可以回到账单页重新查看状态，或再次发起购买流程。',
    className: 'border-cyan-100 bg-cyan-50/80'
  }
]

const nextSteps = [
  {
    title: '回到账单页重新查看状态',
    description: '账单页会重新读取后端支付状态、套餐和当前订阅。'
  },
  {
    title: '如果只是暂时离开，可稍后再试',
    description: '当前前端会重新请求 checkout session，而不是继续依赖写死的 Payment Link。'
  },
  {
    title: '继续使用当前记账功能',
    description: '退出支付流程不会影响你继续记录、筛选和查看图表。'
  }
]
</script>