import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchPaymentStatus as fetchPaymentStatusApi } from '@/api/modules/payments'
import { getApiErrorMessage } from '@/api/response'

const hostedPaymentUrl = process.env.VUE_APP_STRIPE_PAYMENT_URL || ''

export function useStripeCheckout() {
  const loading = ref(false)
  const statusLoading = ref(false)
  const paymentStatus = ref({
    enabled: false,
    provider: 'stripe',
    defaultCurrency: 'usd',
    implemented: false
  })

  const subscriptionPlan = ref({
    name: 'RoTec - Teams',
    price: '9.9',
    features: [
      '多平台同步',
      '自动分类和标签',
      '预算设置和提醒',
      '数据可视化分析',
      '安全数据备份'
    ]
  })

  const canOpenHostedCheckout = computed(() => Boolean(hostedPaymentUrl))

  const statusTagType = computed(() => {
    if (statusLoading.value) {
      return 'info'
    }
    if (!paymentStatus.value.enabled || !paymentStatus.value.implemented) {
      return 'warning'
    }
    return 'success'
  })

  const statusText = computed(() => {
    if (statusLoading.value) {
      return '正在检查支付状态'
    }
    if (!paymentStatus.value.enabled) {
      return '后端支付模块当前未启用'
    }
    if (!paymentStatus.value.implemented) {
      return '后端支付模块已启用，但真实支付链路尚未完成'
    }
    return `后端支付模块可用，Provider: ${paymentStatus.value.provider}`
  })

  const helperText = computed(() => {
    if (!canOpenHostedCheckout.value) {
      return '当前项目未配置托管支付链接，前端无法继续跳转到支付页。'
    }
    if (!paymentStatus.value.enabled) {
      return '根据后端文档，payments 模块默认关闭。当前仍会使用托管支付链接作为临时方案，前端不会自动确认最终订阅状态。'
    }
    if (!paymentStatus.value.implemented) {
      return '后端已经暴露支付状态接口，但真实 Stripe 会话尚未完成接入。当前仍会跳转到托管支付链接，支付结果需要后端后续补齐确认链路。'
    }
    return '当前前端仍使用托管支付链接，尚未切到基于后端会话的统一支付流程。'
  })

  const actionText = computed(() => (
    canOpenHostedCheckout.value ? '前往支付页' : '支付不可用'
  ))

  const fetchPaymentStatus = async () => {
    statusLoading.value = true
    try {
      paymentStatus.value = await fetchPaymentStatusApi()
      return true
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '获取支付状态失败'))
      return false
    } finally {
      statusLoading.value = false
    }
  }

  const handleSubscribe = async () => {
    if (!canOpenHostedCheckout.value) {
      ElMessage.warning('支付功能当前不可用')
      return
    }

    loading.value = true
    try {
      await fetchPaymentStatus()

      if (!paymentStatus.value.enabled) {
        ElMessage.info('后端支付模块未启用，将跳转到托管支付页')
      } else if (!paymentStatus.value.implemented) {
        ElMessage.info('后端支付模块尚未接入真实支付流程，将跳转到托管支付页')
      } else {
        ElMessage.info('当前前端仍使用托管支付页，结果页不会直接视为订阅已生效')
      }

      window.location.href = hostedPaymentUrl
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, '跳转失败，请稍后重试'))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchPaymentStatus()
  })

  return {
    loading,
    statusLoading,
    paymentStatus,
    statusTagType,
    statusText,
    helperText,
    actionText,
    canOpenHostedCheckout,
    subscriptionPlan,
    fetchPaymentStatus,
    handleSubscribe
  }
}
