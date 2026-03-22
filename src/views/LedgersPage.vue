<template>
  <PlatformPageShell
    :eyebrow="t('platform.ledgers.eyebrow')"
    :title="t('platform.ledgers.title')"
    :description="t('platform.ledgers.description')"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.ledgers.summary.ledgersLabel') }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ ledgerList.length }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.ledgers.summary.ledgersHint') }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ t('platform.ledgers.summary.contextLabel') }}</p>
          <p class="mt-2 text-2xl font-semibold">{{ currentLedgerName }}</p>
          <p class="mt-2 text-xs text-slate-300">{{ t('platform.ledgers.summary.contextHint') }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <section class="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.ledgers.list.title') }}</h2>
              <p class="mt-1 text-sm text-slate-500">{{ t('platform.ledgers.list.description') }}</p>
            </div>
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="refreshLedgers">
              {{ t('platform.ledgers.list.refresh') }}
            </el-button>
          </div>

          <PlatformStateCard
            v-if="errorMessage"
            variant="error"
            compact
            :centered="false"
            :title="t('platform.ledgers.list.loadErrorTitle')"
            :description="errorMessage"
            :action-label="t('common.refresh')"
            @action="refreshLedgers"
          />

          <PlatformStateCard
            v-else-if="isLoading"
            variant="loading"
            compact
            :title="t('platform.ledgers.list.loadingTitle')"
            :description="t('platform.ledgers.list.loadingDescription')"
          />

          <PlatformStateCard
            v-else-if="!ledgerList.length"
            variant="empty"
            compact
            :title="t('platform.ledgers.list.emptyTitle')"
            :description="t('platform.ledgers.list.emptyDescription')"
          />

          <div v-else class="mt-5 grid gap-4 md:grid-cols-2">
            <article
              v-for="ledger in ledgerList"
              :key="ledger.id"
              class="rounded-[24px] border p-5 shadow-sm transition hover:-translate-y-0.5"
              :class="ledger.id === currentLedgerId ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold">{{ ledger.name }}</p>
                  <p
                    class="mt-2 text-xs uppercase tracking-[0.22em]"
                    :class="ledger.id === currentLedgerId ? 'text-slate-300' : 'text-slate-400'"
                  >
                    {{ ledgerTypeLabel(ledger.type) }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2 justify-end">
                  <span
                    v-if="ledger.defaultLedger"
                    class="rounded-full px-3 py-1 text-xs font-medium"
                    :class="ledger.id === currentLedgerId ? 'bg-white/10 text-white' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ t('platform.ledgers.list.defaultBadge') }}
                  </span>
                  <span
                    class="rounded-full px-3 py-1 text-xs font-medium"
                    :class="ledger.id === currentLedgerId ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'"
                  >
                    {{ roleLabel(ledger.memberRole || 'member') }}
                  </span>
                </div>
              </div>

              <p
                class="mt-4 text-sm leading-6"
                :class="ledger.id === currentLedgerId ? 'text-slate-300' : 'text-slate-500'"
              >
                {{ t('platform.ledgers.list.contextDescription') }}
              </p>

              <div class="mt-5 flex flex-wrap gap-3">
                <el-button
                  class="!rounded-full !px-4"
                  :type="ledger.id === currentLedgerId ? 'primary' : 'default'"
                  @click="selectLedgerContext(ledger.id)"
                >
                  {{ ledger.id === currentLedgerId ? t('platform.ledgers.list.currentContext') : t('platform.ledgers.list.setCurrentContext') }}
                </el-button>

                <router-link
                  class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium no-underline"
                  :class="ledger.id === currentLedgerId ? 'border-white/20 text-white' : 'text-slate-700'"
                  :to="`/ledgers/${ledger.id}/members`"
                >
                  {{ t('platform.ledgers.list.membersAction') }}
                </router-link>
              </div>
            </article>
          </div>
        </article>

        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ t('platform.ledgers.create.title') }}</h2>
            <p class="mt-1 text-sm text-slate-500">{{ t('platform.ledgers.create.description') }}</p>
          </div>

          <el-form class="mt-5 space-y-4" label-position="top" @submit.prevent>
            <el-form-item :label="t('platform.ledgers.create.nameLabel')">
              <el-input v-model="form.name" maxlength="50" :placeholder="t('platform.ledgers.create.namePlaceholder')" />
            </el-form-item>

            <el-form-item :label="t('platform.ledgers.create.typeLabel')">
              <el-select v-model="form.type" class="w-full">
                <el-option
                  v-for="option in typeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>

            <el-button class="!w-full !rounded-full" type="primary" :loading="isCreating" @click="handleCreateLedger">
              {{ t('platform.ledgers.create.submit') }}
            </el-button>
          </el-form>

        </article>
      </section>
    </div>
  </PlatformPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import PlatformStateCard from '@/components/PlatformStateCard.vue'
import { useLedgerStore } from '@/stores/ledger'
import { getApiErrorMessage } from '@/api/response'

const { t } = useI18n()

const ledgerStore = useLedgerStore()
const { ledgerList, currentLedgerId, currentLedger, isLoading, errorMessage } = storeToRefs(ledgerStore)

const isCreating = ref(false)
const form = reactive({
  name: '',
  type: 'shared'
})

const typeOptions = computed(() => [
  { label: t('platform.ledgers.types.shared'), value: 'shared' },
  { label: t('platform.ledgers.types.family'), value: 'family' },
  { label: t('platform.ledgers.types.project'), value: 'project' }
])

const currentLedgerName = computed(() => currentLedger.value?.name || t('platform.ledgers.messages.currentLedgerFallback'))

const roleLabel = (role) => t(`common.roles.${role || 'member'}`)
const ledgerTypeLabel = (type) => t(`platform.ledgers.types.${type}`, type)

const refreshLedgers = async () => {
  await ledgerStore.refreshLedgers()
}

const selectLedgerContext = (ledgerId) => {
  ledgerStore.selectLedger(ledgerId)
  ElMessage.success(t('platform.ledgers.messages.contextSwitched'))
}

const handleCreateLedger = async () => {
  if (!form.name.trim()) {
    ElMessage.warning(t('platform.ledgers.messages.nameRequired'))
    return
  }

  isCreating.value = true
  try {
    const created = await ledgerStore.createLedger({
      name: form.name.trim(),
      type: form.type
    })

    ledgerStore.selectLedger(created.id)
    form.name = ''
    form.type = 'shared'
    ElMessage.success(t('platform.ledgers.messages.created'))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('platform.ledgers.errors.createFailed')))
  } finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  if (!ledgerStore.initialized) {
    await ledgerStore.initializeLedgers()
  }
})
</script>
