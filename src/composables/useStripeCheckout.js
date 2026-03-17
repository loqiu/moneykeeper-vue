import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import i18n from '@/i18n'
import {
  cancelCurrentSubscription as cancelCurrentSubscriptionApi,
  createBillingPortalSession,
  createCheckoutSession,
  fetchCurrentSubscription as fetchCurrentSubscriptionApi,
  fetchPaymentPlans as fetchPaymentPlansApi,
  fetchPaymentStatus as fetchPaymentStatusApi
} from '@/api/modules/payments'
import { getApiErrorMessage } from '@/api/response'

const DEFAULT_PLAN_CODE = 'pro_monthly'
const DEFAULT_PAYMENT_STATUS = {
  enabled: false,
  provider: 'stripe',
  defaultCurrency: 'gbp',
  implemented: false,
  apiReady: false,
  webhookReady: false,
  ready: false,
  billingPortalReturnUrlConfigured: false
}
const DEFAULT_SUBSCRIPTION = {
  active: false,
  status: 'none',
  planCode: '',
  planName: '',
  currency: 'gbp',
  amountMinor: 0,
  billingInterval: 'month',
  currentPeriodStart: '',
  currentPeriodEnd: '',
  cancelAtPeriodEnd: false,
  canceledAt: '',
  stripeSubscriptionId: ''
}

const translate = (key, params = {}) => i18n.global.t(key, params)
const getLocale = () => i18n.global.locale.value || 'en-GB'

const getDefaultPlan = () => ({
  code: DEFAULT_PLAN_CODE,
  name: translate('billing.checkout.defaultPlanName'),
  description: translate('billing.checkout.defaultPlanDescription'),
  currency: 'gbp',
  amountMinor: 990,
  billingInterval: 'month'
})

const formatMoneyFromMinor = (amountMinor, currency) => {
  const amount = Number(amountMinor || 0) / 100

  try {
    return new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: (currency || 'GBP').toUpperCase()
    }).format(amount)
  } catch (_error) {
    return `${amount.toFixed(2)} ${(currency || 'GBP').toUpperCase()}`
  }
}

const formatDate = (value) => {
  if (!value) {
    return translate('billing.checkout.messages.periodUnknown')
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const mapSubscriptionStatus = (subscription) => {
  if (!subscription.active && subscription.status === 'none') {
    return translate('billing.checkout.messages.subscriptionNone')
  }

  if (subscription.cancelAtPeriodEnd) {
    return translate('billing.checkout.messages.subscriptionCancelAtPeriodEnd')
  }

  if (subscription.active || subscription.status === 'active') {
    return translate('billing.checkout.messages.subscriptionActive')
  }

  const statusMap = {
    trialing: 'billing.checkout.messages.subscriptionTrialing',
    past_due: 'billing.checkout.messages.subscriptionPastDue',
    canceled: 'billing.checkout.messages.subscriptionCanceled',
    unpaid: 'billing.checkout.messages.subscriptionUnpaid'
  }

  return translate(statusMap[subscription.status], { status: subscription.status }) || subscription.status
}

const normalizePlanCopy = (plan) => {
  if (plan.code === DEFAULT_PLAN_CODE) {
    return {
      ...plan,
      name: translate('billing.checkout.defaultPlanName'),
      description: translate('billing.checkout.defaultPlanDescription')
    }
  }

  return plan
}

export function useStripeCheckout() {
  const router = useRouter()
  const initializing = ref(false)
  const refreshing = ref(false)
  const actionLoading = ref(false)
  const cancelLoading = ref(false)
  const paymentStatus = ref({ ...DEFAULT_PAYMENT_STATUS })
  const plans = ref([])
  const currentSubscription = ref({ ...DEFAULT_SUBSCRIPTION })
  const hasLoadedStatus = ref(false)
  const statusFetchError = ref('')

  const hasActiveSubscription = computed(() => {
    return Boolean(currentSubscription.value.active) || currentSubscription.value.status === 'active'
  })

  const effectivePlanCode = computed(() => {
    return currentSubscription.value.planCode || DEFAULT_PLAN_CODE
  })

  const selectedPlan = computed(() => {
    const defaultPlan = getDefaultPlan()
    const matchedPlan = plans.value.find((item) => item.code === effectivePlanCode.value)
    const subscriptionFallback = hasActiveSubscription.value
      ? {
          code: currentSubscription.value.planCode || defaultPlan.code,
          name: currentSubscription.value.planName || defaultPlan.name,
          description: defaultPlan.description,
          currency: currentSubscription.value.currency || defaultPlan.currency,
          amountMinor: currentSubscription.value.amountMinor || defaultPlan.amountMinor,
          billingInterval: currentSubscription.value.billingInterval || defaultPlan.billingInterval
        }
      : null

    const plan = matchedPlan || subscriptionFallback || defaultPlan
    return normalizePlanCopy({ ...defaultPlan, ...plan })
  })

  const serviceState = computed(() => {
    if (!hasLoadedStatus.value && initializing.value) {
      return 'loading'
    }

    if (statusFetchError.value) {
      return 'error'
    }

    return paymentStatus.value.ready ? 'available' : 'blocked'
  })

  const paymentStatusText = computed(() => {
    if (serviceState.value === 'loading') {
      return translate('billing.checkout.actions.checking')
    }

    if (serviceState.value === 'error') {
      return translate('billing.checkout.messages.statusUnavailable')
    }

    return paymentStatus.value.ready
      ? translate('billing.checkout.messages.paymentAvailable')
      : translate('billing.checkout.messages.paymentBlocked')
  })

  const statusBadgeType = computed(() => {
    if (serviceState.value === 'available') {
      return 'success'
    }

    if (serviceState.value === 'error') {
      return 'danger'
    }

    if (serviceState.value === 'loading') {
      return 'info'
    }

    return 'warning'
  })

  const subscriptionStatusText = computed(() => mapSubscriptionStatus(currentSubscription.value))

  const currentPeriodText = computed(() => {
    if (!hasActiveSubscription.value) {
      return translate('billing.checkout.messages.periodMissing')
    }

    const { currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd } = currentSubscription.value

    if (currentPeriodStart && currentPeriodEnd) {
      return cancelAtPeriodEnd
        ? translate('billing.checkout.messages.periodCancelRange', {
            start: formatDate(currentPeriodStart),
            end: formatDate(currentPeriodEnd)
          })
        : translate('billing.checkout.messages.periodRange', {
            start: formatDate(currentPeriodStart),
            end: formatDate(currentPeriodEnd)
          })
    }

    if (currentPeriodEnd) {
      return cancelAtPeriodEnd
        ? translate('billing.checkout.messages.periodCancelUntil', { end: formatDate(currentPeriodEnd) })
        : translate('billing.checkout.messages.periodUntil', { end: formatDate(currentPeriodEnd) })
    }

    return translate('billing.checkout.messages.periodUnknown')
  })

  const paymentHintText = computed(() => {
    if (serviceState.value === 'loading') {
      return translate('billing.checkout.hints.checking')
    }

    if (serviceState.value === 'error') {
      return translate('billing.checkout.hints.statusError', {
        message: statusFetchError.value || translate('billing.checkout.errors.statusFetchFailed')
      })
    }

    if (!paymentStatus.value.ready) {
      return translate('billing.checkout.hints.blocked')
    }

    if (hasActiveSubscription.value) {
      return currentSubscription.value.cancelAtPeriodEnd
        ? translate('billing.checkout.hints.activeCancel')
        : translate('billing.checkout.hints.activeManage')
    }

    return translate('billing.checkout.hints.buy')
  })

  const primaryActionText = computed(() => {
    if (serviceState.value === 'loading') {
      return translate('billing.checkout.actions.checking')
    }

    if (serviceState.value === 'error') {
      return translate('billing.checkout.actions.retryStatus')
    }

    if (hasActiveSubscription.value) {
      return translate('billing.checkout.actions.manageSubscription')
    }

    return paymentStatus.value.ready
      ? translate('billing.checkout.actions.buyNow')
      : translate('billing.checkout.actions.blocked')
  })

  const primaryActionDescription = computed(() => {
    if (serviceState.value === 'error') {
      return translate('billing.checkout.hints.retry')
    }

    if (serviceState.value === 'loading') {
      return translate('billing.checkout.hints.loading')
    }

    if (hasActiveSubscription.value) {
      return translate('billing.checkout.hints.manage')
    }

    if (!paymentStatus.value.ready) {
      return translate('billing.checkout.hints.preparing')
    }

    return translate('billing.checkout.hints.checkout')
  })

  const primaryActionDisabled = computed(() => {
    if (actionLoading.value || serviceState.value === 'loading') {
      return true
    }

    if (serviceState.value === 'error') {
      return false
    }

    return !hasActiveSubscription.value && !paymentStatus.value.ready
  })

  const canCancelSubscription = computed(() => {
    return hasActiveSubscription.value && !currentSubscription.value.cancelAtPeriodEnd && !cancelLoading.value
  })

  const secondaryActionText = computed(() => {
    return currentSubscription.value.cancelAtPeriodEnd
      ? translate('billing.checkout.actions.cancelScheduled')
      : translate('billing.checkout.actions.cancelSubscription')
  })

  const priceText = computed(() => {
    return formatMoneyFromMinor(selectedPlan.value.amountMinor, selectedPlan.value.currency)
  })

  const billingIntervalText = computed(() => {
    return selectedPlan.value.billingInterval === 'year'
      ? translate('billing.checkout.intervalYear')
      : translate('billing.checkout.intervalMonth')
  })

  const buildAbsoluteUrl = (path) => {
    const href = router.resolve({ path }).href
    return new URL(href, window.location.origin).toString()
  }

  const fetchCheckoutData = async ({ silent = false } = {}) => {
    if (silent) {
      refreshing.value = true
    } else {
      initializing.value = true
    }

    try {
      const results = await Promise.allSettled([
        fetchPaymentStatusApi(),
        fetchPaymentPlansApi(),
        fetchCurrentSubscriptionApi()
      ])

      if (results[0].status === 'fulfilled') {
        paymentStatus.value = results[0].value
        statusFetchError.value = ''
      } else {
        statusFetchError.value = getApiErrorMessage(
          results[0].reason,
          translate('billing.checkout.errors.statusFetchFailed')
        )
      }
      hasLoadedStatus.value = true

      if (results[1].status === 'fulfilled') {
        plans.value = results[1].value
      } else if (!silent) {
        ElMessage.warning(translate('billing.checkout.errors.plansFetchFailed'))
      }

      if (results[2].status === 'fulfilled') {
        currentSubscription.value = results[2].value
      } else if (!silent) {
        ElMessage.warning(translate('billing.checkout.errors.subscriptionFetchFailed'))
      }

      if (!plans.value.length) {
        plans.value = [getDefaultPlan()]
      }
    } finally {
      if (silent) {
        refreshing.value = false
      } else {
        initializing.value = false
      }
    }
  }

  const handleManageSubscription = async () => {
    if (!hasActiveSubscription.value) {
      return
    }

    actionLoading.value = true
    try {
      const session = await createBillingPortalSession({
        returnUrl: buildAbsoluteUrl('/billing')
      })

      if (!session.url) {
        throw new Error(translate('billing.checkout.errors.portalUrlMissing'))
      }

      window.location.href = session.url
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, translate('billing.checkout.errors.portalOpenFailed')))
    } finally {
      actionLoading.value = false
    }
  }

  const handleCheckout = async () => {
    if (!paymentStatus.value.ready) {
      ElMessage.warning(translate('billing.checkout.errors.paymentBlocked'))
      return
    }

    actionLoading.value = true
    try {
      await fetchCheckoutData({ silent: true })

      if (statusFetchError.value) {
        throw new Error(statusFetchError.value)
      }

      if (hasActiveSubscription.value) {
        actionLoading.value = false
        await handleManageSubscription()
        return
      }

      if (!paymentStatus.value.ready) {
        throw new Error(translate('billing.checkout.errors.serviceNotReady'))
      }

      const session = await createCheckoutSession({
        planCode: DEFAULT_PLAN_CODE,
        successUrl: buildAbsoluteUrl('/billing/success'),
        cancelUrl: buildAbsoluteUrl('/billing/cancel')
      })

      if (!session.checkoutUrl) {
        throw new Error(translate('billing.checkout.errors.checkoutUrlMissing'))
      }

      window.location.href = session.checkoutUrl
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, translate('billing.checkout.errors.checkoutFailed')))
    } finally {
      actionLoading.value = false
    }
  }

  const handlePrimaryAction = async () => {
    if (serviceState.value === 'error') {
      await fetchCheckoutData()
      return
    }

    if (hasActiveSubscription.value) {
      await handleManageSubscription()
      return
    }

    await handleCheckout()
  }

  const handleCancelSubscription = async () => {
    if (!canCancelSubscription.value) {
      return
    }

    try {
      await ElMessageBox.confirm(
        translate('billing.checkout.confirm.cancelDescription'),
        translate('billing.checkout.confirm.cancelTitle'),
        {
          confirmButtonText: translate('billing.checkout.confirm.confirm'),
          cancelButtonText: translate('billing.checkout.confirm.cancel'),
          type: 'warning'
        }
      )
    } catch (error) {
      if (error === 'cancel') {
        return
      }
      throw error
    }

    cancelLoading.value = true
    try {
      await cancelCurrentSubscriptionApi()
      ElMessage.success(translate('billing.checkout.actions.cancelScheduled'))
      await fetchCheckoutData({ silent: true })
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, translate('billing.checkout.errors.cancelFailed')))
    } finally {
      cancelLoading.value = false
    }
  }

  onMounted(() => {
    fetchCheckoutData()
  })

  return {
    initializing,
    refreshing,
    actionLoading,
    cancelLoading,
    paymentStatus,
    plans,
    currentSubscription,
    hasLoadedStatus,
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
    primaryActionDescription,
    primaryActionDisabled,
    canCancelSubscription,
    secondaryActionText,
    priceText,
    billingIntervalText,
    fetchCheckoutData,
    handlePrimaryAction,
    handleCancelSubscription
  }
}
