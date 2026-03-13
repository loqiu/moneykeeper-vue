<template>
  <PlatformPageShell
    eyebrow="Ledger Members"
    title="成员与邀请"
    description="成员页已经从平台骨架切成真实协作页面，当前可查看成员、创建邀请、追踪待处理邀请，并接受发给当前账号邮箱的待加入账本邀请。"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Members</p>
          <p class="mt-2 text-3xl font-semibold">{{ members.length }}</p>
          <p class="mt-2 text-xs text-slate-300">当前账本成员数量</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Invites</p>
          <p class="mt-2 text-3xl font-semibold">{{ ledgerInvites.length }}</p>
          <p class="mt-2 text-xs text-slate-300">当前账本邀请数量</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Role</p>
          <p class="mt-2 text-lg font-semibold">{{ roleLabel(currentRole) }}</p>
          <p class="mt-2 text-xs text-slate-300">当前页面可见权限基于此角色</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">创建邀请</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            只有 owner / admin 可以创建邀请。邀请会按邮箱匹配当前账号，接受后会自动刷新账本列表。
          </p>
        </div>

        <div
          v-if="!canManageInvites"
          class="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600"
        >
          当前角色只能查看成员，不能创建邀请。需要 owner / admin，或者平台级更高权限。
        </div>

        <el-form v-else class="mt-5 space-y-4" label-position="top" @submit.prevent>
          <el-form-item label="受邀邮箱">
            <el-input
              v-model="inviteForm.invitedEmail"
              maxlength="100"
              clearable
              placeholder="teammate@example.com"
            />
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item label="角色">
              <el-select v-model="inviteForm.role" class="w-full">
                <el-option label="管理员" value="admin" />
                <el-option label="普通成员" value="member" />
              </el-select>
            </el-form-item>

            <el-form-item label="有效期（天）">
              <el-input-number
                v-model="inviteForm.expiresInDays"
                :min="1"
                :max="30"
                controls-position="right"
                class="!w-full"
              />
            </el-form-item>
          </div>

          <el-button
            type="primary"
            class="!mt-2 !w-full !rounded-full !border-0 !bg-slate-900 !py-6 hover:!bg-slate-800 disabled:!bg-slate-300"
            :disabled="!hasTargetLedger"
            :loading="isCreatingInvite"
            @click="handleCreateInvite"
          >
            创建邀请
          </el-button>
        </el-form>
      </article>

      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">我的待接受邀请</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              这里显示当前账号邮箱匹配到的邀请。接受后会把新账本同步进 ledger 上下文。
            </p>
          </div>
          <el-button class="!rounded-full !px-4" @click="loadPendingInvites">刷新</el-button>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            待处理 {{ visiblePendingInvites.length }}
          </span>
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            已处理 {{ resolvedMyInvites.length }}
          </span>
        </div>

        <div v-if="visiblePendingInvites.length" class="mt-5 space-y-3">
          <div
            v-for="invite in visiblePendingInvites"
            :key="`pending-${invite.id}`"
            class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ invite.ledgerName || `账本 #${invite.ledgerId}` }}</div>
                <div class="mt-2 text-xs text-slate-500">
                  {{ invite.invitedEmail }} · {{ roleLabel(invite.role) }} · {{ inviteStatusLabel(invite.status) }}
                </div>
              </div>
              <el-button
                v-if="invite.status === 'pending'"
                class="!rounded-full !px-4"
                :loading="acceptingInviteCode === invite.inviteCode"
                @click="handleAcceptInvite(invite)"
              >
                接受邀请
              </el-button>
            </div>
          </div>
        </div>

        <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          当前没有待接受的邀请。
        </div>

        <div v-if="resolvedMyInvites.length" class="mt-4 space-y-3">
          <div
            v-for="invite in resolvedMyInvites"
            :key="`resolved-${invite.id}`"
            class="rounded-[22px] border border-slate-200 bg-white/80 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ invite.ledgerName || `账本 #${invite.ledgerId}` }}</div>
                <div class="mt-2 text-xs text-slate-500">
                  {{ invite.invitedEmail }} · {{ inviteStatusLabel(invite.status) }}
                </div>
              </div>
              <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                {{ inviteStatusLabel(invite.status) }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </template>

    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ ledgerTitle }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              当前页面围绕路由里的 ledgerId 展示成员与邀请。如果这不是当前平台上下文，可以在这里一键切换。
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadPageData">刷新页面</el-button>
            <el-button
              v-if="hasTargetLedger && Number(route.params.ledgerId) !== currentLedgerId"
              class="!rounded-full !px-4"
              @click="setAsCurrentContext"
            >
              设为当前账本
            </el-button>
          </div>
        </div>
      </section>

      <PlatformStateCard
        v-if="errorMessage"
        variant="error"
        compact
        :centered="false"
        title="成员协作数据加载失败"
        :description="errorMessage"
        action-label="重试"
        @action="loadPageData"
      />

      <PlatformStateCard
        v-else-if="!hasTargetLedger"
        variant="warning"
        title="当前账本不在你的可访问列表中"
        description="可以先回到账本中心刷新列表，或者确认你已经接受对应邀请。"
      >
        <template #actions>
          <router-link
            to="/ledgers"
            class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            返回账本中心
          </router-link>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-else-if="isLoading"
        variant="loading"
        title="正在加载成员与邀请信息..."
        description="系统正在同步成员列表、账本邀请和当前账号待接受邀请。"
      />

      <section v-else class="grid gap-6 xl:grid-cols-2">
        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">成员列表</h3>
              <p class="mt-1 text-sm text-slate-500">展示 owner / admin / member 角色和加入时间。</p>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              {{ members.length }} 人
            </span>
          </div>

          <div v-if="members.length" class="mt-5 space-y-3">
            <div
              v-for="member in members"
              :key="member.userId"
              class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ member.username || `用户 ${member.userId}` }}</div>
                  <div class="mt-2 text-xs text-slate-500">{{ member.email || '未提供邮箱' }}</div>
                </div>
                <div class="flex flex-wrap gap-2 justify-end">
                  <span
                    v-if="member.userId === currentUserId"
                    class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    当前用户
                  </span>
                  <span class="rounded-full px-3 py-1 text-xs font-medium" :class="roleBadgeClass(member.role)">
                    {{ roleLabel(member.role) }}
                  </span>
                  <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                    {{ member.status || 'active' }}
                  </span>
                </div>
              </div>
              <div class="mt-3 text-xs text-slate-500">加入时间：{{ formatDateTime(member.joinedAt) }}</div>
            </div>
          </div>

          <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            当前账本还没有成员数据。
          </div>
        </article>

        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">账本邀请</h3>
              <p class="mt-1 text-sm text-slate-500">追踪待处理、已接受和已过期的邀请状态。</p>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              {{ ledgerInvites.length }} 条
            </span>
          </div>

          <div v-if="!canManageInvites" class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            当前角色没有邀请查看权限，需 owner / admin。
          </div>

          <div v-if="canManageInvites && ledgerInvites.length" class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="option in inviteFilterOptions"
              :key="option.value"
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-medium transition"
              :class="inviteStatusFilter === option.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'"
              @click="inviteStatusFilter = option.value"
            >
              {{ option.label }} {{ inviteStatusCounts[option.value] ?? 0 }}
            </button>
          </div>

          <div v-if="canManageInvites && filteredLedgerInvites.length" class="mt-5 space-y-3">
            <div
              v-for="invite in filteredLedgerInvites"
              :key="invite.id"
              class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ invite.invitedEmail }}</div>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span class="rounded-full px-3 py-1 text-xs font-medium" :class="roleBadgeClass(invite.role)">
                      {{ roleLabel(invite.role) }}
                    </span>
                    <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                      {{ inviteStatusLabel(invite.status) }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-wrap justify-end gap-2">
                  <el-button
                    v-if="invite.status === 'pending'"
                    class="!rounded-full !px-4"
                    @click="copyInviteCode(invite.inviteCode)"
                  >
                    复制邀请码
                  </el-button>
                  <el-button
                    v-if="invite.status === 'expired'"
                    class="!rounded-full !px-4"
                    @click="handleReinvite(invite)"
                  >
                    重新邀请
                  </el-button>
                </div>
              </div>

              <div v-if="invite.status === 'expired'" class="mt-3">
                <el-button class="!rounded-full !px-4" @click="handleReinvite(invite)">重新邀请</el-button>
              </div>

              <div class="mt-3 space-y-1 text-xs text-slate-500">
                <div>邀请码：{{ invite.inviteCode }}</div>
                <div>过期时间：{{ formatDateTime(invite.expiresAt) }}</div>
                <div>创建时间：{{ formatDateTime(invite.createdAt) }}</div>
                <div v-if="invite.acceptedAt">接受时间：{{ formatDateTime(invite.acceptedAt) }}</div>
              </div>
            </div>
          </div>

          <div v-else-if="canManageInvites" class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            {{ ledgerInvites.length ? '当前筛选下没有匹配的邀请' : '当前账本还没有邀请记录。' }}
          </div>
        </article>
      </section>
    </div>
  </PlatformPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import {
  acceptLedgerInvite,
  createLedgerInvite,
  fetchLedgerInvites,
  fetchLedgerMembers,
  fetchMyLedgerInvites
} from '@/api/modules/ledgers'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const ledgerStore = useLedgerStore()
const userStore = useUserStore()
const { currentLedgerId, ledgerList } = storeToRefs(ledgerStore)

const isLoading = ref(false)
const isCreatingInvite = ref(false)
const acceptingInviteCode = ref('')
const errorMessage = ref('')
const members = ref([])
const ledgerInvites = ref([])
const myPendingInvites = ref([])

const inviteForm = reactive({
  invitedEmail: '',
  role: 'member',
  expiresInDays: 7
})

const inviteStatusFilter = ref('all')

const targetLedgerId = computed(() => Number(route.params.ledgerId))
const targetLedger = computed(() => {
  return ledgerList.value.find((item) => Number(item.id) === targetLedgerId.value) || null
})
const currentRole = computed(() => targetLedger.value?.memberRole || '')
const hasTargetLedger = computed(() => Boolean(targetLedger.value))
const canManageInvites = computed(() => ['owner', 'admin'].includes(currentRole.value))
const ledgerTitle = computed(() => targetLedger.value?.name || `账本 #${targetLedgerId.value}`)
const visiblePendingInvites = computed(() => myPendingInvites.value.filter((item) => item.status === 'pending'))
const resolvedMyInvites = computed(() => myPendingInvites.value.filter((item) => item.status !== 'pending'))
const filteredLedgerInvites = computed(() => {
  if (inviteStatusFilter.value === 'all') {
    return ledgerInvites.value
  }

  return ledgerInvites.value.filter((item) => item.status === inviteStatusFilter.value)
})
const inviteStatusCounts = computed(() => {
  return ledgerInvites.value.reduce(
    (accumulator, item) => {
      const status = item.status || 'unknown'
      accumulator[status] = (accumulator[status] || 0) + 1
      return accumulator
    },
    { all: ledgerInvites.value.length, pending: 0, accepted: 0, expired: 0, unknown: 0 }
  )
})
const currentUserId = computed(() => Number(userStore.userId))
const existingMemberEmails = computed(() => {
  return new Set(
    members.value
      .map((item) => item.email?.trim().toLowerCase())
      .filter(Boolean)
  )
})

const inviteFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '已接受', value: 'accepted' },
  { label: '已过期', value: 'expired' }
]

const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const resetInviteForm = () => {
  inviteForm.invitedEmail = ''
  inviteForm.role = 'member'
  inviteForm.expiresInDays = 7
}

const prefillInviteForm = (invite) => {
  inviteForm.invitedEmail = invite.invitedEmail || ''
  inviteForm.role = invite.role || 'member'
  inviteForm.expiresInDays = 7
}

const roleLabel = (role) => {
  switch (role) {
    case 'owner':
      return '所有者'
    case 'admin':
      return '管理员'
    default:
      return '普通成员'
  }
}

const roleBadgeClass = (role) => {
  switch (role) {
    case 'owner':
      return 'bg-amber-50 text-amber-700'
    case 'admin':
      return 'bg-sky-50 text-sky-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const inviteStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return '待处理'
    case 'accepted':
      return '已接受'
    case 'expired':
      return '已过期'
    default:
      return status || '未知状态'
  }
}

const formatDateTime = (value) => {
  if (!value) {
    return '未记录'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

const loadPendingInvites = async () => {
  try {
    myPendingInvites.value = await fetchMyLedgerInvites()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, '获取待接受邀请失败')
  }
}

const loadPageData = async () => {
  if (!targetLedgerId.value || !hasTargetLedger.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const memberPromise = fetchLedgerMembers(targetLedgerId.value)
    const myInvitesPromise = fetchMyLedgerInvites()
    const ledgerInvitesPromise = canManageInvites.value ? fetchLedgerInvites(targetLedgerId.value) : Promise.resolve([])

    const [memberList, inviteList, pendingInviteList] = await Promise.all([
      memberPromise,
      ledgerInvitesPromise,
      myInvitesPromise
    ])

    members.value = memberList
    ledgerInvites.value = inviteList
    myPendingInvites.value = pendingInviteList
    inviteStatusFilter.value = 'all'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, '获取成员与邀请信息失败')
  } finally {
    isLoading.value = false
  }
}

const handleCreateInvite = async () => {
  const normalizedEmail = inviteForm.invitedEmail.trim().toLowerCase()

  if (!normalizedEmail) {
    ElMessage.warning('请输入受邀邮箱')
    return
  }

  if (!isValidEmail(normalizedEmail)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  if (existingMemberEmails.value.has(normalizedEmail)) {
    ElMessage.warning('璇ラ偖绠卞凡缁忔槸褰撳墠璐︽湰鎴愬憳')
    return
  }

  const duplicatedPendingInvite = ledgerInvites.value.find((item) => {
    return item.status === 'pending' && item.invitedEmail?.trim().toLowerCase() === normalizedEmail
  })

  if (duplicatedPendingInvite) {
    ElMessage.warning('璇ラ偖绠卞凡鏈夊緟澶勭悊閭€璇凤紝鍙互鐩存帴澶嶅埗閭€璇风爜')
    return
  }

  isCreatingInvite.value = true
  try {
    const createdInvite = await createLedgerInvite(targetLedgerId.value, {
      ...inviteForm,
      invitedEmail: normalizedEmail
    })
    ledgerInvites.value = [createdInvite, ...ledgerInvites.value]
    resetInviteForm()
    ElMessage.success('邀请已创建')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '创建邀请失败'))
  } finally {
    isCreatingInvite.value = false
  }
}

const handleAcceptInvite = async (invite) => {
  if (invite.status !== 'pending') {
    ElMessage.warning('当前邀请已经不可接受')
    return
  }

  acceptingInviteCode.value = invite.inviteCode

  try {
    const acceptedLedger = await acceptLedgerInvite(invite.inviteCode)
    await ledgerStore.initializeLedgers({ force: true })

    if (acceptedLedger?.id) {
      ledgerStore.selectLedger(acceptedLedger.id)
    }

    await loadPendingInvites()
    if (Number(acceptedLedger?.id) === targetLedgerId.value) {
      await loadPageData()
    }

    ElMessage.success('邀请已接受')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '接受邀请失败'))
  } finally {
    acceptingInviteCode.value = ''
  }
}

const copyInviteCode = async (inviteCode) => {
  if (!inviteCode) {
    ElMessage.warning('当前邀请没有可复制的邀请码')
    return
  }

  try {
    await navigator.clipboard.writeText(inviteCode)
    ElMessage.success('邀请码已复制')
  } catch (error) {
    ElMessage.error('复制邀请码失败')
  }
}

const handleReinvite = (invite) => {
  if (!canManageInvites.value) {
    ElMessage.warning('褰撳墠瑙掕壊鏃犳硶閲嶆柊鍒涘缓閭€璇')
    return
  }

  prefillInviteForm(invite)
  ElMessage.info('宸插皢閭€璇蜂俊鎭洖濉埌琛ㄥ崟锛屽彲鐩存帴閲嶆柊鍒涘缓')
}

const setAsCurrentContext = () => {
  if (!hasTargetLedger.value) {
    ElMessage.warning('当前账本不在你的可访问列表中')
    return
  }

  ledgerStore.selectLedger(targetLedgerId.value)
  ElMessage.success('已切换当前账本上下文')
}

watch(
  () => [targetLedgerId.value, currentRole.value, hasTargetLedger.value],
  async () => {
    if (targetLedgerId.value) {
      await loadPageData()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (!ledgerStore.initialized) {
    await ledgerStore.initializeLedgers()
  }
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

:deep(.el-input__wrapper) {
  border-radius: 18px;
}
</style>
