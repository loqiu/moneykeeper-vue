import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
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
const DEFAULT_PLAN = {
  code: DEFAULT_PLAN_CODE,
  name: 'Pro 月付',
  description: '按月订阅，可在 Stripe 中管理账单与支付方式。',
  currency: 'gbp',
  amountMinor: 990,
  billingInterval: 'month'
}

const formatMoneyFromMinor = (amountMinor, currency) => {
  const amount = Number(amountMinor || 0) / 100

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: (currency || 'GBP').toUpperCase()
    }).format(amount)
  } catch (_error) {
    return `${amount.toFixed(2)} ${(currency || 'GBP').toUpperCase()}`
  }
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
    day: 'numeric'
  }).format(date)
}

const mapSubscriptionStatus = (subscription) => {
  if (!subscription.active && subscription.status === 'none') {
    return '未开通'
  }

  if (subscription.cancelAtPeriodEnd) {
    return '当前有效，到期后取消'
  }

  if (subscription.active || subscription.status === 'active') {
    return '订阅有效'
  }

  const statusMap = {
    trialing: '试用中',
    past_due: '待补款',
    canceled: '已取消',
    unpaid: '未支付'
  }

  return statusMap[subscription.status] || subscription.status || '待确认'
}

const normalizePlanCopy = (plan) => {
  if (plan.code === DEFAULT_PLAN_CODE) {
    return {
      ...plan,
      name: DEFAULT_PLAN.name,
      description: DEFAULT_PLAN.description
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
    const matchedPlan = plans.value.find((item) => item.code === effectivePlanCode.value)
    const subscriptionFallback = hasActiveSubscription.value
      ? {
          code: currentSubscription.value.planCode || DEFAULT_PLAN.code,
          name: currentSubscription.value.planName || DEFAULT_PLAN.name,
          description: DEFAULT_PLAN.description,
          currency: currentSubscription.value.currency || DEFAULT_PLAN.currency,
          amountMinor: currentSubscription.value.amountMinor || DEFAULT_PLAN.amountMinor,
          billingInterval: currentSubscription.value.billingInterval || DEFAULT_PLAN.billingInterval
        }
      : null

    const plan = matchedPlan || subscriptionFallback || DEFAULT_PLAN
    return normalizePlanCopy({ ...DEFAULT_PLAN, ...plan })
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
      return '正在检查'
    }

    if (serviceState.value === 'error') {
      return '状态获取失败'
    }

    return paymentStatus.value.ready ? '支付可用' : '支付暂不可用'
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
      return '当前没有有效订阅周期'
    }

    const { currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd } = currentSubscription.value

    if (currentPeriodStart && currentPeriodEnd) {
      return cancelAtPeriodEnd
        ? `${formatDate(currentPeriodStart)} - ${formatDate(currentPeriodEnd)}（到期后取消）`
        : `${formatDate(currentPeriodStart)} - ${formatDate(currentPeriodEnd)}`
    }

    if (currentPeriodEnd) {
      return cancelAtPeriodEnd
        ? `当前周期到 ${formatDate(currentPeriodEnd)} 结束后取消`
        : `当前周期到 ${formatDate(currentPeriodEnd)} 结束`
    }

    return '后端暂未返回订阅周期时间'
  })

  const paymentHintText = computed(() => {
    if (serviceState.value === 'loading') {
      return '正在检查支付状态，请稍等。'
    }

    if (serviceState.value === 'error') {
      return `${statusFetchError.value || '支付状态获取失败'}。请先刷新状态；如果仍失败，请确认当前环境的登录态和 /api 代理。`
    }

    if (!paymentStatus.value.ready) {
      return '支付服务当前未开放，暂时无法购买。'
    }

    if (hasActiveSubscription.value) {
      return currentSubscription.value.cancelAtPeriodEnd
        ? '你的订阅仍然有效，并已设置在当前周期结束后自动取消。'
        : '你已经开通当前套餐，可以直接前往 Stripe 管理订阅。'
    }

    return '点击购买后会跳转到 Stripe 安全支付页面完成付款。'
  })

  const primaryActionText = computed(() => {
    if (serviceState.value === 'loading') {
      return '正在检查'
    }

    if (serviceState.value === 'error') {
      return '重新获取状态'
    }

    if (hasActiveSubscription.value) {
      return '管理订阅'
    }

    return paymentStatus.value.ready ? '立即购买' : '暂不可购买'
  })

  const primaryActionDescription = computed(() => {
    if (serviceState.value === 'error') {
      return '先重新检查支付状态，再决定是否继续购买。'
    }

    if (serviceState.value === 'loading') {
      return '页面正在读取后端支付状态。'
    }

    if (hasActiveSubscription.value) {
      return '查看账单、支付方式和当前订阅设置。'
    }

    if (!paymentStatus.value.ready) {
      return '支付服务正在准备中，请稍后再试。'
    }

    return '前往 Stripe 完成当前套餐的支付。'
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
    return currentSubscription.value.cancelAtPeriodEnd ? '已设置到期取消' : '取消订阅'
  })

  const priceText = computed(() => {
    return formatMoneyFromMinor(selectedPlan.value.amountMinor, selectedPlan.value.currency)
  })

  const billingIntervalText = computed(() => {
    return selectedPlan.value.billingInterval === 'year' ? '/年' : '/月'
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
        statusFetchError.value = getApiErrorMessage(results[0].reason, '支付状态获取失败')
      }
      hasLoadedStatus.value = true

      if (results[1].status === 'fulfilled') {
        plans.value = results[1].value
      } else if (!silent) {
        ElMessage.warning('套餐信息获取失败，先显示默认套餐。')
      }

      if (results[2].status === 'fulfilled') {
        currentSubscription.value = results[2].value
      } else if (!silent) {
        ElMessage.warning('订阅状态获取失败，先按未订阅展示。')
      }

      if (!plans.value.length) {
        plans.value = [DEFAULT_PLAN]
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
        throw new Error('后端未返回可用的订阅管理地址')
      }

      window.location.href = session.url
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '打开订阅管理失败，请稍后重试'))
    } finally {
      actionLoading.value = false
    }
  }

  const handleCheckout = async () => {
    if (!paymentStatus.value.ready) {
      ElMessage.warning('支付暂不可用')
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
        throw new Error('支付服务当前未准备完成')
      }

      const session = await createCheckoutSession({
        planCode: DEFAULT_PLAN_CODE,
        successUrl: buildAbsoluteUrl('/billing/success'),
        cancelUrl: buildAbsoluteUrl('/billing/cancel')
      })

      if (!session.checkoutUrl) {
        throw new Error('后端未返回可用的支付地址')
      }

      window.location.href = session.checkoutUrl
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '发起支付失败，请稍后重试'))
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
        '取消订阅会在当前计费周期结束后生效，确认继续吗？',
        '取消订阅',
        {
          confirmButtonText: '确认取消',
          cancelButtonText: '我再想想',
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
      ElMessage.success('已设置为到期后取消订阅')
      await fetchCheckoutData({ silent: true })
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '取消订阅失败，请稍后重试'))
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