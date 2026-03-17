<template>
  <div class="min-h-screen overflow-hidden bg-[linear-gradient(150deg,#fff7ed_0%,#f8fafc_50%,#ecfeff_100%)] px-4 py-6 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-0 top-16 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl"></div>
      <div class="absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-200/20 blur-3xl"></div>
    </div>

    <div class="relative mx-auto max-w-6xl space-y-6">
      <section class="rounded-[36px] border border-white/75 bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div class="space-y-5">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-200 backdrop-blur">
              <el-icon><CreditCard /></el-icon>
              <span>{{ t('billing.checkout.eyebrow') }}</span>
            </div>
            <div>
              <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">{{ selectedPlan.name }}</h1>
              <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {{ selectedPlan.description }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <el-tag :type="statusBadgeType" effect="dark" class="!rounded-full !border-0">
                {{ paymentStatusText }}
              </el-tag>
              <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                {{ subscriptionStatusText }}
              </span>
              <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                {{ serviceState === 'loading' ? t('billing.checkout.serviceSyncingLabel') : t('billing.checkout.stripeHosted') }}
              </span>
            </div>
          </div>

          <div class="rounded-[32px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('billing.checkout.priceLabel') }}</div>
            <div class="mt-4 flex items-end gap-2">
              <span class="text-5xl font-semibold leading-none">{{ priceText }}</span>
              <span class="pb-1 text-sm text-slate-300">{{ billingIntervalText }}</span>
            </div>
            <p class="mt-4 text-sm leading-6 text-slate-300">
              {{ t('billing.checkout.heroDescription') }}
            </p>
            <el-button
              type="primary"
              class="!mt-5 !h-12 !w-full !rounded-full !border-0 !bg-white !text-slate-900 hover:!bg-slate-100 disabled:!bg-slate-300 disabled:!text-white"
              :loading="actionLoading"
              :disabled="primaryActionDisabled"
              @click="handlePrimaryAction"
            >
              {{ primaryActionText }}
            </el-button>
          </div>
        </div>
      </section>

      <section class="rounded-[32px] border border-white/75 bg-white/90 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.15)] backdrop-blur">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 class="text-2xl font-semibold tracking-tight text-slate-900">{{ sectionTitle }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ sectionDescription }}</p>
          </div>
          <el-button
            link
            :loading="initializing || refreshing"
            class="!px-0 !text-slate-500 hover:!text-slate-900"
            @click="fetchCheckoutData()"
          >
            {{ t('billing.checkout.actions.refreshStatus') }}
          </el-button>
        </div>

        <el-alert
          :type="statusAlertType"
          :closable="false"
          show-icon
          :title="paymentHintText"
          class="!mt-6 !rounded-3xl"
        />

        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <article
            v-for="item in summaryCards"
            :key="item.title"
            class="rounded-3xl border p-5"
            :class="item.className"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-slate-600">{{ item.title }}</p>
                <p class="mt-3 text-2xl font-semibold text-slate-900">{{ item.value }}</p>
              </div>
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl" :class="item.iconClass">
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
              </div>
            </div>
            <p class="mt-3 text-sm leading-6 text-slate-500">{{ item.description }}</p>
          </article>
        </div>

        <div class="mt-6">
          <section v-if="hasActiveSubscription" class="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                <el-icon :size="20"><CircleCheckFilled /></el-icon>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg font-semibold text-emerald-900">{{ t('billing.checkout.states.subscribedTitle') }}</h3>
                <p class="mt-2 text-sm leading-6 text-emerald-800">{{ currentPeriodText }}</p>
                <p class="mt-2 text-sm leading-6 text-emerald-800">
                  {{ currentSubscription.cancelAtPeriodEnd ? t('billing.checkout.states.subscribedCancelHint') : t('billing.checkout.states.subscribedManageHint') }}
                </p>
              </div>
            </div>
            <el-button
              class="!mt-4 !h-11 !rounded-full !border-slate-200 !bg-white hover:!bg-slate-50"
              :loading="cancelLoading"
              :disabled="!canCancelSubscription"
              @click="handleCancelSubscription"
            >
              {{ secondaryActionText }}
            </el-button>
          </section>

          <section v-else-if="serviceState === 'available'" class="rounded-3xl border border-sky-200 bg-sky-50/80 p-5">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                <el-icon :size="20"><WalletFilled /></el-icon>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg font-semibold text-sky-900">{{ t('billing.checkout.states.availableTitle') }}</h3>
                <p class="mt-2 text-sm leading-6 text-sky-800">
                  {{ t('billing.checkout.states.availableDescription') }}
                </p>
              </div>
            </div>
          </section>

          <section v-else-if="serviceState === 'error'" class="rounded-3xl border border-rose-200 bg-rose-50/80 p-5">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                <el-icon :size="20"><CircleCloseFilled /></el-icon>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg font-semibold text-rose-900">{{ t('billing.checkout.states.errorTitle') }}</h3>
                <p class="mt-2 text-sm leading-6 text-rose-800">{{ statusFetchError }}</p>
                <p class="mt-2 text-sm leading-6 text-rose-800">
                  {{ t('billing.checkout.states.errorDescription') }}
                </p>
              </div>
            </div>
          </section>

          <section v-else class="rounded-3xl border border-amber-200 bg-amber-50/80 p-5">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                <el-icon :size="20"><WarningFilled /></el-icon>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg font-semibold text-amber-900">{{ t('billing.checkout.states.blockedTitle') }}</h3>
                <p class="mt-2 text-sm leading-6 text-amber-800">
                  {{ t('billing.checkout.states.blockedDescription') }}
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CircleCheckFilled,
  CircleCloseFilled,
  CreditCard,
  Tickets,
  WarningFilled,
  WalletFilled
} from '@element-plus/icons-vue'
import { useStripeCheckout } from '@/composables/useStripeCheckout'

const { t } = useI18n()
const {
  initializing,
  refreshing,
  actionLoading,
  cancelLoading,
  currentSubscription,
  statusFetchError,
  serviceState,
  selectedPlan,
  hasActiveSubscription,
  paymentStatusText,
  statusBadgeType,
  subscriptionStatusText,
  currentPeriodText,
  paymentHintText,
  primaryActionText,
  primaryActionDisabled,
  canCancelSubscription,
  secondaryActionText,
  priceText,
  billingIntervalText,
  fetchCheckoutData,
  handlePrimaryAction,
  handleCancelSubscription
} = useStripeCheckout()

const sectionTitle = computed(() => {
  if (hasActiveSubscription.value) return t('billing.checkout.section.activeTitle')
  if (serviceState.value === 'available') return t('billing.checkout.section.availableTitle')
  if (serviceState.value === 'error') return t('billing.checkout.section.errorTitle')
  if (serviceState.value === 'loading') return t('billing.checkout.section.loadingTitle')
  return t('billing.checkout.section.blockedTitle')
})

const sectionDescription = computed(() => {
  if (hasActiveSubscription.value) return t('billing.checkout.section.activeDescription')
  if (serviceState.value === 'available') return t('billing.checkout.section.availableDescription')
  if (serviceState.value === 'error') return t('billing.checkout.section.errorDescription')
  if (serviceState.value === 'loading') return t('billing.checkout.section.loadingDescription')
  return t('billing.checkout.section.blockedDescription')
})

const statusAlertType = computed(() => {
  if (serviceState.value === 'available') return 'success'
  if (serviceState.value === 'error') return 'error'
  if (serviceState.value === 'loading') return 'info'
  return 'warning'
})

const summaryCards = computed(() => [
  {
    title: t('billing.checkout.cards.plan'),
    value: selectedPlan.value.name,
    description: `${priceText.value}${billingIntervalText.value}`,
    icon: Tickets,
    className: 'border-sky-100 bg-sky-50/80',
    iconClass: 'bg-sky-500 text-white'
  },
  {
    title: t('billing.checkout.cards.subscriptionStatus'),
    value: subscriptionStatusText.value,
    description: hasActiveSubscription.value ? currentPeriodText.value : t('billing.checkout.cards.subscriptionEmpty'),
    icon: CircleCheckFilled,
    className: hasActiveSubscription.value ? 'border-emerald-100 bg-emerald-50/80' : 'border-slate-200 bg-slate-50/80',
    iconClass: hasActiveSubscription.value ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
  },
  {
    title: t('billing.checkout.cards.paymentStatus'),
    value: paymentStatusText.value,
    description: serviceState.value === 'error'
      ? (statusFetchError.value || t('billing.checkout.cards.statusUnavailable'))
      : (serviceState.value === 'available'
          ? t('billing.checkout.cards.paymentAvailable')
          : t('billing.checkout.cards.paymentBlocked')),
    icon: serviceState.value === 'error' ? CircleCloseFilled : WalletFilled,
    className: serviceState.value === 'available'
      ? 'border-emerald-100 bg-emerald-50/80'
      : serviceState.value === 'error'
        ? 'border-rose-100 bg-rose-50/80'
        : 'border-amber-100 bg-amber-50/80',
    iconClass: serviceState.value === 'available'
      ? 'bg-emerald-500 text-white'
      : serviceState.value === 'error'
        ? 'bg-rose-500 text-white'
        : 'bg-amber-500 text-white'
  }
])
</script>
