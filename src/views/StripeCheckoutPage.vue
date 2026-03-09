<template>
  <div class="stripe-checkout-container">
    <el-card class="checkout-card">
      <template #header>
        <div class="card-header">
          <h1>订阅服务</h1>
        </div>
      </template>

      <div class="subscription-details">
        <h2>{{ subscriptionPlan.name }}</h2>
        <div class="price-section">
          <span class="currency">£</span>
          <span class="amount">{{ subscriptionPlan.price }}</span>
          <span class="period">/月</span>
        </div>

        <div class="status-row">
          <el-tag :type="statusTagType" effect="dark">{{ statusText }}</el-tag>
          <el-button link :loading="statusLoading" @click="fetchPaymentStatus">
            重新检查
          </el-button>
        </div>

        <el-alert
          class="status-alert"
          type="info"
          :closable="false"
          show-icon
          :title="helperText"
        />

        <div class="status-meta">
          <span>Provider: {{ paymentStatus.provider }}</span>
          <span>Currency: {{ paymentStatus.defaultCurrency.toUpperCase() }}</span>
        </div>

        <div class="features">
          <h3>包含功能</h3>
          <ul>
            <li v-for="(feature, index) in subscriptionPlan.features" :key="index">
              <el-icon><Check /></el-icon>
              {{ feature }}
            </li>
          </ul>
        </div>

        <el-button
          type="primary"
          class="subscribe-button"
          :loading="loading"
          :disabled="!canOpenHostedCheckout"
          @click="handleSubscribe"
        >
          {{ actionText }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue'
import { useStripeCheckout } from '@/composables/useStripeCheckout'
import '@/assets/styles/stripe-checkout.css'

const {
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
} = useStripeCheckout()
</script>
