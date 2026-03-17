<template>
  <PlatformPageShell
    :eyebrow="t('platform.notifications.eyebrow')"
    :title="t('platform.notifications.title')"
    :description="t('platform.notifications.description')"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.notifications.summary.unreadLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ unreadCount }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.notifications.summary.unreadHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.notifications.summary.loadedLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ notifications.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.notifications.summary.loadedHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.notifications.summary.streamLabel') }}</p>
          <p class="mt-2 text-lg font-semibold">{{ connectionLabel }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.notifications.summary.streamHint') }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.notifications.list.title') }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ t('platform.notifications.list.description') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadNotifications">
              {{ t('common.refresh') }}
            </el-button>
            <el-button class="!rounded-full !px-4" :disabled="!filteredUnreadCount" @click="handleMarkAllAsRead">
              {{ t('platform.notifications.actions.markFilteredRead') }}
            </el-button>
          </div>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto]">
          <el-select
            v-model="filters.type"
            clearable
            class="w-full"
            :placeholder="t('platform.notifications.filters.allTypes')"
          >
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <div class="flex h-[42px] items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4">
            <span class="text-sm text-slate-700">{{ t('platform.notifications.filters.unreadOnly') }}</span>
            <el-switch v-model="filters.unreadOnly" />
          </div>

          <el-select v-model="filters.limit" class="w-full" :placeholder="t('platform.notifications.filters.limitLabel')">
            <el-option
              v-for="option in limitOptions"
              :key="option"
              :label="t('platform.notifications.filters.limitOption', { count: option })"
              :value="option"
            />
          </el-select>
        </div>
      </section>

      <PlatformStateCard
        v-if="errorMessage"
        variant="error"
        compact
        :centered="false"
        :title="t('platform.notifications.states.errorTitle')"
        :description="errorMessage"
        :action-label="t('common.refresh')"
        @action="loadNotifications"
      />

      <PlatformStateCard
        v-if="!userStore.isConnected"
        variant="warning"
        compact
        :centered="false"
        :title="t('platform.notifications.states.streamUnavailableTitle')"
        :description="connectionHint"
      >
        <template #actions>
          <el-button class="!rounded-full !px-4" @click="loadNotifications">{{ t('common.refresh') }}</el-button>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-if="isLoading"
        variant="loading"
        :title="t('platform.notifications.states.loadingTitle')"
        :description="t('platform.notifications.states.loadingDescription')"
      />

      <PlatformStateCard
        v-else-if="!notifications.length"
        variant="empty"
        :title="t('platform.notifications.states.emptyTitle')"
        :description="t('platform.notifications.states.emptyDescription')"
      />

      <section v-else class="space-y-4">
        <article
          v-for="notification in notifications"
          :key="notification.id"
          class="rounded-[28px] border p-5 shadow-sm transition"
          :class="notification.read ? 'border-slate-200 bg-white' : typeCardClass(notification.type)"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="typeBadgeClass(notification.type)">
                  {{ typeLabelMap[notification.type] || notification.type }}
                </span>
                <span
                  class="rounded-full px-3 py-1 text-xs font-medium"
                  :class="notification.read ? 'bg-slate-100 text-slate-500' : 'bg-slate-900 text-white'"
                >
                  {{ notification.read ? t('platform.notifications.status.read') : t('platform.notifications.status.unread') }}
                </span>
                <span class="text-xs text-slate-400">{{ formatDateTime(notification.createdAt) }}</span>
              </div>

              <h3 class="mt-3 text-lg font-semibold text-slate-900">{{ notification.title }}</h3>
              <p class="mt-2 text-sm leading-7 text-slate-600">{{ notification.message }}</p>
            </div>

            <div class="flex shrink-0 flex-wrap gap-3">
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                {{ notification.channel }}
              </span>
              <el-button
                v-if="!notification.read && typeof notification.id === 'number'"
                class="!rounded-full !px-4"
                @click="handleMarkAsRead(notification)"
              >
                {{ t('platform.notifications.actions.markRead') }}
              </el-button>
            </div>
          </div>
        </article>
      </section>
    </div>
  </PlatformPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import { getApiErrorMessage } from '@/api/response'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'

const { t, locale } = useI18n()
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const { items, unreadCount, isLoading, errorMessage } = storeToRefs(notificationStore)

const filters = reactive({
  type: '',
  unreadOnly: false,
  limit: 20
})

const limitOptions = [20, 50, 100]

const typeOptions = computed(() => ([
  { label: t('platform.notifications.types.success'), value: 'success' },
  { label: t('platform.notifications.types.warning'), value: 'warning' },
  { label: t('platform.notifications.types.info'), value: 'info' },
  { label: t('platform.notifications.types.error'), value: 'error' }
]))

const typeLabelMap = computed(() => ({
  success: t('platform.notifications.types.success'),
  warning: t('platform.notifications.types.warning'),
  info: t('platform.notifications.types.info'),
  error: t('platform.notifications.types.error')
}))

const notifications = computed(() => items.value)
const filteredUnreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

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

const connectionLabel = computed(() => t(`topbar.connection.${connectionState.value}`))

const connectionHint = computed(() => {
  switch (connectionState.value) {
    case 'reconnecting':
      return t('platform.notifications.connection.reconnecting')
    case 'connecting':
      return t('platform.notifications.connection.connecting')
    case 'error':
      return t('platform.notifications.connection.error')
    default:
      return t('platform.notifications.connection.idle')
  }
})

const buildQuery = () => {
  const query = {
    limit: filters.limit
  }

  if (filters.type) {
    query.type = filters.type
  }

  if (filters.unreadOnly) {
    query.unreadOnly = true
  }

  return query
}

const loadNotifications = async () => {
  try {
    await notificationStore.fetchNotifications(buildQuery())
    await notificationStore.refreshUnreadCount()
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.notifications.errors.fetchFailed')))
  }
}

const handleMarkAsRead = async (notification) => {
  try {
    await notificationStore.markAsRead(notification.id)
    ElMessage.success(t('platform.notifications.messages.markedRead'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.notifications.errors.markReadFailed')))
  }
}

const handleMarkAllAsRead = async () => {
  try {
    if (!filteredUnreadCount.value) {
      ElMessage.info(t('platform.notifications.messages.noUnread'))
      return
    }

    await notificationStore.markAllAsRead(filters.type || undefined)
    ElMessage.success(t('platform.notifications.messages.markedFilteredRead'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.notifications.errors.markAllReadFailed')))
  }
}

const formatDateTime = (value) => {
  if (!value) {
    return t('platform.notifications.messages.justNow')
  }

  return new Intl.DateTimeFormat(locale.value, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(value))
}

const typeBadgeClass = (type) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700'
    case 'warning':
      return 'bg-amber-50 text-amber-700'
    case 'error':
      return 'bg-rose-50 text-rose-700'
    default:
      return 'bg-sky-50 text-sky-700'
  }
}

const typeCardClass = (type) => {
  switch (type) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50/50'
    case 'warning':
      return 'border-amber-200 bg-amber-50/55'
    case 'error':
      return 'border-rose-200 bg-rose-50/55'
    default:
      return 'border-sky-200 bg-sky-50/45'
  }
}

watch(
  () => [filters.type, filters.unreadOnly, filters.limit],
  async () => {
    await loadNotifications()
  }
)

onMounted(async () => {
  await notificationStore.initializeUnreadCount()
  await loadNotifications()
})
</script>

<style scoped>
:deep(.el-select__wrapper) {
  border-radius: 18px;
  min-height: 42px;
}
</style>
