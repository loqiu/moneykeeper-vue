import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { register as registerUser } from '@/api/modules/auth'
import { getApiErrorMessage } from '@/api/response'

export function useRegister() {
  const { t } = useI18n()
  const registerDialogVisible = ref(false)
  const loading = ref(false)
  const registerFormRef = ref(null)

  const registerForm = ref({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  })

  const rules = {
    username: [
      { required: true, message: t('auth.validation.usernameRequired'), trigger: 'blur' },
      { min: 3, max: 50, message: t('auth.validation.usernameRange'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('auth.validation.passwordRequired'), trigger: 'blur' },
      { min: 6, max: 255, message: t('auth.validation.passwordRange'), trigger: 'blur' }
    ],
    email: [
      { required: true, message: t('auth.validation.emailRequired'), trigger: 'blur' },
      { type: 'email', message: t('auth.validation.emailInvalid'), trigger: 'blur' },
      { max: 255, message: t('auth.validation.emailRange'), trigger: 'blur' }
    ],
    firstName: [
      { required: true, message: t('auth.validation.firstNameRequired'), trigger: 'blur' },
      { max: 50, message: t('auth.validation.firstNameRange'), trigger: 'blur' }
    ],
    lastName: [
      { required: true, message: t('auth.validation.lastNameRequired'), trigger: 'blur' },
      { max: 50, message: t('auth.validation.lastNameRange'), trigger: 'blur' }
    ],
    phoneNumber: [
      { required: true, message: t('auth.validation.phoneRequired'), trigger: 'blur' },
      { pattern: /^[0-9+\-\s]{5,20}$/, message: t('auth.validation.phoneInvalid'), trigger: 'blur' }
    ]
  }

  const resetForm = (formEl) => {
    if (!formEl) {
      return
    }

    formEl.resetFields()
  }

  const handleRegister = async (formEl) => {
    if (!formEl) {
      return
    }

    const isValid = await formEl.validate().catch(() => false)
    if (!isValid) {
      return
    }

    loading.value = true
    try {
      await registerUser(registerForm.value)
      ElMessage.success(t('auth.messages.registerSuccess'))
      registerDialogVisible.value = false
      resetForm(formEl)
    } catch (error) {
      ElMessage.error(getApiErrorMessage(error, t('auth.messages.registerFailed')))
    } finally {
      loading.value = false
    }
  }

  const handleCancel = () => {
    registerDialogVisible.value = false
    resetForm(registerFormRef.value)
  }

  return {
    registerDialogVisible,
    registerForm,
    registerFormRef,
    loading,
    rules,
    handleRegister,
    resetForm,
    handleCancel
  }
}
