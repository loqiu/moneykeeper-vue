import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import i18n from '@/i18n'
import {
  fetchCurrentSubscription as fetchCurrentSubscriptionApi,
  fetchPaymentOrders as fetchPaymentOrdersApi
} from '@/api/modules/payments'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 10
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

const formatDate = (value) => {
  if (!value) {
    return translate('billing.result.messages.periodUnknown')
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getOrderTimestamp = (order = {}) => {
  const source = order.paidAt || order.updatedAt || order.createdAt
  const timestamp = source ? new Date(source).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const mapSubscriptionStatus = (subscription) => {
  if (!subscription.active && subscription.status === 'none') {
    return translate('billing.result.messages.subscriptionNone')
  }

  if (subscription.cancelAtPeriodEnd) {
    return translate('billing.result.messages.subscriptionCancelAtPeriodEnd')
  }

  if (subscription.active || subscription.status === 'active') {
    return translate('billing.result.messages.subscriptionActive')
  }

  const statusMap = {
    trialing: 'billing.result.messages.subscriptionTrialing',
    past_due: 'billing.result.messages.subscriptionPastDue',
    canceled: 'billing.result.messages.subscriptionCanceled',
    unpaid: 'billing.result.messages.subscriptionUnpaid'
  }

  return translate(statusMap[subscription.status], { status: subscription.status }) || subscription.status
}

const mapOrderStatus = (status) => {
  const statusMap = {
    pending: 'billing.result.messages.orderPending',
    checkout_created: 'billing.result.messages.orderCheckoutCreated',
    paid: 'billing.result.messages.orderPaid',
    payment_failed: 'billing.result.messages.orderFailed',
    canceled: 'billing.result.messages.orderCanceled',
    refunded: 'billing.result.messages.orderRefunded'
  }

  return translate(statusMap[status], { status }) || status || translate('common.status.unknown')
}

export function usePaymentResult(mode = 'success') {
  const router = useRouter()
  const route = useRoute()
  const verificationState = ref(mode === 'success' ? 'idle' : 'cancelled')
  const polling = ref(false)
  const pollCount = ref(0)
  const currentSubscription = ref({ ...DEFAULT_SUBSCRIPTION })
  const orders = ref([])
  let pollTimerId = null

  const sessionId = computed(() => {
    const value = route.query.session_id
    return typeof value === 'string' ? value : ''
  })

  const hasSessionId = computed(() => Boolean(sessionId.value))

  const latestOrder = computed(() => {
    return [...orders.value].sort((left, right) => getOrderTimestamp(right) - getOrderTimestamp(left))[0] || null
  })

  const hasActiveSubscription = computed(() => {
    return Boolean(currentSubscription.value.active) || currentSubscription.value.status === 'active'
  })

  const isLatestOrderPaid = computed(() => {
    return latestOrder.value?.status === 'paid'
  })

  const confirmedByText = computed(() => {
    if (hasActiveSubscription.value) {
      return translate('billing.result.messages.confirmedBySubscription')
    }

    if (isLatestOrderPaid.value) {
      return translate('billing.result.messages.confirmedByOrder')
    }

    if (verificationState.value === 'timeout') {
      return translate('billing.result.messages.confirmedWaiting')
    }

    if (verificationState.value === 'checking') {
      return translate('billing.result.messages.confirmedChecking')
    }

    return translate('billing.result.messages.confirmedUnknown')
  })

  const subscriptionStatusText = computed(() => mapSubscriptionStatus(currentSubscription.value))

  const latestOrderStatusText = computed(() => {
    if (!latestOrder.value) {
      return translate('billing.result.messages.noOrder')
    }

    return mapOrderStatus(latestOrder.value.status)
  })

  const currentPeriodText = computed(() => {
    if (!hasActiveSubscription.value) {
      return translate('billing.result.messages.noPeriod')
    }

    if (currentSubscription.value.currentPeriodStart && currentSubscription.value.currentPeriodEnd) {
      return translate('billing.result.messages.periodRange', {
        start: formatDate(currentSubscription.value.currentPeriodStart),
        end: formatDate(currentSubscription.value.currentPeriodEnd)
      })
    }

    if (currentSubscription.value.currentPeriodEnd) {
      return translate('billing.result.messages.periodUntil', {
        date: formatDate(currentSubscription.value.currentPeriodEnd)
      })
    }

    return translate('billing.result.messages.periodUnknown')
  })

  const pollingProgressText = computed(() => {
    if (verificationState.value === 'confirmed') {
      return translate('billing.result.messages.pollingConfirmed', { count: pollCount.value })
    }

    if (verificationState.value === 'timeout') {
      return translate('billing.result.messages.pollingTimeout', { count: MAX_POLL_ATTEMPTS })
    }

    if (!pollCount.value) {
      return translate('billing.result.messages.pollingReady', { count: MAX_POLL_ATTEMPTS })
    }

    return translate('billing.result.messages.pollingProgress', {
      current: pollCount.value,
      total: MAX_POLL_ATTEMPTS
    })
  })

  const successTitle = computed(() => {
    if (verificationState.value === 'confirmed') {
      return translate('billing.result.successTitleConfirmed')
    }

    if (verificationState.value === 'timeout') {
      return translate('billing.result.successTitleTimeout')
    }

    return translate('billing.result.successTitleChecking')
  })

  const successDescription = computed(() => {
    if (verificationState.value === 'confirmed') {
      return translate('billing.result.successDescriptionConfirmed')
    }

    if (verificationState.value === 'timeout') {
      return translate('billing.result.successDescriptionTimeout')
    }

    return translate('billing.result.successDescriptionChecking')
  })

  const cancelTitle = computed(() => translate('billing.result.cancelTitle'))
  const cancelDescription = computed(() => translate('billing.result.cancelDescription'))

  const verificationAlertType = computed(() => {
    if (verificationState.value === 'confirmed') {
      return 'success'
    }

    if (verificationState.value === 'timeout') {
      return 'warning'
    }

    return 'info'
  })

  const verificationAlertTitle = computed(() => {
    if (mode === 'cancel') {
      return translate('billing.result.alert.cancel')
    }

    if (verificationState.value === 'confirmed') {
      return translate('billing.result.alert.confirmed')
    }

    if (verificationState.value === 'timeout') {
      return translate('billing.result.alert.timeout')
    }

    return translate('billing.result.alert.checking')
  })

  const stopPolling = () => {
    if (pollTimerId) {
      window.clearTimeout(pollTimerId)
      pollTimerId = null
    }
    polling.value = false
  }

  const scheduleNextPoll = () => {
    pollTimerId = window.setTimeout(() => {
      runVerification()
    }, POLL_INTERVAL_MS)
  }

  const runVerification = async () => {
    if (mode !== 'success') {
      return
    }

    polling.value = true
    verificationState.value = 'checking'
    pollCount.value += 1

    const [subscriptionResult, ordersResult] = await Promise.allSettled([
      fetchCurrentSubscriptionApi(),
      fetchPaymentOrdersApi()
    ])

    if (subscriptionResult.status === 'fulfilled') {
      currentSubscription.value = subscriptionResult.value
    }

    if (ordersResult.status === 'fulfilled') {
      orders.value = ordersResult.value
    }

    if (hasActiveSubscription.value || isLatestOrderPaid.value) {
      verificationState.value = 'confirmed'
      stopPolling()
      return
    }

    if (pollCount.value >= MAX_POLL_ATTEMPTS) {
      verificationState.value = 'timeout'
      stopPolling()
      return
    }

    scheduleNextPoll()
  }

  const retryVerification = async () => {
    stopPolling()
    pollCount.value = 0
    verificationState.value = 'idle'
    await runVerification()
  }

  const goToHome = () => {
    router.push('/accounting')
  }

  const goBack = () => {
    router.push('/billing')
  }

  onMounted(() => {
    if (mode === 'success') {
      runVerification()
    }
  })

  onBeforeUnmount(() => {
    stopPolling()
  })

  return {
    verificationState,
    verificationAlertType,
    verificationAlertTitle,
    polling,
    pollCount,
    sessionId,
    hasSessionId,
    currentSubscription,
    latestOrder,
    hasActiveSubscription,
    isLatestOrderPaid,
    confirmedByText,
    subscriptionStatusText,
    latestOrderStatusText,
    currentPeriodText,
    pollingProgressText,
    successTitle,
    successDescription,
    cancelTitle,
    cancelDescription,
    retryVerification,
    goToHome,
    goBack,
    formatDate
  }
}
