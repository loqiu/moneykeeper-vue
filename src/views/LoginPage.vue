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
            <span>{{ t('common.moneyKeeper') }}</span>
          </div>

          <div class="space-y-4">
            <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">{{ t('auth.loginPage.heroTitle') }}</h1>
            <p class="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              {{ t('auth.loginPage.heroDescription') }}
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
              <span>{{ t('auth.loginPage.tag') }}</span>
              </div>
              <div>
              <h2 class="text-3xl font-semibold tracking-tight text-slate-900">{{ t('auth.loginPage.welcomeTitle') }}</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">{{ t('auth.loginPage.welcomeDescription') }}</p>
              </div>
            </div>

          <div
            v-if="redirectHint"
            class="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900"
          >
            {{ t('auth.loginPage.redirectHint', { path: redirectHint }) }}
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="space-y-5"
            label-position="top"
            size="large"
          >
            <el-form-item :label="t('auth.loginPage.username')" prop="username" class="!mb-0">
              <el-input
                v-model="loginForm.username"
                :placeholder="t('auth.loginPage.usernamePlaceholder')"
                :prefix-icon="User"
                class="!h-12"
              />
            </el-form-item>

            <el-form-item :label="t('auth.loginPage.password')" prop="password" class="!mb-0">
              <el-input
                v-model="loginForm.password"
                type="password"
                :placeholder="t('auth.loginPage.passwordPlaceholder')"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin(loginFormRef)"
                class="!h-12"
              />
            </el-form-item>

            <div class="rounded-3xl bg-slate-900 px-4 py-4 text-white">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-medium">{{ t('auth.loginPage.ctaTitle') }}</div>
                  <div class="mt-1 text-xs text-slate-300">{{ t('auth.loginPage.ctaDescription') }}</div>
                </div>
                <el-button
                  type="primary"
                  :loading="loginLoading"
                  class="!rounded-full !border-0 !bg-amber-400 !px-6 !font-semibold !text-slate-900 hover:!bg-amber-300"
                  @click="handleLogin(loginFormRef)"
                >
                  {{ t('common.login') }}
                  <el-icon class="ml-1"><Right /></el-icon>
                </el-button>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500">{{ t('auth.loginPage.noAccount') }}</span>
              <button
                type="button"
                class="font-semibold text-slate-900 underline decoration-amber-300 decoration-2 underline-offset-4"
                @click="registerDialogVisible = true"
              >
                {{ t('auth.loginPage.registerNow') }}
              </button>
            </div>

            <div class="relative py-2">
              <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white px-3 text-slate-400">{{ t('auth.loginPage.orGoogle') }}</span>
              </div>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div class="flex flex-col items-center gap-3 text-center">
                <div class="text-sm font-medium text-slate-700">{{ t('auth.loginPage.thirdParty') }}</div>
                <div id="google-btn" class="google-button-shell min-h-[44px] w-full max-w-[320px]"></div>
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
          <h2 class="text-2xl font-semibold text-slate-900">{{ t('auth.loginPage.createAccount') }}</h2>
          <p class="text-sm text-slate-500">{{ t('auth.loginPage.createAccountDescription') }}</p>
        </div>
      </template>

      <div class="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside class="rounded-[36px] bg-slate-900 p-6 text-white">
          <div class="space-y-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
              <el-icon :size="22"><UserFilled /></el-icon>
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ t('auth.loginPage.createAccount') }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-300">{{ t('auth.loginPage.createAccountDescription') }}</p>
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
            <el-form-item :label="t('auth.loginPage.username')" prop="username" class="!mb-0">
              <el-input
                v-model="registerForm.username"
                :placeholder="t('auth.loginPage.usernameRangePlaceholder')"
                maxlength="50"
                show-word-limit
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item :label="t('auth.loginPage.password')" prop="password" class="!mb-0">
              <el-input
                v-model="registerForm.password"
                type="password"
                :placeholder="t('auth.loginPage.passwordMinPlaceholder')"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
          </div>

          <el-form-item :label="t('auth.loginPage.email')" prop="email" class="!mb-0">
              <el-input
                v-model="registerForm.email"
                :placeholder="t('auth.loginPage.emailPlaceholder')"
                maxlength="255"
                :prefix-icon="Message"
              />
          </el-form-item>

          <div class="grid gap-4 sm:grid-cols-2">
            <el-form-item :label="t('auth.loginPage.firstName')" prop="firstName" class="!mb-0">
              <el-input
                v-model="registerForm.firstName"
                :placeholder="t('auth.loginPage.firstNamePlaceholder')"
                maxlength="50"
              />
            </el-form-item>

            <el-form-item :label="t('auth.loginPage.lastName')" prop="lastName" class="!mb-0">
              <el-input
                v-model="registerForm.lastName"
                :placeholder="t('auth.loginPage.lastNamePlaceholder')"
                maxlength="50"
              />
            </el-form-item>
          </div>

          <el-form-item :label="t('auth.loginPage.phone')" prop="phoneNumber" class="!mb-0">
              <el-input
                v-model="registerForm.phoneNumber"
                :placeholder="t('auth.loginPage.phonePlaceholder')"
                maxlength="20"
                :prefix-icon="Phone"
              />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-left text-sm text-slate-500">{{ t('auth.loginPage.submitDescription') }}</div>
          <div class="flex justify-end gap-3">
            <el-button class="!rounded-full !px-5" @click="handleCancel">{{ t('common.cancel') }}</el-button>
            <el-button
              type="primary"
              :loading="registerLoading"
              @click="handleRegister(registerFormRef)"
              class="!rounded-full !border-0 !bg-slate-900 !px-6 hover:!bg-slate-800"
            >
              {{ t('common.register') }}
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
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

const heroStats = computed(() => ([
  {
    label: t('auth.loginPage.stats.workspace.label'),
    value: t('auth.loginPage.stats.workspace.value'),
    description: t('auth.loginPage.stats.workspace.description')
  },
  {
    label: t('auth.loginPage.stats.capability.label'),
    value: t('auth.loginPage.stats.capability.value'),
    description: t('auth.loginPage.stats.capability.description')
  },
  {
    label: t('auth.loginPage.stats.access.label'),
    value: t('auth.loginPage.stats.access.value'),
    description: t('auth.loginPage.stats.access.description')
  }
]))

const heroHighlights = computed(() => ([
  {
    title: t('auth.loginPage.highlights.flowTitle'),
    description: t('auth.loginPage.highlights.flowDescription'),
    icon: UserFilled
  },
  {
    title: t('auth.loginPage.highlights.categoryTitle'),
    description: t('auth.loginPage.highlights.categoryDescription'),
    icon: Check
  }
]))

const registerHighlights = computed(() => t('auth.loginPage.registerHighlights'))

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
    ElMessage.success(t('auth.messages.googleLoginSuccess'))

    const redirectPath = route.query.redirect || '/accounting'
    router.push(redirectPath)
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, t('auth.messages.googleLoginFailed')))
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
