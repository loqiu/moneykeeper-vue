<template>
  <div class="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#fff7ed_0%,#f8fafc_44%,#eef2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-0 top-0 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl"></div>
      <div class="absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"></div>
    </div>

    <div class="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1240px] gap-6 lg:grid-cols-[minmax(0,1.22fr)_460px] lg:items-center">
      <section class="rounded-[36px] border border-white/70 bg-slate-900 px-6 py-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10 lg:py-10">
        <div class="max-w-2xl space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-200 backdrop-blur">
            <el-icon><WalletFilled /></el-icon>
            <span>MoneyKeeper</span>
          </div>

          <div class="space-y-4">
            <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">登录后继续整理你的财务节奏</h1>
            <p class="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              在同一处完成记账、筛选、图表分析和导出。登录页现在和主应用使用同一套视觉语言，避免体验断层。
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <article
              v-for="item in heroStats"
              :key="item.label"
              class="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur"
            >
              <div class="text-xs uppercase tracking-[0.24em] text-slate-300">{{ item.label }}</div>
              <div class="mt-3 text-2xl font-semibold text-white">{{ item.value }}</div>
              <p class="mt-2 text-xs leading-5 text-slate-300">{{ item.description }}</p>
            </article>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="item in heroHighlights"
              :key="item.title"
              class="rounded-3xl border border-white/10 bg-white/5 p-4"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
                  <el-icon :size="18"><component :is="item.icon" /></el-icon>
                </div>
                <div>
                  <div class="text-sm font-semibold text-white">{{ item.title }}</div>
                  <p class="mt-1 text-xs leading-5 text-slate-300">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[36px] border border-white/75 bg-white/88 p-6 shadow-[0_22px_70px_rgba(148,163,184,0.16)] backdrop-blur sm:p-8">
        <div class="space-y-6">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <el-icon><Lock /></el-icon>
              <span>Account Access</span>
            </div>
            <div>
              <h2 class="text-3xl font-semibold tracking-tight text-slate-900">欢迎回来</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">登录后即可继续使用记账台、图表和导出能力。</p>
            </div>
          </div>

          <div
            v-if="redirectHint"
            class="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900"
          >
            登录后将继续前往：{{ redirectHint }}
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="space-y-5"
            label-position="top"
            size="large"
          >
            <el-form-item label="用户名" prop="username" class="!mb-0">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                class="!h-12"
              />
            </el-form-item>

            <el-form-item label="密码" prop="password" class="!mb-0">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin(loginFormRef)"
                class="!h-12"
              />
            </el-form-item>

            <div class="rounded-3xl bg-slate-900 px-4 py-4 text-white">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-medium">准备开始</div>
                  <div class="mt-1 text-xs text-slate-300">登录后会恢复你的记录、筛选和通知状态。</div>
                </div>
                <el-button
                  type="primary"
                  :loading="loginLoading"
                  class="!rounded-full !border-0 !bg-amber-400 !px-6 !font-semibold !text-slate-900 hover:!bg-amber-300"
                  @click="handleLogin(loginFormRef)"
                >
                  登录
                  <el-icon class="ml-1"><Right /></el-icon>
                </el-button>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500">还没有账户？</span>
              <button
                type="button"
                class="font-semibold text-slate-900 underline decoration-amber-300 decoration-2 underline-offset-4"
                @click="registerDialogVisible = true"
              >
                立即注册
              </button>
            </div>

            <div class="relative py-2">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white px-3 text-slate-400">或使用 Google 登录</span>
              </div>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div class="flex flex-col items-center gap-3 text-center">
                <div class="text-sm font-medium text-slate-700">第三方登录</div>
                <div id="google-btn" class="google-button-shell min-h-[44px] w-full max-w-[320px]"></div>
                <p class="text-xs leading-5 text-slate-500">如果后端已绑定 Google 登录接口，这里会直接复用同一套用户会话。</p>
              </div>
            </div>
          </el-form>
        </div>
      </section>
    </div>

    <el-dialog
      v-model="registerDialogVisible"
      width="760px"
      destroy-on-close
      class="register-dialog"
      :close-on-click-modal="false"
      align-center
    >
      <template #header>
        <div class="space-y-2 pr-8">
          <h2 class="text-2xl font-semibold text-slate-900">创建新账户</h2>
          <p class="text-sm text-slate-500">填写基础信息后即可进入记账页，后续再逐步完善你的数据习惯。</p>
        </div>
      </template>

      <div class="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside class="rounded-[36px] bg-slate-900 p-6 text-white">
          <div class="space-y-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
              <el-icon :size="22"><UserFilled /></el-icon>
            </div>
            <div>
              <h3 class="text-lg font-semibold">注册后可立即使用</h3>
              <p class="mt-2 text-sm leading-6 text-slate-300">收支记录、分类筛选、图表洞察和导出都会在同一账户下继续保留。</p>
            </div>
            <div class="space-y-3">
              <div v-for="item in registerHighlights" :key="item" class="flex items-center gap-2 text-sm text-slate-200">
                <el-icon class="text-amber-300"><Check /></el-icon>
                <span>{{ item }}</span>
              </div>
            </div>
          </div>
        </aside>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="rules"
          label-position="top"
          size="large"
          class="space-y-4"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item label="用户名" prop="username" class="!mb-0">
              <el-input
                v-model="registerForm.username"
                placeholder="3-50 个字符"
                maxlength="50"
                show-word-limit
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item label="密码" prop="password" class="!mb-0">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="至少 6 位"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
          </div>

          <el-form-item label="邮箱" prop="email" class="!mb-0">
            <el-input
              v-model="registerForm.email"
              placeholder="example@email.com"
              maxlength="255"
              :prefix-icon="Message"
            />
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item label="名字" prop="firstName" class="!mb-0">
              <el-input
                v-model="registerForm.firstName"
                placeholder="First Name"
                maxlength="50"
              />
            </el-form-item>

            <el-form-item label="姓氏" prop="lastName" class="!mb-0">
              <el-input
                v-model="registerForm.lastName"
                placeholder="Last Name"
                maxlength="50"
              />
            </el-form-item>
          </div>

          <el-form-item label="手机号" prop="phoneNumber" class="!mb-0">
            <el-input
              v-model="registerForm.phoneNumber"
              placeholder="请输入手机号"
              maxlength="20"
              :prefix-icon="Phone"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-left text-sm text-slate-500">提交后即可返回登录并使用新账户进入记账页。</div>
          <div class="flex justify-end gap-3">
            <el-button class="!rounded-full !px-5" @click="handleCancel">取消</el-button>
            <el-button
              type="primary"
              :loading="registerLoading"
              @click="handleRegister(registerFormRef)"
              class="!rounded-full !border-0 !bg-slate-900 !px-6 hover:!bg-slate-800"
            >
              创建账户
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Check, Lock, Message, Phone, Right, User, UserFilled, WalletFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { googleLogin } from '@/api/modules/auth'
import { getApiErrorMessage } from '@/api/response'
import { useGoogleLogin } from '@/composables/useGoogleLogin'
import { useLogin } from '@/composables/useLogin'
import { useRegister } from '@/composables/useRegister'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const heroStats = [
  {
    label: '统一入口',
    value: '1 处',
    description: '登录后进入同一套记账、筛选和分析工作台。'
  },
  {
    label: '核心能力',
    value: '4 项',
    description: '记录、筛选、图表和导出已串成完整主流程。'
  },
  {
    label: '访问方式',
    value: '2 种',
    description: '支持用户名密码和 Google 登录。'
  }
]

const heroHighlights = [
  {
    title: '更清晰的记账主线',
    description: '新增、筛选、洞察和明细不再分散在不同风格的页面里。',
    icon: UserFilled
  },
  {
    title: '更稳定的分类模型',
    description: '分类 ID 和分类名已经拆开，后续联动和编辑更稳定。',
    icon: Check
  }
]

const registerHighlights = [
  '完成后即可进入记账页',
  '支持后续按分类与时间追踪',
  '可继续使用导出与支付入口'
]

const redirectHint = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect && redirect !== '/accounting'
    ? redirect
    : ''
})

const handleGoogleSuccess = async (response) => {
  try {
    const loginData = await googleLogin(response.credential)
    userStore.setUserInfo(loginData)
    ElMessage.success('Google 登录成功')

    const redirectPath = route.query.redirect || '/accounting'
    router.push(redirectPath)
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, 'Google 登录失败'))
  }
}

const { renderGoogleButton } = useGoogleLogin(handleGoogleSuccess)

onMounted(() => {
  renderGoogleButton('google-btn', {
    width: '320'
  })
})

const {
  loginForm,
  loginFormRef,
  loginRules,
  loading: loginLoading,
  handleLogin
} = useLogin()

const {
  registerDialogVisible,
  registerForm,
  registerFormRef,
  loading: registerLoading,
  rules,
  handleRegister,
  handleCancel
} = useRegister()
</script>

<style scoped>
:deep(.el-input__wrapper) {
  box-shadow: inset 0 0 0 1px #e2e8f0;
  padding: 8px 12px;
  border-radius: 18px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: inset 0 0 0 2px #0f172a !important;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #334155;
}

:deep(.register-dialog .el-dialog) {
  border-radius: 36px;
}

button {
  outline: none;
}
</style>