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

        <div v-if="myPendingInvites.length" class="mt-5 space-y-3">
          <div
            v-for="invite in myPendingInvites"
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
              v-if="Number(route.params.ledgerId) !== currentLedgerId"
              class="!rounded-full !px-4"
              @click="setAsCurrentContext"
            >
              设为当前账本
            </el-button>
          </div>
        </div>
      </section>

      <section v-if="errorMessage" class="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {{ errorMessage }}
      </section>

      <section v-if="isLoading" class="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
        正在加载成员与邀请信息...
      </section>

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

          <div v-else-if="ledgerInvites.length" class="mt-5 space-y-3">
            <div
              v-for="invite in ledgerInvites"
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

                <el-button class="!rounded-full !px-4" @click="copyInviteCode(invite.inviteCode)">复制邀请码</el-button>
              </div>

              <div class="mt-3 space-y-1 text-xs text-slate-500">
                <div>邀请码：{{ invite.inviteCode }}</div>
                <div>过期时间：{{ formatDateTime(invite.expiresAt) }}</div>
                <div>创建时间：{{ formatDateTime(invite.createdAt) }}</div>
                <div v-if="invite.acceptedAt">接受时间：{{ formatDateTime(invite.acceptedAt) }}</div>
              </div>
            </div>
          </div>

          <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            当前账本还没有邀请记录。
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
import {
  acceptLedgerInvite,
  createLedgerInvite,
  fetchLedgerInvites,
  fetchLedgerMembers,
  fetchMyLedgerInvites
} from '@/api/modules/ledgers'
import { getApiErrorMessage } from '@/api/response'
import { useLedgerStore } from '@/stores/ledger'

const route = useRoute()
const ledgerStore = useLedgerStore()
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

const targetLedgerId = computed(() => Number(route.params.ledgerId))
const targetLedger = computed(() => {
  return ledgerList.value.find((item) => Number(item.id) === targetLedgerId.value) || null
})
const currentRole = computed(() => targetLedger.value?.memberRole || '')
const canManageInvites = computed(() => ['owner', 'admin'].includes(currentRole.value))
const ledgerTitle = computed(() => targetLedger.value?.name || `账本 #${targetLedgerId.value}`)

const resetInviteForm = () => {
  inviteForm.invitedEmail = ''
  inviteForm.role = 'member'
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
  if (!targetLedgerId.value) {
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
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, '获取成员与邀请信息失败')
  } finally {
    isLoading.value = false
  }
}

const handleCreateInvite = async () => {
  if (!inviteForm.invitedEmail.trim()) {
    ElMessage.warning('请输入受邀邮箱')
    return
  }

  isCreatingInvite.value = true
  try {
    const createdInvite = await createLedgerInvite(targetLedgerId.value, inviteForm)
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
  try {
    await navigator.clipboard.writeText(inviteCode)
    ElMessage.success('邀请码已复制')
  } catch (error) {
    ElMessage.error('复制邀请码失败')
  }
}

const setAsCurrentContext = () => {
  ledgerStore.selectLedger(targetLedgerId.value)
  ElMessage.success('已切换当前账本上下文')
}

watch(
  () => [targetLedgerId.value, currentRole.value],
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
