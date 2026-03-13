<template>
  <PlatformPageShell
    eyebrow="Export Jobs"
    title="导出任务"
    description="导出已经不再假设同步完成，而是升级成可追踪状态、可回看历史、可下载结果的异步任务中心。"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Jobs</p>
          <p class="mt-2 text-3xl font-semibold">{{ jobs.length }}</p>
          <p class="mt-2 text-xs text-slate-300">当前加载的导出任务</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Active</p>
          <p class="mt-2 text-3xl font-semibold">{{ activeJobCount }}</p>
          <p class="mt-2 text-xs text-slate-300">正在排队或处理中</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Completed</p>
          <p class="mt-2 text-3xl font-semibold">{{ completedJobCount }}</p>
          <p class="mt-2 text-xs text-slate-300">已可下载任务</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">创建导出任务</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            创建成功后，后端会先写一条入队通知；任务完成或失败后，通知中心也会同步收到结果。
          </p>
        </div>

        <el-form class="mt-5 space-y-4" label-position="top" @submit.prevent>
          <el-form-item label="记录类型">
            <el-select v-model="form.type" clearable class="w-full" placeholder="全部类型">
              <el-option
                v-for="option in typeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="目标成员 ID">
            <el-input-number
              v-model="form.userId"
              :min="1"
              controls-position="right"
              class="!w-full"
              placeholder="普通成员留空即可"
            />
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="!w-full"
                placeholder="可留空"
              />
            </el-form-item>

            <el-form-item label="结束日期">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                class="!w-full"
                placeholder="可留空"
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
            创建导出任务
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
              导出任务按当前 ledger 列出。普通成员默认只看到自己创建的任务，平台 admin 会看到当前账本下的全部任务。
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadJobs">刷新任务</el-button>
            <router-link
              to="/notifications"
              class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-slate-400 hover:bg-white"
            >
              打开通知中心
            </router-link>
          </div>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,220px)_auto]">
          <el-select v-model="filters.limit" class="w-full" placeholder="加载数量">
            <el-option
              v-for="option in limitOptions"
              :key="option"
              :label="`${option} 条`"
              :value="option"
            />
          </el-select>

          <div class="flex h-[42px] items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4">
            <span class="text-sm text-slate-700">自动轮询处理中任务</span>
            <el-switch v-model="autoRefreshEnabled" />
          </div>
        </div>
      </section>

      <section v-if="errorMessage" class="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {{ errorMessage }}
      </section>

      <section v-if="!hasLedgerContext" class="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p class="text-base font-medium text-slate-900">请先选择账本</p>
        <p class="mt-2 text-sm text-slate-500">导出任务是账本维度功能，先到“账本中心”切到目标账本再继续。</p>
      </section>

      <section v-else-if="isLoading" class="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
        正在加载导出任务...
      </section>

      <section v-else-if="!jobs.length" class="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p class="text-base font-medium text-slate-900">当前还没有导出任务</p>
        <p class="mt-2 text-sm text-slate-500">可以先创建一条任务，后端会异步处理并通过通知中心回流结果。</p>
      </section>

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
                  {{ job.recordType === 'expense' ? '支出' : '收入' }}
                </span>
                <span class="text-xs text-slate-400">创建于 {{ formatDateTime(job.createdAt) }}</span>
              </div>

              <h3 class="mt-3 text-lg font-semibold text-slate-900">{{ job.fileName || `导出任务 #${job.id}` }}</h3>

              <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                <span>任务 ID：{{ job.id }}</span>
                <span>请求人：{{ job.requestedByUserId || '-' }}</span>
                <span>目标成员：{{ job.targetUserId || '当前用户' }}</span>
                <span>记录数：{{ job.recordCount }}</span>
                <span>下载次数：{{ job.downloadCount }}</span>
              </div>

              <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                <span>开始日期：{{ job.startDate || '未限制' }}</span>
                <span>结束日期：{{ job.endDate || '未限制' }}</span>
                <span>开始处理：{{ formatDateTime(job.startedAt, '尚未开始') }}</span>
                <span>完成时间：{{ formatDateTime(job.completedAt, '尚未完成') }}</span>
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
                下载结果
              </el-button>

              <el-button
                v-if="job.status === 'pending' || job.status === 'running'"
                class="!rounded-full !px-4"
                @click="handleRefreshJob(job)"
              >
                刷新状态
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
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import {
  createLedgerExportJob,
  downloadLedgerExportJob,
  fetchLedgerExportJob,
  fetchLedgerExportJobs
} from '@/api/modules/exportJobs'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'
import { useNotificationStore } from '@/stores/notification'

const POLL_INTERVAL = 5000

const ledgerStore = useLedgerStore()
const notificationStore = useNotificationStore()
const { currentLedgerId, currentLedger } = storeToRefs(ledgerStore)

const isLoading = ref(false)
const isSubmitting = ref(false)
const downloadingJobId = ref(null)
const errorMessage = ref('')
const jobs = ref([])
const autoRefreshEnabled = ref(true)
const pollTimer = ref(null)

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

const typeOptions = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' }
]

const hasLedgerContext = computed(() => Boolean(currentLedgerId.value))
const currentLedgerName = computed(() => currentLedger.value?.name || '请先选择账本')
const activeJobCount = computed(() => jobs.value.filter((job) => ['pending', 'running'].includes(job.status)).length)
const completedJobCount = computed(() => jobs.value.filter((job) => job.status === 'completed').length)

const buildQuery = () => ({
  limit: filters.limit
})

const stopPolling = () => {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
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

const loadJobs = async ({ silent = false } = {}) => {
  if (!currentLedgerId.value) {
    jobs.value = []
    stopPolling()
    return
  }

  if (!silent) {
    isLoading.value = true
  }
  errorMessage.value = ''

  try {
    jobs.value = await fetchLedgerExportJobs(currentLedgerId.value, buildQuery())
    maybeStartPolling()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, '获取导出任务失败')
    stopPolling()
  } finally {
    if (!silent) {
      isLoading.value = false
    }
  }
}

const handleCreateExportJob = async () => {
  if (!hasLedgerContext.value) {
    ElMessage.warning('请先选择账本')
    return
  }

  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    ElMessage.warning('结束日期不能早于开始日期')
    return
  }

  isSubmitting.value = true

  try {
    await createLedgerExportJob(currentLedgerId.value, form)
    resetForm()
    await Promise.all([loadJobs(), notificationStore.refreshUnreadCount()])
    ElMessage.success('导出任务已创建，后端开始排队处理')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '创建导出任务失败'))
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
    ElMessage.error(getApiErrorMessage(error, '刷新导出任务失败'))
  }
}

const handleDownloadJob = async (job) => {
  downloadingJobId.value = job.id

  try {
    const { blob, filename } = await downloadLedgerExportJob(currentLedgerId.value, job.id)
    saveBlobAsFile(blob, filename || job.fileName || `ledger-export-${job.id}.xlsx`)
    await loadJobs({ silent: true })
    ElMessage.success('导出文件已开始下载')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '下载导出文件失败'))
  } finally {
    downloadingJobId.value = null
  }
}

const jobStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return '排队中'
    case 'running':
      return '处理中'
    case 'completed':
      return '已完成'
    case 'failed':
      return '已失败'
    default:
      return status
  }
}

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

const formatDateTime = (value, fallback = '未记录') => {
  if (!value) {
    return fallback
  }

  return new Intl.DateTimeFormat('zh-CN', {
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
      return
    }

    await loadJobs()
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
