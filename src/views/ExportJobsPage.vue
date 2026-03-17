<template>
  <PlatformPageShell
    :eyebrow="t('platform.exports.eyebrow')"
    :title="t('platform.exports.title')"
    :description="t('platform.exports.description')"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.exports.summary.jobsLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ jobs.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.exports.summary.jobsHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.exports.summary.activeLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ activeJobCount }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.exports.summary.activeHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.exports.summary.completedLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ completedJobCount }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.exports.summary.completedHint') }}</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.exports.create.title') }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ t('platform.exports.create.description') }}
          </p>
        </div>

        <div
          v-if="hasLedgerContext && !canManageCrossMemberExports"
          class="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600"
        >
          {{ t('platform.exports.create.permissionHint') }}
        </div>

        <el-form class="mt-5 space-y-4" label-position="top" @submit.prevent>
          <el-form-item :label="t('platform.exports.create.typeLabel')">
            <el-select v-model="form.type" clearable class="w-full" :placeholder="t('platform.exports.create.allTypes')">
              <el-option
                v-for="option in typeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="t('platform.exports.create.targetMemberLabel')">
            <el-select
              v-model="form.userId"
              clearable
              class="w-full"
              :disabled="!canManageCrossMemberExports"
              :placeholder="t('platform.exports.create.targetMemberPlaceholder')"
            >
              <el-option
                v-for="member in memberOptions"
                :key="member.value"
                :label="member.label"
                :value="member.value"
              />
            </el-select>
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item :label="t('platform.exports.create.startDateLabel')">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="!w-full"
                :placeholder="t('platform.exports.create.dateOptional')"
              />
            </el-form-item>

            <el-form-item :label="t('platform.exports.create.endDateLabel')">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="!w-full"
                :placeholder="t('platform.exports.create.dateOptional')"
              />
            </el-form-item>
          </div>

          <el-button
            type="primary"
            class="!mt-2 !w-full !rounded-full !border-0 !bg-slate-900 !py-6 hover:!bg-slate-800 disabled:!bg-slate-300"
            :disabled="!hasLedgerContext"
            :loading="isSubmitting"
            @click="handleCreateExportJob"
          >
            {{ t('platform.exports.create.submit') }}
          </el-button>
        </el-form>
      </article>
    </template>

    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ currentLedgerName }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ t('platform.exports.workspace.description') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadJobs">{{ t('platform.exports.workspace.refresh') }}</el-button>
            <router-link
              to="/notifications"
              class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-slate-400 hover:bg-white"
            >
              {{ t('platform.exports.workspace.openNotifications') }}
            </router-link>
          </div>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,220px)_auto]">
          <el-select v-model="filters.limit" class="w-full" :placeholder="t('platform.exports.workspace.limitPlaceholder')">
            <el-option
              v-for="option in limitOptions"
              :key="option"
              :label="t('platform.exports.workspace.limitOption', { count: option })"
              :value="option"
            />
          </el-select>

          <div class="flex h-[42px] items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4">
            <span class="text-sm text-slate-700">{{ t('platform.exports.workspace.pollingLabel') }}</span>
            <el-switch v-model="autoRefreshEnabled" />
          </div>
        </div>

        <p class="mt-4 text-sm text-slate-500">
          {{ t('platform.exports.workspace.pollingStatus', { status: pollingStatusLabel }) }}
        </p>
      </section>

      <PlatformStateCard
        v-if="errorMessage"
        variant="error"
        compact
        :centered="false"
        :title="t('platform.exports.states.errorTitle')"
        :description="errorMessage"
        :action-label="t('common.refresh')"
        @action="loadJobs"
      />

      <PlatformStateCard
        v-else-if="!hasLedgerContext"
        variant="warning"
        :title="t('platform.exports.states.ledgerRequiredTitle')"
        :description="t('platform.exports.states.ledgerRequiredDescription')"
      >
        <template #actions>
          <router-link
            to="/ledgers"
            class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-slate-400 hover:bg-slate-50"
          >
            {{ t('platform.exports.states.ledgerRequiredAction') }}
          </router-link>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-else-if="isLoading"
        variant="loading"
        :title="t('platform.exports.states.loadingTitle')"
        :description="t('platform.exports.states.loadingDescription')"
      />

      <PlatformStateCard
        v-else-if="!jobs.length"
        variant="empty"
        :title="t('platform.exports.states.emptyTitle')"
        :description="t('platform.exports.states.emptyDescription')"
      />

      <section v-else class="space-y-4">
        <article
          v-for="job in jobs"
          :key="job.id"
          class="rounded-[28px] border p-5 shadow-sm transition"
          :class="jobCardClass(job.status)"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="jobStatusBadgeClass(job.status)">
                  {{ jobStatusLabel(job.status) }}
                </span>
                <span v-if="job.recordType" class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  {{ job.recordType === 'expense' ? t('common.expense') : t('common.income') }}
                </span>
                <span class="text-xs text-slate-400">{{ t('platform.exports.jobs.createdAt', { value: formatDateTime(job.createdAt) }) }}</span>
              </div>

              <h3 class="mt-3 text-lg font-semibold text-slate-900">{{ job.fileName || t('platform.exports.jobs.fallbackName', { id: job.id }) }}</h3>

              <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                <span>{{ t('platform.exports.jobs.jobId', { id: job.id }) }}</span>
                <span>{{ t('platform.exports.jobs.requestedBy', { value: job.requestedByUserId || '-' }) }}</span>
                <span>{{ t('platform.exports.jobs.targetMember', { value: targetMemberLabel(job.targetUserId) }) }}</span>
                <span>{{ t('platform.exports.jobs.recordCount', { count: job.recordCount }) }}</span>
                <span>{{ t('platform.exports.jobs.downloadCount', { count: job.downloadCount }) }}</span>
              </div>

              <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                <span>{{ t('platform.exports.jobs.startDate', { value: job.startDate || t('platform.exports.jobs.unlimited') }) }}</span>
                <span>{{ t('platform.exports.jobs.endDate', { value: job.endDate || t('platform.exports.jobs.unlimited') }) }}</span>
                <span>{{ t('platform.exports.jobs.startedAt', { value: formatDateTime(job.startedAt, t('platform.exports.jobs.notStarted')) }) }}</span>
                <span>{{ t('platform.exports.jobs.completedAt', { value: formatDateTime(job.completedAt, t('platform.exports.jobs.notCompleted')) }) }}</span>
              </div>

              <p v-if="job.errorMessage" class="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                {{ job.errorMessage }}
              </p>
            </div>

            <div class="flex shrink-0 flex-wrap gap-3">
              <el-button
                class="!rounded-full !px-4"
                :loading="downloadingJobId === job.id"
                :disabled="job.status !== 'completed'"
                @click="handleDownloadJob(job)"
              >
                {{ t('platform.exports.jobs.download') }}
              </el-button>

              <el-button
                v-if="job.status === 'pending' || job.status === 'running'"
                class="!rounded-full !px-4"
                @click="handleRefreshJob(job)"
              >
                {{ t('platform.exports.jobs.refreshStatus') }}
              </el-button>
            </div>
          </div>
        </article>
      </section>
    </div>
  </PlatformPageShell>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import {
  createLedgerExportJob,
  downloadLedgerExportJob,
  fetchLedgerExportJob,
  fetchLedgerExportJobs
} from '@/api/modules/exportJobs'
import { fetchLedgerMembers } from '@/api/modules/ledgers'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'
import { useNotificationStore } from '@/stores/notification'

const { t, locale } = useI18n()

const POLL_INTERVAL = 5000

const ledgerStore = useLedgerStore()
const notificationStore = useNotificationStore()
const { currentLedgerId, currentLedger } = storeToRefs(ledgerStore)

const isLoading = ref(false)
const isSubmitting = ref(false)
const downloadingJobId = ref(null)
const isPolling = ref(false)
const errorMessage = ref('')
const jobs = ref([])
const autoRefreshEnabled = ref(true)
const pollTimer = ref(null)
const memberOptions = ref([])

const filters = reactive({
  limit: 20
})

const form = reactive({
  userId: null,
  type: '',
  startDate: '',
  endDate: ''
})

const limitOptions = [20, 50, 100]

const typeOptions = computed(() => [
  { label: t('common.expense'), value: 'expense' },
  { label: t('common.income'), value: 'income' }
])

const hasLedgerContext = computed(() => Boolean(currentLedgerId.value))
const currentLedgerName = computed(() => currentLedger.value?.name || t('platform.exports.messages.ledgerFallback'))
const canManageCrossMemberExports = computed(() => ['owner', 'admin'].includes(currentLedger.value?.memberRole || ''))
const activeJobCount = computed(() => jobs.value.filter((job) => ['pending', 'running'].includes(job.status)).length)
const completedJobCount = computed(() => jobs.value.filter((job) => job.status === 'completed').length)
const pollingStatusLabel = computed(() => {
  if (!hasLedgerContext.value) {
    return t('platform.exports.messages.ledgerFallback')
  }

  if (!autoRefreshEnabled.value) {
    return t('platform.exports.messages.pollingOff')
  }

  if (activeJobCount.value === 0) {
    return t('platform.exports.messages.noActiveJobs')
  }

  return isPolling.value ? t('platform.exports.messages.pollingActive') : t('platform.exports.messages.pollingReady')
})

const buildQuery = () => ({ limit: filters.limit })

const stopPolling = () => {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
  isPolling.value = false
}

const maybeStartPolling = () => {
  const hasActiveJobs = jobs.value.some((job) => ['pending', 'running'].includes(job.status))
  if (!autoRefreshEnabled.value || !hasActiveJobs || !hasLedgerContext.value) {
    stopPolling()
    return
  }

  if (pollTimer.value) {
    return
  }

  pollTimer.value = setInterval(() => {
    if (isPolling.value) {
      return
    }
    loadJobs({ silent: true })
  }, POLL_INTERVAL)
}

const saveBlobAsFile = (blob, fileName) => {
  const link = document.createElement('a')
  const blobUrl = window.URL.createObjectURL(blob)
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(blobUrl)
}

const resetForm = () => {
  form.userId = null
  form.type = ''
  form.startDate = ''
  form.endDate = ''
}

const loadMembers = async () => {
  if (!currentLedgerId.value) {
    memberOptions.value = []
    return
  }

  const members = await fetchLedgerMembers(currentLedgerId.value)
  memberOptions.value = members.map((member) => ({
    value: Number(member.userId),
    label: member.email ? `${member.username || t('platform.search.filters.memberFallback', { id: member.userId })} (${member.email})` : (member.username || t('platform.search.filters.memberFallback', { id: member.userId }))
  }))
}

const loadJobs = async ({ silent = false } = {}) => {
  if (!currentLedgerId.value) {
    jobs.value = []
    stopPolling()
    return
  }

  if (!silent) {
    isLoading.value = true
  }
  if (silent) {
    isPolling.value = true
  }
  errorMessage.value = ''

  try {
    jobs.value = await fetchLedgerExportJobs(currentLedgerId.value, buildQuery())
    maybeStartPolling()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('platform.exports.errors.fetchFailed'))
    stopPolling()
  } finally {
    if (!silent) {
      isLoading.value = false
    }
    if (silent) {
      isPolling.value = false
    }
  }
}

const handleCreateExportJob = async () => {
  if (!hasLedgerContext.value) {
    ElMessage.warning(t('platform.exports.messages.ledgerRequired'))
    return
  }

  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    ElMessage.warning(t('platform.exports.messages.invalidDateRange'))
    return
  }

  if (form.userId && !canManageCrossMemberExports.value) {
    ElMessage.warning(t('platform.exports.messages.crossMemberForbidden'))
    return
  }

  isSubmitting.value = true
  try {
    await createLedgerExportJob(currentLedgerId.value, form)
    resetForm()
    await Promise.all([loadJobs(), notificationStore.refreshUnreadCount()])
    ElMessage.success(t('platform.exports.messages.created'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.exports.errors.createFailed')))
  } finally {
    isSubmitting.value = false
  }
}

const handleRefreshJob = async (job) => {
  try {
    const updatedJob = await fetchLedgerExportJob(currentLedgerId.value, job.id)
    jobs.value = jobs.value.map((item) => (item.id === job.id ? updatedJob : item))
    maybeStartPolling()
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.exports.errors.refreshFailed')))
  }
}

const handleDownloadJob = async (job) => {
  downloadingJobId.value = job.id

  try {
    const { blob, filename } = await downloadLedgerExportJob(currentLedgerId.value, job.id)
    saveBlobAsFile(blob, filename || job.fileName || `ledger-export-${job.id}.xlsx`)
    await loadJobs({ silent: true })
    ElMessage.success(t('platform.exports.messages.downloadStarted'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.exports.errors.downloadFailed')))
  } finally {
    downloadingJobId.value = null
  }
}

const jobStatusLabel = (status) => t(`platform.exports.jobs.status.${status}`, status)

const jobStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-slate-100 text-slate-700'
    case 'running':
      return 'bg-sky-50 text-sky-700'
    case 'completed':
      return 'bg-emerald-50 text-emerald-700'
    case 'failed':
      return 'bg-rose-50 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

const jobCardClass = (status) => {
  switch (status) {
    case 'pending':
      return 'border-slate-200 bg-white'
    case 'running':
      return 'border-sky-200 bg-sky-50/50'
    case 'completed':
      return 'border-emerald-200 bg-emerald-50/40'
    case 'failed':
      return 'border-rose-200 bg-rose-50/40'
    default:
      return 'border-slate-200 bg-white'
  }
}

const targetMemberLabel = (userId) => {
  if (!userId) {
    return t('platform.exports.jobs.currentUser')
  }
  return memberOptions.value.find((member) => member.value === Number(userId))?.label || `#${userId}`
}

const formatDateTime = (value, fallback = t('common.status.notRecorded')) => {
  if (!value) {
    return fallback
  }

  return new Intl.DateTimeFormat(locale.value, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

watch(
  () => [filters.limit, autoRefreshEnabled.value],
  async () => {
    await loadJobs()
  }
)

watch(
  () => currentLedgerId.value,
  async (ledgerId) => {
    if (!ledgerId) {
      jobs.value = []
      stopPolling()
      memberOptions.value = []
      return
    }

    await Promise.all([loadMembers(), loadJobs()])
  },
  { immediate: true }
)

onMounted(async () => {
  if (!ledgerStore.initialized) {
    await ledgerStore.initializeLedgers()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
:deep(.el-select__wrapper) {
  border-radius: 18px;
  min-height: 42px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  width: 100%;
}
</style>
