<template>
  <el-row class="top-actions" justify="space-between" align="middle">
    <el-col :span="12">
      <router-link to="/checkout" class="subscription-link">
        <el-button type="primary" size="small" class="upgrade-button">
          <el-icon class="upgrade-icon"><Star /></el-icon>
          升级到专业版
        </el-button>
      </router-link>
    </el-col>
    <div class="user-actions" align="middle">
      <span class="welcome-text">欢迎，{{ username }}</span>
      <el-button 
        class="logout-button"
        size="small"
        @click="handleLogout"
        :loading="loading"
      >
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
  </el-row>
</template>

<script setup>
import { computed } from 'vue'
import { Star, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useLogin } from '@/composables/useLogin' 

const userStore = useUserStore()
const username = computed(() => userStore.username)
const { handleLogout, loading } = useLogin()

</script>

<style src="@/assets/styles/topNavBar.css" scoped></style> 