<template>
  <div class="payment-result-container">
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <h1>{{ successTitle }}</h1>
        </div>
      </template>

      <div class="result-content">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <h2>支付页已完成返回</h2>
        <p class="description">{{ successDescription }}</p>

        <el-alert
          class="result-alert"
          type="warning"
          :closable="false"
          show-icon
          title="当前前端还没有调用后端完成最终订阅校验，因此这里不代表订阅一定已生效。"
        />

        <p v-if="hasSessionId" class="session-id">session_id: {{ sessionId }}</p>
        <p v-else class="session-id">当前没有可展示的 session_id。</p>

        <div class="action-buttons">
          <el-button @click="goBack">返回订阅页</el-button>
          <el-button type="primary" @click="goToHome">返回记账页</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { usePaymentResult } from '@/composables/usePaymentResult'
import '@/assets/styles/payment-result.css'

const {
  sessionId,
  hasSessionId,
  successTitle,
  successDescription,
  goToHome,
  goBack
} = usePaymentResult()
</script>
