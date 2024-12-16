import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function usePaymentResult() {
  const router = useRouter()
  const route = useRoute()
  const sessionId = ref('')

  const initSessionId = () => {
    sessionId.value = route.query.session_id || ''
  }

  const goToHome = () => {
    router.push('/accounting')
  }

  const goBack = () => {
    router.push('/checkout')
  }

  return {
    sessionId,
    initSessionId,
    goToHome,
    goBack
  }
} 