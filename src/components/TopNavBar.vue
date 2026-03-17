<template>
  <div class="rounded-[32px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_55px_rgba(148,163,184,0.14)] backdrop-blur sm:p-5">
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
              MK
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{{ t('common.moneyKeeper') }}</p>
              <h2 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{{ t('topbar.workspaceTitle') }}</h2>
              <p class="mt-1 text-sm text-slate-500">{{ t('topbar.workspaceSubtitle') }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 lg:ml-4">
            <span class="rounded-full border px-3 py-1 text-xs font-medium" :class="connectionBadgeClass">
              <span class="mr-1 inline-block h-2 w-2 rounded-full" :class="connectionDotClass"></span>
              {{ connectionLabel }}
            </span>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {{ t('topbar.currentUser', { name: displayName }) }}
            </span>
            <div class="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-600">
              <button
                type="button"
                class="px-3 py-1.5 transition"
                :class="locale === 'zh-CN' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'"
                @click="setLocale('zh-CN')"
              >
                {{ t('common.localeZh') }}
              </button>
              <button
                type="button"
                class="border-l border-slate-200 px-3 py-1.5 transition"
                :class="locale === 'en-GB' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'"
                @click="setLocale('en-GB')"
              >
                {{ t('common.localeEn') }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <router-link to="/billing" class="no-underline">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 rounded-[28px] border border-amber-200 bg-gradient-to-r from-amber-100 via-orange-50 to-white px-5 py-3 text-left shadow-sm transition-transform hover:-translate-y-0.5 lg:min-w-[260px]"
            >
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ t('topbar.upgradeTitle') }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ t('topbar.upgradeDescription') }}</div>
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
                      {{ t('topbar.support') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="showUserAgreement" class="!rounded-xl">
                      <el-icon><Document /></el-icon>
                      {{ t('topbar.userAgreement') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="showPrivacyPolicy" class="!rounded-xl">
                      <el-icon><Lock /></el-icon>
                      {{ t('topbar.privacyPolicy') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteAccount" divided class="!rounded-xl !text-rose-300 hover:!text-rose-200">
                      <el-icon><Delete /></el-icon>
                      {{ t('topbar.deleteAccount') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <el-button
                circle
                class="!border-white/10 !bg-white/10 !text-white hover:!bg-white/15 hover:!text-rose-200"
                :loading="loading"
                :title="t('topbar.logout')"
                @click="handleLogout"
              >
                <el-icon><SwitchButton /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section class="rounded-[28px] border border-slate-200 bg-slate-50/85 p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{{ t('topbar.ledgerContextTitle') }}</p>
              <h3 class="mt-2 text-xl font-semibold text-slate-900">{{ ledgerTitle }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">{{ ledgerDescription }}</p>
            </div>

            <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <router-link
                to="/accounting"
                class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-slate-400 hover:bg-white"
              >
                {{ t('common.mainPage') }}
              </router-link>
              <router-link
                to="/ledgers"
                class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-slate-400 hover:bg-white"
              >
                {{ t('common.ledgerCenter') }}
              </router-link>
            </div>
          </div>
        </section>

        <nav class="rounded-[28px] border border-slate-200 bg-white px-4 py-4">
          <div class="flex flex-wrap gap-2">
            <router-link
              v-for="item in platformNavItems"
              :key="item.path"
              :to="item.path"
              class="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium no-underline transition"
              :class="isActive(item) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'"
            >
              <span>{{ t(item.labelKey) }}</span>
              <span class="text-xs opacity-70">{{ t(item.descriptionKey) }}</span>
              <span
                v-if="item.path === '/notifications' && unreadCount > 0"
                class="inline-flex min-w-[22px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                :class="isActive(item) ? 'bg-white/15 text-white' : 'bg-rose-500 text-white'"
              >
                {{ unreadCount }}
              </span>
            </router-link>
          </div>
        </nav>
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
        <h2 class="text-xl font-semibold text-slate-900">{{ t('topbar.userAgreement') }}</h2>
        <p class="text-sm text-slate-500">{{ t('topbar.agreementDescription') }}</p>
      </div>
    </template>

    <div class="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-700">
      {{ userAgreementText }}
    </div>

    <template #footer>
      <div class="flex justify-end">
        <el-button class="!rounded-full !px-5" @click="userAgreementVisible = false">{{ t('common.close') }}</el-button>
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
        <h2 class="text-xl font-semibold text-slate-900">{{ t('topbar.privacyPolicy') }}</h2>
        <p class="text-sm text-slate-500">{{ t('topbar.privacyDescription') }}</p>
      </div>
    </template>

    <div class="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-700">
      {{ privacyPolicyText }}
    </div>

    <template #footer>
      <div class="flex justify-end">
        <el-button class="!rounded-full !px-5" @click="privacyPolicyVisible = false">{{ t('common.close') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Delete, Document, Lock, Message, MoreFilled, Star, SwitchButton } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useLocaleStore } from '@/stores/locale'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { useLogin } from '@/composables/useLogin'
import { topNavBar } from '@/composables/topNavBar'
import { useLedgerStore } from '@/stores/ledger'
import { platformNavItems } from '@/constants/platformNav'

const route = useRoute()
const { t } = useI18n()
const userStore = useUserStore()
const ledgerStore = useLedgerStore()
const localeStore = useLocaleStore()
const notificationStore = useNotificationStore()
const { handleLogout, loading } = useLogin()
const { handleDeleteAccount } = topNavBar()
const { currentLedger, isLoading, errorMessage } = storeToRefs(ledgerStore)
const { unreadCount } = storeToRefs(notificationStore)
const { locale } = storeToRefs(localeStore)

const userAgreementVisible = ref(false)
const privacyPolicyVisible = ref(false)
const userAgreementText = ref('')
const privacyPolicyText = ref('')

const displayName = computed(() => userStore.username || t('common.currentUserFallback'))
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
      return t('topbar.connection.connected')
    case 'connecting':
      return t('topbar.connection.connecting')
    case 'reconnecting':
      return t('topbar.connection.reconnecting')
    case 'error':
      return t('topbar.connection.error')
    default:
      return t('topbar.connection.idle')
  }
})

const connectionDetail = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return t('topbar.connection.detailConnected')
    case 'connecting':
      return t('topbar.connection.detailConnecting')
    case 'reconnecting':
      return t('topbar.connection.detailReconnecting', { count: userStore.reconnectAttempts })
    case 'error':
      return t('topbar.connection.detailError')
    default:
      return t('topbar.connection.detailIdle')
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

const ledgerTitle = computed(() => {
  if (isLoading.value) {
    return t('common.loadingLedger')
  }

  return currentLedger.value?.name || t('common.ledgerContextReserved')
})

const ledgerDescription = computed(() => {
  if (errorMessage.value) {
    return errorMessage.value
  }

  if (currentLedger.value) {
    return t('topbar.ledgerDescriptionWithRole', {
      role: currentLedger.value.memberRole || t('common.memberRoleFallback')
    })
  }

  return t('topbar.ledgerDescription')
})

const isActive = (item) => {
  return route.path === item.path || route.path.startsWith(`${item.matchPrefix}/`)
}

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

const setLocale = (value) => {
  localeStore.setLocale(value)
}

onMounted(async () => {
  if (userStore.isLoggedIn && !ledgerStore.initialized) {
    await ledgerStore.initializeLedgers()
  }

  if (userStore.isLoggedIn && !notificationStore.initialized) {
    await notificationStore.initializeUnreadCount()
  }
})
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
