<template>
  <div class="payment-result-container">
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <h1>{{ cancelTitle }}</h1>
        </div>
      </template>

      <div class="result-content">
        <el-icon class="cancel-icon"><CircleCloseFilled /></el-icon>
        <h2>支付流程未完成</h2>
        <p class="description">{{ cancelDescription }}</p>

        <el-alert
          class="result-alert"
          type="info"
          :closable="false"
          show-icon
          title="如果后端后续接入真实支付会话，这个页面仍然只表示流程返回，不直接代表业务状态。"
        />

        <div class="action-buttons">
          <el-button @click="goBack">返回订阅页</el-button>
          <el-button type="primary" @click="goToHome">返回记账页</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { usePaymentResult } from '@/composables/usePaymentResult'
import '@/assets/styles/payment-result.css'

const {
  cancelTitle,
  cancelDescription,
  goToHome,
  goBack
} = usePaymentResult()
</script>
