<template>
  <PlatformPageShell
    eyebrow="Ledger Workspace"
    title="账本中心"
    description="这里承接平台化后的账本上下文。先把账本列表、创建和当前上下文切起来，后续预算、通知、导出和搜索页面都会围绕这里的选择工作。"
  >
    <template #summary>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Ledgers</p>
          <p class="mt-2 text-3xl font-semibold">{{ ledgerList.length }}</p>
          <p class="mt-2 text-xs text-slate-300">当前可访问账本数量</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Context</p>
          <p class="mt-2 text-2xl font-semibold">{{ currentLedgerName }}</p>
          <p class="mt-2 text-xs text-slate-300">当前平台上下文</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <section class="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article class="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">我的账本</h2>
              <p class="mt-1 text-sm text-slate-500">默认账本、共享账本和后续平台能力都会从这里进入。</p>
            </div>
            <el-button class="!rounded-full !px-4" :loading="isLoading" @click="refreshLedgers">
              刷新列表
            </el-button>
          </div>

          <div v-if="errorMessage" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ errorMessage }}
          </div>

          <div v-if="isLoading" class="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            正在加载账本列表...
          </div>

          <div v-else-if="!ledgerList.length" class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
            <p class="text-base font-medium text-slate-900">还没有可用账本</p>
            <p class="mt-2 text-sm text-slate-500">可以先创建一个 shared / family / project 类型的账本。</p>
          </div>

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
                    {{ ledger.type }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2 justify-end">
                  <span
                    v-if="ledger.defaultLedger"
                    class="rounded-full px-3 py-1 text-xs font-medium"
                    :class="ledger.id === currentLedgerId ? 'bg-white/10 text-white' : 'bg-amber-100 text-amber-700'"
                  >
                    默认
                  </span>
                  <span
                    class="rounded-full px-3 py-1 text-xs font-medium"
                    :class="ledger.id === currentLedgerId ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'"
                  >
                    {{ ledger.memberRole || 'member' }}
                  </span>
                </div>
              </div>

              <p
                class="mt-4 text-sm leading-6"
                :class="ledger.id === currentLedgerId ? 'text-slate-300' : 'text-slate-500'"
              >
                当前阶段先把账本上下文接起来，后续预算、通知、导出和搜索页面都会默认基于这里的选择工作。
              </p>

              <div class="mt-5 flex flex-wrap gap-3">
                <el-button
                  class="!rounded-full !px-4"
                  :type="ledger.id === currentLedgerId ? 'primary' : 'default'"
                  @click="selectLedgerContext(ledger.id)"
                >
                  {{ ledger.id === currentLedgerId ? '当前上下文' : '设为当前上下文' }}
                </el-button>

                <router-link
                  class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium no-underline"
                  :class="ledger.id === currentLedgerId ? 'border-white/20 text-white' : 'text-slate-700'"
                  :to="`/ledgers/${ledger.id}/members`"
                >
                  成员与邀请
                </router-link>
              </div>
            </article>
          </div>
        </article>

        <article class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">创建账本</h2>
            <p class="mt-1 text-sm text-slate-500">当前后端支持 shared / family / project 三种类型。</p>
          </div>

          <el-form class="mt-5 space-y-4" label-position="top" @submit.prevent>
            <el-form-item label="账本名称">
              <el-input v-model="form.name" maxlength="50" placeholder="例如：Family Budget" />
            </el-form-item>

            <el-form-item label="账本类型">
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
              创建并加入账本上下文
            </el-button>
          </el-form>

          <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p class="font-medium text-slate-900">下一步接入</p>
            <ul class="mt-3 space-y-2">
              <li>1. 把当前 ledger 挂到预算、通知、导出和搜索页面。</li>
              <li>2. 再把记录与分类接口迁到 `/api/ledgers/{ledgerId}/...`。</li>
              <li>3. 最后把成员和邀请页接成真实管理页。</li>
            </ul>
          </div>
        </article>
      </section>
    </div>
  </PlatformPageShell>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import PlatformPageShell from '@/components/PlatformPageShell.vue'
import { useLedgerStore } from '@/stores/ledger'
import { getApiErrorMessage } from '@/api/response'

const ledgerStore = useLedgerStore()
const { ledgerList, currentLedgerId, currentLedger, isLoading, errorMessage } = storeToRefs(ledgerStore)

const isCreating = ref(false)
const form = reactive({
  name: '',
  type: 'shared'
})

const typeOptions = [
  { label: 'Shared', value: 'shared' },
  { label: 'Family', value: 'family' },
  { label: 'Project', value: 'project' }
]

const currentLedgerName = computed(() => currentLedger.value?.name || '未选择账本')

const refreshLedgers = async () => {
  await ledgerStore.refreshLedgers()
}

const selectLedgerContext = (ledgerId) => {
  ledgerStore.selectLedger(ledgerId)
  ElMessage.success('已切换当前平台上下文')
}

const handleCreateLedger = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入账本名称')
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
    ElMessage.success('账本创建成功')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '创建账本失败'))
  } finally {
    isCreating.value = false
  }
}

ledgerStore.initializeLedgers()
</script>
