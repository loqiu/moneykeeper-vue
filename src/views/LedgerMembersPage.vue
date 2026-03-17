<template>
  <PlatformPageShell
    :eyebrow="t('platform.members.eyebrow')"
    :title="t('platform.members.title')"
    :description="t('platform.members.description')"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.members.summary.membersLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ members.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.members.summary.membersHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.members.summary.invitesLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ ledgerInvites.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.members.summary.invitesHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.members.summary.roleLabel') }}</p>
          <p class="mt-2 text-lg font-semibold">{{ roleLabel(currentRole) }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.members.summary.roleHint') }}</p>
        </div>
      </div>
    </template>

    <template #aside>
      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.members.inviteForm.title') }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ t('platform.members.inviteForm.description') }}
          </p>
        </div>

        <div
          v-if="!canManageInvites"
          class="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600"
        >
          {{ t('platform.members.inviteForm.readOnly') }}
        </div>

        <el-form v-else class="mt-5 space-y-4" label-position="top" @submit.prevent>
          <el-form-item :label="t('platform.members.inviteForm.emailLabel')">
            <el-input
              v-model="inviteForm.invitedEmail"
              maxlength="100"
              clearable
              :placeholder="t('platform.members.inviteForm.emailPlaceholder')"
            />
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item :label="t('platform.members.inviteForm.roleLabel')">
              <el-select v-model="inviteForm.role" class="w-full">
                <el-option :label="t('platform.members.inviteForm.roles.admin')" value="admin" />
                <el-option :label="t('platform.members.inviteForm.roles.member')" value="member" />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('platform.members.inviteForm.daysLabel')">
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
            {{ t('platform.members.inviteForm.submit') }}
          </el-button>
        </el-form>
      </article>

      <article class="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.members.myInvites.title') }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ t('platform.members.myInvites.description') }}
            </p>
          </div>
          <el-button class="!rounded-full !px-4" @click="loadPendingInvites">{{ t('platform.members.myInvites.refresh') }}</el-button>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {{ t('platform.members.myInvites.pendingCount', { count: visiblePendingInvites.length }) }}
          </span>
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {{ t('platform.members.myInvites.resolvedCount', { count: resolvedMyInvites.length }) }}
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
                <div class="text-sm font-semibold text-slate-900">{{ invite.ledgerName || ledgerFallback(invite.ledgerId) }}</div>
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
                {{ t('platform.members.myInvites.accept') }}
              </el-button>
            </div>
          </div>
        </div>

        <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {{ t('platform.members.myInvites.empty') }}
        </div>

        <div v-if="resolvedMyInvites.length" class="mt-4 space-y-3">
          <div
            v-for="invite in resolvedMyInvites"
            :key="`resolved-${invite.id}`"
            class="rounded-[22px] border border-slate-200 bg-white/80 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ invite.ledgerName || ledgerFallback(invite.ledgerId) }}</div>
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
              {{ t('platform.members.workspace.description') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="loadPageData">{{ t('platform.members.workspace.refresh') }}</el-button>
            <el-button
              v-if="hasTargetLedger && Number(route.params.ledgerId) !== currentLedgerId"
              class="!rounded-full !px-4"
              @click="setAsCurrentContext"
            >
              {{ t('platform.members.workspace.setCurrent') }}
            </el-button>
          </div>
        </div>
      </section>

      <PlatformStateCard
        v-if="errorMessage"
        variant="error"
        compact
        :centered="false"
        :title="t('platform.members.states.errorTitle')"
        :description="errorMessage"
        :action-label="t('common.refresh')"
        @action="loadPageData"
      />

      <PlatformStateCard
        v-else-if="!hasTargetLedger"
        variant="warning"
        :title="t('platform.members.states.ledgerMissingTitle')"
        :description="t('platform.members.states.ledgerMissingDescription')"
      >
        <template #actions>
          <router-link
            to="/ledgers"
            class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            {{ t('platform.members.states.ledgerMissingAction') }}
          </router-link>
        </template>
      </PlatformStateCard>

      <PlatformStateCard
        v-else-if="isLoading"
        variant="loading"
        :title="t('platform.members.states.loadingTitle')"
        :description="t('platform.members.states.loadingDescription')"
      />

      <section v-else class="grid gap-6 xl:grid-cols-2">
        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">{{ t('platform.members.membersList.title') }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ t('platform.members.membersList.description') }}</p>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              {{ t('platform.members.membersList.count', { count: members.length }) }}
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
                  <div class="text-sm font-semibold text-slate-900">{{ member.username || memberFallback(member.userId) }}</div>
                  <div class="mt-2 text-xs text-slate-500">{{ member.email || t('platform.members.membersList.emailMissing') }}</div>
                </div>
                <div class="flex flex-wrap gap-2 justify-end">
                  <span
                    v-if="member.userId === currentUserId"
                    class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    {{ t('platform.members.membersList.currentUser') }}
                  </span>
                  <span class="rounded-full px-3 py-1 text-xs font-medium" :class="roleBadgeClass(member.role)">
                    {{ roleLabel(member.role) }}
                  </span>
                  <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                    {{ statusLabel(member.status || 'active') }}
                  </span>
                </div>
              </div>
              <div class="mt-3 text-xs text-slate-500">{{ t('platform.members.membersList.joinedAt', { value: formatDateTime(member.joinedAt) }) }}</div>
            </div>
          </div>

          <div v-else class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            {{ t('platform.members.membersList.empty') }}
          </div>
        </article>

        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">{{ t('platform.members.ledgerInvites.title') }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ t('platform.members.ledgerInvites.description') }}</p>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              {{ t('platform.members.ledgerInvites.count', { count: ledgerInvites.length }) }}
            </span>
          </div>

          <div v-if="!canManageInvites" class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            {{ t('platform.members.ledgerInvites.noPermission') }}
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
                    {{ t('platform.members.ledgerInvites.copyCode') }}
                  </el-button>
                  <el-button
                    v-if="invite.status === 'expired'"
                    class="!rounded-full !px-4"
                    @click="handleReinvite(invite)"
                  >
                    {{ t('platform.members.ledgerInvites.reinvite') }}
                  </el-button>
                </div>
              </div>

              <div class="mt-3 space-y-1 text-xs text-slate-500">
                <div>{{ t('platform.members.ledgerInvites.inviteCode', { code: invite.inviteCode }) }}</div>
                <div>{{ t('platform.members.ledgerInvites.expiresAt', { value: formatDateTime(invite.expiresAt) }) }}</div>
                <div>{{ t('platform.members.ledgerInvites.createdAt', { value: formatDateTime(invite.createdAt) }) }}</div>
                <div v-if="invite.acceptedAt">{{ t('platform.members.ledgerInvites.acceptedAt', { value: formatDateTime(invite.acceptedAt) }) }}</div>
              </div>
            </div>
          </div>

          <div v-else-if="canManageInvites" class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            {{ ledgerInvites.length ? t('platform.members.ledgerInvites.filteredEmpty') : t('platform.members.ledgerInvites.empty') }}
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
import { useI18n } from 'vue-i18n'
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

const { t, locale } = useI18n()

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
const targetLedger = computed(() => ledgerList.value.find((item) => Number(item.id) === targetLedgerId.value) || null)
const currentRole = computed(() => targetLedger.value?.memberRole || 'member')
const hasTargetLedger = computed(() => Boolean(targetLedger.value))
const canManageInvites = computed(() => ['owner', 'admin'].includes(currentRole.value))
const ledgerTitle = computed(() => targetLedger.value?.name || ledgerFallback(targetLedgerId.value))
const visiblePendingInvites = computed(() => myPendingInvites.value.filter((item) => item.status === 'pending'))
const resolvedMyInvites = computed(() => myPendingInvites.value.filter((item) => item.status !== 'pending'))
const filteredLedgerInvites = computed(() => inviteStatusFilter.value === 'all'
  ? ledgerInvites.value
  : ledgerInvites.value.filter((item) => item.status === inviteStatusFilter.value))
const inviteStatusCounts = computed(() => ledgerInvites.value.reduce(
  (accumulator, item) => {
    const status = item.status || 'unknown'
    accumulator[status] = (accumulator[status] || 0) + 1
    return accumulator
  },
  { all: ledgerInvites.value.length, pending: 0, accepted: 0, expired: 0, unknown: 0 }
))
const currentUserId = computed(() => Number(userStore.userId))
const existingMemberEmails = computed(() => new Set(
  members.value
    .map((item) => item.email?.trim().toLowerCase())
    .filter(Boolean)
))

const inviteFilterOptions = computed(() => [
  { label: t('platform.members.ledgerInvites.filters.all'), value: 'all' },
  { label: t('platform.members.ledgerInvites.filters.pending'), value: 'pending' },
  { label: t('platform.members.ledgerInvites.filters.accepted'), value: 'accepted' },
  { label: t('platform.members.ledgerInvites.filters.expired'), value: 'expired' }
])

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

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

const roleLabel = (role) => t(`common.roles.${role || 'member'}`)
const statusLabel = (status) => t(`common.status.${status || 'unknown'}`)
const inviteStatusLabel = (status) => statusLabel(status || 'unknown')
const memberFallback = (userId) => t('platform.search.filters.memberFallback', { id: userId })
const ledgerFallback = (ledgerId) => `${t('nav.ledgers.label')} #${ledgerId}`

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

const formatDateTime = (value) => {
  if (!value) {
    return t('common.status.notRecorded')
  }

  return new Intl.DateTimeFormat(locale.value, {
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
    errorMessage.value = getApiErrorMessage(error, t('platform.members.errors.pendingFetchFailed'))
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
    errorMessage.value = getApiErrorMessage(error, t('platform.members.errors.fetchFailed'))
  } finally {
    isLoading.value = false
  }
}

const handleCreateInvite = async () => {
  const normalizedEmail = inviteForm.invitedEmail.trim().toLowerCase()

  if (!normalizedEmail) {
    ElMessage.warning(t('platform.members.messages.emailRequired'))
    return
  }

  if (!isValidEmail(normalizedEmail)) {
    ElMessage.warning(t('platform.members.messages.emailInvalid'))
    return
  }

  if (existingMemberEmails.value.has(normalizedEmail)) {
    ElMessage.warning(t('platform.members.messages.alreadyMember'))
    return
  }

  const duplicatedPendingInvite = ledgerInvites.value.find((item) => item.status === 'pending' && item.invitedEmail?.trim().toLowerCase() === normalizedEmail)
  if (duplicatedPendingInvite) {
    ElMessage.warning(t('platform.members.messages.duplicatePendingInvite'))
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
    ElMessage.success(t('platform.members.messages.inviteCreated'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.members.errors.createInviteFailed')))
  } finally {
    isCreatingInvite.value = false
  }
}

const handleAcceptInvite = async (invite) => {
  if (invite.status !== 'pending') {
    ElMessage.warning(t('platform.members.messages.inviteUnavailable'))
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

    ElMessage.success(t('platform.members.messages.inviteAccepted'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.members.errors.acceptInviteFailed')))
  } finally {
    acceptingInviteCode.value = ''
  }
}

const copyInviteCode = async (inviteCode) => {
  if (!inviteCode) {
    ElMessage.warning(t('platform.members.messages.inviteCodeMissing'))
    return
  }

  try {
    await navigator.clipboard.writeText(inviteCode)
    ElMessage.success(t('platform.members.messages.inviteCodeCopied'))
  } catch (error) {
    ElMessage.error(t('platform.members.errors.copyInviteCodeFailed'))
  }
}

const handleReinvite = (invite) => {
  if (!canManageInvites.value) {
    ElMessage.warning(t('platform.members.messages.reinviteForbidden'))
    return
  }

  prefillInviteForm(invite)
  ElMessage.info(t('platform.members.messages.reinviteFilled'))
}

const setAsCurrentContext = () => {
  if (!hasTargetLedger.value) {
    ElMessage.warning(t('platform.members.states.ledgerMissingTitle'))
    return
  }

  ledgerStore.selectLedger(targetLedgerId.value)
  ElMessage.success(t('platform.members.messages.contextSwitched'))
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
