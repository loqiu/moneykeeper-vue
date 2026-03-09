import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function usePaymentResult() {
  const router = useRouter()
  const route = useRoute()

  const sessionId = computed(() => {
    const value = route.query.session_id
    return typeof value === 'string' ? value : ''
  })

  const hasSessionId = computed(() => Boolean(sessionId.value))

  const successTitle = computed(() => '支付流程已返回')
  const successDescription = computed(() => {
    if (hasSessionId.value) {
      return '支付平台已经返回当前流程，但前端还没有通过后端接口确认订阅是否真正生效。'
    }
    return '支付平台已经返回当前流程，但当前地址未携带可展示的 session_id。'
  })

  const cancelTitle = computed(() => '您已离开支付流程')
  const cancelDescription = computed(() => '本次返回仅表示您离开了支付页，前端没有确认任何新的订阅状态。')

  const goToHome = () => {
    router.push('/accounting')
  }

  const goBack = () => {
    router.push('/checkout')
  }

  return {
    sessionId,
    hasSessionId,
    successTitle,
    successDescription,
    cancelTitle,
    cancelDescription,
    goToHome,
    goBack
  }
}
