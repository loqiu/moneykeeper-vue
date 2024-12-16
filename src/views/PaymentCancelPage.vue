<template>
  <div class="payment-result-container">
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <h1>支付取消</h1>
        </div>
      </template>
      
      <div class="result-content">
        <el-icon class="cancel-icon"><CircleCloseFilled /></el-icon>
        <h2>订阅已取消</h2>
        <p class="description">您已取消了订阅流程，如有任何问题请联系客服</p>
        
        <div class="action-buttons">
          <el-button @click="goBack">返回订阅页</el-button>
          <el-button type="primary" @click="goToHome">返回首页</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { usePaymentResult } from '@/composables/usePaymentResult'
import '@/assets/styles/payment-result.css'

const { goToHome, goBack } = usePaymentResult()
</script> 