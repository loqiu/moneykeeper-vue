<template>
  <div class="rounded-[32px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_55px_rgba(148,163,184,0.14)] backdrop-blur sm:p-5">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
            MK
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">MoneyKeeper</p>
            <h2 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">账户中心</h2>
            <p class="mt-1 text-sm text-slate-500">升级、支持与账户设置都收在这里。</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 lg:ml-4">
          <span class="rounded-full border px-3 py-1 text-xs font-medium" :class="connectionBadgeClass">
            <span class="mr-1 inline-block h-2 w-2 rounded-full" :class="connectionDotClass"></span>
            {{ connectionLabel }}
          </span>
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            当前用户：{{ displayName }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <router-link to="/billing" class="no-underline">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 rounded-[28px] border border-amber-200 bg-gradient-to-r from-amber-100 via-orange-50 to-white px-5 py-3 text-left shadow-sm transition-transform hover:-translate-y-0.5 lg:min-w-[260px]"
          >
            <div>
              <div class="text-sm font-semibold text-slate-900">升级到专业版</div>
              <div class="mt-1 text-xs text-slate-500">查看支付状态并解锁后续能力。</div>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-900">
              <el-icon :size="20"><Star /></el-icon>
            </div>
          </button>
        </router-link>

        <div class="flex items-center justify-between gap-3 rounded-[28px] border border-slate-200 bg-slate-900 px-4 py-3 text-white shadow-sm sm:justify-start">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white backdrop-blur">
              {{ userInitial }}
            </div>
            <div>
              <div class="text-sm font-semibold text-white">{{ displayName }}</div>
              <div class="mt-1 text-xs text-slate-300">{{ connectionDetail }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <el-dropdown trigger="click" class="user-dropdown" popper-class="topbar-menu">
              <el-button circle class="!border-white/10 !bg-white/10 !text-white hover:!bg-white/15">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu class="!rounded-2xl !p-2">
                  <el-dropdown-item @click="handleSupport" class="!rounded-xl">
                    <el-icon><Message /></el-icon>
                    联系支持
                  </el-dropdown-item>
                  <el-dropdown-item @click="showUserAgreement" class="!rounded-xl">
                    <el-icon><Document /></el-icon>
                    用户协议
                  </el-dropdown-item>
                  <el-dropdown-item @click="showPrivacyPolicy" class="!rounded-xl">
                    <el-icon><Lock /></el-icon>
                    隐私政策
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDeleteAccount" divided class="!rounded-xl !text-rose-300 hover:!text-rose-200">
                    <el-icon><Delete /></el-icon>
                    删除账号
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button
              circle
              class="!border-white/10 !bg-white/10 !text-white hover:!bg-white/15 hover:!text-rose-200"
              :loading="loading"
              title="退出登录"
              @click="handleLogout"
            >
              <el-icon><SwitchButton /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-dialog
    v-model="userAgreementVisible"
    width="720px"
    :close-on-click-modal="false"
    destroy-on-close
    class="policy-dialog"
  >
    <template #header>
      <div class="space-y-2 pr-8">
        <h2 class="text-xl font-semibold text-slate-900">用户协议</h2>
        <p class="text-sm text-slate-500">使用前请确认你已阅读并理解以下条款内容。</p>
      </div>
    </template>

    <div class="max-h-[60vh] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
      {{ userAgreementText }}
    </div>

    <template #footer>
      <div class="flex justify-end">
        <el-button class="!rounded-full !px-5" @click="userAgreementVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="privacyPolicyVisible"
    width="720px"
    :close-on-click-modal="false"
    destroy-on-close
    class="policy-dialog"
  >
    <template #header>
      <div class="space-y-2 pr-8">
        <h2 class="text-xl font-semibold text-slate-900">隐私政策</h2>
        <p class="text-sm text-slate-500">以下内容说明了应用如何处理和保护你的数据。</p>
      </div>
    </template>

    <div class="max-h-[60vh] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
      {{ privacyPolicyText }}
    </div>

    <template #footer>
      <div class="flex justify-end">
        <el-button class="!rounded-full !px-5" @click="privacyPolicyVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Delete, Document, Lock, Message, MoreFilled, Star, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useLogin } from '@/composables/useLogin'
import { topNavBar } from '@/composables/topNavBar'

const userStore = useUserStore()
const { handleLogout, loading } = useLogin()
const { handleDeleteAccount } = topNavBar()

const userAgreementVisible = ref(false)
const privacyPolicyVisible = ref(false)
const userAgreementText = ref('')
const privacyPolicyText = ref('')

const displayName = computed(() => userStore.username || '当前用户')
const userInitial = computed(() => displayName.value.trim().slice(0, 1).toUpperCase())

const connectionState = computed(() => {
  if (userStore.isConnected) {
    return 'connected'
  }

  if (userStore.isConnecting && userStore.reconnectAttempts > 0) {
    return 'reconnecting'
  }

  if (userStore.isConnecting) {
    return 'connecting'
  }

  if (userStore.reconnectAttempts > 0) {
    return 'error'
  }

  return 'idle'
})

const connectionLabel = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return '实时通知正常'
    case 'connecting':
      return '正在连接通知'
    case 'reconnecting':
      return '正在重新连接'
    case 'error':
      return '通知连接异常'
    default:
      return '通知未连接'
  }
})

const connectionDetail = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return '通知与状态更新已开启'
    case 'connecting':
      return '正在建立实时通知连接'
    case 'reconnecting':
      return `正在尝试恢复实时通知（第 ${userStore.reconnectAttempts} 次）`
    case 'error':
      return '当前未连上实时通知，可稍后刷新页面重试'
    default:
      return '当前尚未建立实时通知连接'
  }
})

const connectionBadgeClass = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'connecting':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'reconnecting':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'error':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
})

const connectionDotClass = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return 'bg-emerald-500'
    case 'connecting':
      return 'bg-sky-500'
    case 'reconnecting':
      return 'bg-amber-500'
    case 'error':
      return 'bg-rose-500'
    default:
      return 'bg-slate-400'
  }
})

const loadLegalTexts = async () => {
  if (userAgreementText.value && privacyPolicyText.value) {
    return
  }

  const module = await import('@/constants/legalTexts')
  userAgreementText.value = module.userAgreementText
  privacyPolicyText.value = module.privacyPolicyText
}

const showUserAgreement = async () => {
  await loadLegalTexts()
  userAgreementVisible.value = true
}

const showPrivacyPolicy = async () => {
  await loadLegalTexts()
  privacyPolicyVisible.value = true
}

const handleSupport = () => {
  window.location.href = 'mailto:rochelle.wang1116@gmail.com'
}
</script>

<style scoped>
button {
  outline: none;
}

:deep(.topbar-menu.el-popper) {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.96);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(16px);
}

:deep(.topbar-menu .el-popper__arrow::before) {
  background: rgba(15, 23, 42, 0.96);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.topbar-menu .el-dropdown-menu) {
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 8px;
}

:deep(.topbar-menu .el-dropdown-menu__item) {
  min-width: 180px;
  border-radius: 16px;
  color: #e2e8f0;
}

:deep(.topbar-menu .el-dropdown-menu__item:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

:deep(.topbar-menu .el-dropdown-menu__item.is-divided) {
  border-top-color: rgba(255, 255, 255, 0.08);
}

:deep(.topbar-menu .el-dropdown-menu__item .el-icon) {
  color: inherit;
}

:deep(.policy-dialog .el-dialog) {
  border-radius: 28px;
}
</style>