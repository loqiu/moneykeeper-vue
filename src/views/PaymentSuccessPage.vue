<template>
  <div class="payment-result-container">
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <h1>支付成功</h1>
        </div>
      </template>
      
      <div class="result-content">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <h2>订阅成功！</h2>
        <p class="description">感谢您订阅我们的服务</p>
        <p class="session-id">订单号: {{ sessionId }}</p>
        
        <div class="action-buttons">
          <el-button type="primary" @click="goToHome">返回首页</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { usePaymentResult } from '@/composables/usePaymentResult'
import '@/assets/styles/payment-result.css'

const { sessionId, initSessionId, goToHome } = usePaymentResult()

onMounted(() => {
  initSessionId()
})
</script> 