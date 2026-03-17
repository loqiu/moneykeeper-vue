import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useLedgerStore } from '@/stores/ledger'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { login, logout } from '@/api/modules/auth'
import { getApiErrorMessage } from '@/api/response'

export function useLogin() {
  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const ledgerStore = useLedgerStore()
  const notificationStore = useNotificationStore()

  const loginForm = ref({
    username: '',
    password: ''
  })

  const loginFormRef = ref(null)
  const loading = ref(false)

  const loginRules = {
    username: [
      { required: true, message: t('auth.validation.usernameRequired'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('auth.validation.passwordRequired'), trigger: 'blur' }
    ]
  }

  const handleLogin = async (formEl) => {
    if (!formEl) {
      return
    }

    const isValid = await formEl.validate().catch(() => false)
    if (!isValid) {
      return
    }

    loading.value = true
    try {
      const loginData = await login(loginForm.value)
      userStore.setUserInfo(loginData)
      await ledgerStore.initializeLedgers({ force: true })
      await notificationStore.initializeUnreadCount({ force: true })
      ElMessage.success(t('auth.messages.loginSuccess'))
      const redirectPath = route.query.redirect || '/accounting'
      router.push(redirectPath)
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, t('auth.messages.loginFailed')))
    } finally {
      loading.value = false
    }
  }

  const handleLogout = async () => {
    if (!userStore.token) {
      ledgerStore.resetLedgerState()
      notificationStore.resetNotificationState()
      userStore.clearUserInfo()
      router.push('/login')
      return
    }

    loading.value = true
    try {
      const result = await logout()
      if (result !== true) {
        ElMessage.error(t('auth.messages.logoutFailed'))
        return
      }

      ledgerStore.resetLedgerState()
      notificationStore.resetNotificationState()
      userStore.clearUserInfo()
      router.push('/login')
      ElMessage.success(t('auth.messages.logoutSuccess'))
    } catch (error) {
      if (error.response?.status !== 401) {
        ElMessage.error(getApiErrorMessage(error, t('auth.messages.logoutFailed')))
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loginForm,
    loginFormRef,
    loginRules,
    loading,
    handleLogin,
    handleLogout
  }
}