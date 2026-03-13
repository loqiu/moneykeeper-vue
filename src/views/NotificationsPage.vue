<template>
  <PlatformPageShell
    eyebrow="Notification Center"
    title="通知中心"
    description="通知开始从顶部即时提醒升级成可筛选、可回溯、可管理的历史中心。预算预警、导出结果和系统消息都会在这里汇总。"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Unread</p>
          <p class="mt-2 text-3xl font-semibold">{{ unreadCount }}</p>
          <p class="mt-2 text-xs text-slate-300">当前未读通知</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Loaded</p>
          <p class="mt-2 text-3xl font-semibold">{{ notifications.length }}</p>
          <p class="mt-2 text-xs text-slate-300">本次列表已加载数量</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Stream</p>
          <p class="mt-2 text-lg font-semibold">{{ connectionLabel }}</p>
          <p class="mt-2 text-xs text-slate-300">顶部状态与通知中心同步</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">我的通知</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              SSE 负责实时回流，通知日志负责历史列表与未读状态。筛选条件会同时影响“全部已读”的作用范围。
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadNotifications">刷新列表</el-button>
            <el-button class="!rounded-full !px-4" :disabled="!filteredUnreadCount" @click="handleMarkAllAsRead">
              标记当前筛选为已读
            </el-button>
          </div>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto]">
          <el-select v-model="filters.type" clearable class="w-full" placeholder="全部类型">
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <div class="flex h-[42px] items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4">
            <span class="text-sm text-slate-700">只看未读</span>
            <el-switch v-model="filters.unreadOnly" />
          </div>

          <el-select v-model="filters.limit" class="w-full" placeholder="加载数量">
            <el-option
              v-for="option in limitOptions"
              :key="option"
              :label="`${option} 条`"
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
        title="通知列表加载失败"
        :description="errorMessage"
        action-label="重试"
        @action="loadNotifications"
      />

      <PlatformStateCard
        v-if="!userStore.isConnected"
        variant="warning"
        compact
        :centered="false"
        title="实时通知当前不可用"
        :description="connectionHint"
      >
        <template #actions>
          <el-button class="!rounded-full !px-4" @click="loadNotifications">刷新列表</el-button>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-if="isLoading"
        variant="loading"
        title="正在加载通知列表..."
        description="会同时刷新当前筛选下的通知列表和未读数。"
      />

      <PlatformStateCard
        v-else-if="!notifications.length"
        variant="empty"
        title="当前没有匹配的通知"
        description="预算预警、导出完成和系统消息后续都会沉淀到这里。"
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
                  {{ notification.read ? '已读' : '未读' }}
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
                标记已读
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
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import { getApiErrorMessage } from '@/api/response'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const { items, unreadCount, isLoading, errorMessage } = storeToRefs(notificationStore)

const filters = reactive({
  type: '',
  unreadOnly: false,
  limit: 20
})

const limitOptions = [20, 50, 100]

const typeOptions = [
  { label: '成功', value: 'success' },
  { label: '提醒', value: 'warning' },
  { label: '信息', value: 'info' },
  { label: '错误', value: 'error' }
]

const typeLabelMap = {
  success: '成功',
  warning: '提醒',
  info: '信息',
  error: '错误'
}

const notifications = computed(() => items.value)
const filteredUnreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

const connectionLabel = computed(() => {
  if (userStore.isConnected) {
    return '实时通知正常'
  }

  if (userStore.isConnecting && userStore.reconnectAttempts > 0) {
    return '正在重新连接'
  }

  if (userStore.isConnecting) {
    return '正在连接通知'
  }

  if (userStore.reconnectAttempts > 0) {
    return '通知连接异常'
  }

  return '通知未连接'
})
const connectionHint = computed(() => {
  if (userStore.isConnecting && userStore.reconnectAttempts > 0) {
    return '通知流正在重连中。历史列表仍然可用，但新的实时消息可能会稍有延迟。'
  }

  if (userStore.isConnecting) {
    return '通知流正在建立连接。若列表正常加载，可稍等几秒让实时消息恢复。'
  }

  if (userStore.reconnectAttempts > 0) {
    return '通知流当前未连上，建议稍后刷新页面或检查网络。历史通知不会丢失。'
  }

  return '通知流尚未连接，当前页面仍可查看历史通知。'
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
    ElMessage.error(getApiErrorMessage(error, '获取通知列表失败'))
  }
}

const handleMarkAsRead = async (notification) => {
  try {
    await notificationStore.markAsRead(notification.id)
    ElMessage.success('通知已标记为已读')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '标记通知失败'))
  }
}

const handleMarkAllAsRead = async () => {
  try {
    const unreadBeforeUpdate = filteredUnreadCount.value
    if (!unreadBeforeUpdate) {
      ElMessage.info('当前筛选下没有未读通知')
      return
    }

    await notificationStore.markAllAsRead(filters.type || undefined)
    ElMessage.success('已更新当前筛选通知状态')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '批量标记已读失败'))
  }
}

const formatDateTime = (value) => {
  if (!value) {
    return '刚刚'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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
