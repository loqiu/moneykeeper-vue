import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const SUBSCRIPTION_STATUS_LABELS = {
  none: '未开通',
  active: '订阅有效',
  trialing: '试用中',
  past_due: '待补款',
  canceled: '已取消',
  unpaid: '未支付'
}
const ORDER_STATUS_LABELS = {
  pending: '待支付',
  checkout_created: '已创建会话',
  paid: '已支付',
  payment_failed: '支付失败',
  canceled: '已取消',
  refunded: '已退款'
}

const formatDate = (value) => {
  if (!value) {
    return '后端暂未返回'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
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
    return SUBSCRIPTION_STATUS_LABELS.none
  }

  if (subscription.cancelAtPeriodEnd) {
    return '当前有效，到期后取消'
  }

  if (subscription.active || subscription.status === 'active') {
    return SUBSCRIPTION_STATUS_LABELS.active
  }

  return SUBSCRIPTION_STATUS_LABELS[subscription.status] || subscription.status || '待确认'
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
      return '已通过订阅状态确认生效'
    }

    if (isLatestOrderPaid.value) {
      return '已通过最新订单确认支付完成'
    }

    if (verificationState.value === 'timeout') {
      return '轮询结束，仍在等待后端确认'
    }

    if (verificationState.value === 'checking') {
      return '正在等待后端同步订单与订阅状态'
    }

    return '尚未确认'
  })

  const subscriptionStatusText = computed(() => mapSubscriptionStatus(currentSubscription.value))

  const latestOrderStatusText = computed(() => {
    if (!latestOrder.value) {
      return '暂无订单记录'
    }

    return ORDER_STATUS_LABELS[latestOrder.value.status] || latestOrder.value.status || '待确认'
  })

  const currentPeriodText = computed(() => {
    if (!hasActiveSubscription.value) {
      return '当前没有有效订阅周期'
    }

    if (currentSubscription.value.currentPeriodStart && currentSubscription.value.currentPeriodEnd) {
      return `${formatDate(currentSubscription.value.currentPeriodStart)} - ${formatDate(currentSubscription.value.currentPeriodEnd)}`
    }

    if (currentSubscription.value.currentPeriodEnd) {
      return `当前周期到 ${formatDate(currentSubscription.value.currentPeriodEnd)} 结束`
    }

    return '后端暂未返回订阅周期时间'
  })

  const pollingProgressText = computed(() => {
    if (verificationState.value === 'confirmed') {
      return `已在第 ${pollCount.value} 次轮询确认`
    }

    if (verificationState.value === 'timeout') {
      return `已轮询 ${MAX_POLL_ATTEMPTS} 次，仍未拿到确认结果`
    }

    if (!pollCount.value) {
      return `准备开始轮询，最多 ${MAX_POLL_ATTEMPTS} 次`
    }

    return `第 ${pollCount.value} / ${MAX_POLL_ATTEMPTS} 次轮询`
  })

  const successTitle = computed(() => {
    if (verificationState.value === 'confirmed') {
      return '订阅状态已确认'
    }

    if (verificationState.value === 'timeout') {
      return '支付已返回，等待后端确认'
    }

    return '正在确认支付结果'
  })

  const successDescription = computed(() => {
    if (verificationState.value === 'confirmed') {
      return '前端已经从后端订阅或订单接口里拿到了有效结果。你现在看到的是已确认状态，而不是本地臆测。'
    }

    if (verificationState.value === 'timeout') {
      return 'Stripe 已经跳回前端，但在限定轮询次数内还没有拿到订阅生效或订单 paid 的结果。请稍后重试，或回到账单页继续查看。'
    }

    return 'Stripe 已经跳回前端。页面正在按约定轮询订阅与订单接口，只有拿到后端确认结果后，才会把状态展示为已生效。'
  })

  const cancelTitle = computed(() => '你已离开支付流程')
  const cancelDescription = computed(() => {
    return '这只表示你离开了 Stripe Checkout。当前订阅状态以后端为准，前端不会把这次返回解释为购买成功或失败。'
  })

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
    if (verificationState.value === 'confirmed') {
      return '后端已经确认支付结果，当前页面展示的是已确认状态。'
    }

    if (verificationState.value === 'timeout') {
      return '轮询次数已经用完，但还没有拿到有效订阅或 paid 订单。你可以稍后继续重试。'
    }

    return '页面正在每 2 秒轮询一次订阅与订单接口，最多 10 次。'
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