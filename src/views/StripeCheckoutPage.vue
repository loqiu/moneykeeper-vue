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
          <span class="currency">UK£</span>
          <span class="amount">{{ subscriptionPlan.price }}</span>
          <span class="period">/月</span>
        </div>
        
        <div class="features">
          <h3>包含功能：</h3>
          <ul>
            <li v-for="(feature, index) in subscriptionPlan.features" :key="index">
              <el-icon><CheckIcon /></el-icon>
              {{ feature }}
            </li>
          </ul>
        </div>
        
        <el-button 
          type="primary" 
          class="subscribe-button" 
          :loading="loading"
          @click="handleSubscribe"
        >
          立即订阅
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useStripeCheckout } from '@/composables/useStripeCheckout'
import '@/assets/styles/stripe-checkout.css'

const { loading, subscriptionPlan, handleSubscribe } = useStripeCheckout()
</script> 