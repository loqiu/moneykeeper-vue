import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useStripeCheckout() {
  const loading = ref(false)

  // 订阅计划信息
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

  // 处理订阅
  const handleSubscribe = () => {
    loading.value = true
    try {
      console.log('当前环境:', process.env.NODE_ENV)
      console.log('支付链接:', process.env.VUE_APP_STRIPE_PAYMENT_URL)
      window.location.href = process.env.VUE_APP_STRIPE_PAYMENT_URL
    } catch (error) {
      console.error('跳转失败:', error)
      ElMessage.error('跳转失败，请稍后重试')
      loading.value = false
    }
  }

  return {
    loading,
    subscriptionPlan,
    handleSubscribe
  }
} 